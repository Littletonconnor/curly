import { readFileSync } from 'fs'
import { performance as perf } from 'node:perf_hooks'
import { styleText } from 'node:util'
import { ProxyAgent } from 'undici'
import {
  getContentTypeFromExtension,
  parseFormField,
  readBodyFromFile,
  readFileAsBuffer,
} from '../../lib/utils/file'
import { logger } from '../../lib/utils/logger'
import { formatBytes, parseIntOption } from '../../lib/utils/parse'
import { withRetry } from '../../lib/utils/retry'
import {
  type CurlyRequestInit,
  type FetchOptions,
  type ResponseData,
  type TimingData,
  getErrorMessage,
  isError,
} from '../../types'
import { getFriendlyErrorMessage } from '../../lib/utils/errors'
import { CONTENT_TYPES, TIMEOUT_EXIT_CODE } from '../config/constants'
import { applyCookieHeader } from './cookies'

export type { FetchOptions } from '../../types'

/**
 * Executes an HTTP request using the Fetch API with support for timeouts,
 * retries, redirects, proxies, and verbose logging.
 *
 * @param url - The URL to request
 * @param options - Configuration options including method, headers, body, timeout, etc.
 * @param externalSignal - Optional external abort signal (e.g., from TUI pause)
 * @returns The raw Response object and request duration in milliseconds
 */
export interface CurlResult {
  response: Response
  duration: number
  urlEffective: string
  numRedirects: number
  redirectUrl?: string
  redirectChain: RedirectHop[]
  timing?: TimingData
}

export async function curl(
  url: string,
  options: FetchOptions,
  externalSignal?: AbortSignal,
): Promise<CurlResult> {
  const fetchOptions = buildFetchOptions(options)
  const timeoutMs = parseIntOption(options.timeout, 0) || undefined
  const { signal: timeoutSignal, cleanup } = createTimeoutSignal(timeoutMs)
  const maxRedirects = getMaxRedirects(options)

  const signal = combineSignals(timeoutSignal, externalSignal)
  if (signal) {
    fetchOptions.signal = signal
  }

  const finalUrl = buildUrl(url, options.query)
  logger().verbose('request', `${colorizeMethod(fetchOptions.method)} ${finalUrl}`)

  if (fetchOptions.headers && Object.keys(fetchOptions.headers).length > 0) {
    logger().verbose('request', `Headers: ${JSON.stringify(fetchOptions.headers)}`)
  }

  if (fetchOptions.body) {
    logger().verbose('request', `Body: ${fetchOptions.body}`)
  }

  const retryOptions = {
    maxRetries: parseIntOption(options.retry, 0),
    baseDelay: parseIntOption(options['retry-delay'], 1000),
    ...(options['retry-all-errors'] && {
      shouldRetryResult: (result: unknown) => {
        const r = result as CurlResult
        return r.response.status >= 400
      },
    }),
  }

  const proxyAgent = createProxyAgent(options.proxy)

  try {
    return await withRetry(async () => {
      const startTime = performance.now()
      const result = await executeFetch(finalUrl, fetchOptions, maxRedirects, proxyAgent)
      const timeStarttransfer = performance.now() - startTime
      const duration = timeStarttransfer

      const timing = collectResourceTiming(finalUrl, startTime)

      logger().verbose(
        'response',
        `${result.response.status} ${result.response.statusText} (${duration.toFixed(0)}ms)`,
      )
      return {
        response: result.response,
        duration,
        urlEffective: result.urlEffective,
        numRedirects: result.numRedirects,
        redirectUrl: result.redirectUrl,
        redirectChain: result.redirectChain,
        timing: {
          ...timing,
          timeStarttransfer,
        },
      }
    }, retryOptions)
  } catch (error: unknown) {
    if (isError(error) && error.name === 'AbortError') {
      const wasExternalAbort = externalSignal?.aborted
      if (!wasExternalAbort && timeoutMs) {
        logger().error(`Request timed out after ${timeoutMs}ms`, TIMEOUT_EXIT_CODE)
      }
      throw error
    }
    const cause = isError(error) && 'cause' in error ? error.cause : error
    const friendly = getFriendlyErrorMessage(cause) ?? getFriendlyErrorMessage(error)
    if (friendly) {
      logger().error(friendly)
    }
    logger().error(`Fetch response failed: ${getErrorMessage(error)}`)
    throw error
  } finally {
    cleanup()
  }
}

interface TimeoutSignalResult {
  signal: AbortSignal | undefined
  cleanup: () => void
}

function createTimeoutSignal(timeoutMs: number | undefined): TimeoutSignalResult {
  if (!timeoutMs) {
    return { signal: undefined, cleanup: () => {} }
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  logger().verbose('timeout', `Request will timeout after ${timeoutMs}ms`)

  return {
    signal: controller.signal,
    cleanup: () => clearTimeout(timeoutId),
  }
}

function combineSignals(
  timeoutSignal: AbortSignal | undefined,
  externalSignal: AbortSignal | undefined,
): AbortSignal | undefined {
  if (!timeoutSignal && !externalSignal) return undefined
  if (!timeoutSignal) return externalSignal
  if (!externalSignal) return timeoutSignal

  if ('any' in AbortSignal) {
    return AbortSignal.any([timeoutSignal, externalSignal])
  }

  const controller = new AbortController()
  const abort = () => controller.abort()

  timeoutSignal.addEventListener('abort', abort)
  externalSignal.addEventListener('abort', abort)

  if (timeoutSignal.aborted || externalSignal.aborted) {
    controller.abort()
  }

  return controller.signal
}

function getMaxRedirects(options: FetchOptions): number {
  if (!options.follow) return 0
  return parseIntOption(options['max-redirects'], 20)
}

function createProxyAgent(proxyUrl: string | undefined): ProxyAgent | undefined {
  if (!proxyUrl) {
    return undefined
  }

  logger().verbose('proxy', `Using proxy: ${proxyUrl}`)
  return new ProxyAgent(proxyUrl)
}

export interface RedirectHop {
  status: number
  from: string
  to: string
  methodChanged: boolean
  method: string
}

export interface FetchResult {
  response: Response
  urlEffective: string
  numRedirects: number
  redirectUrl?: string
  redirectChain: RedirectHop[]
}

/**
 * Returns true for redirect status codes that should change the method to GET
 * and drop the request body (301, 302, 303). Per HTTP spec, 307/308 must
 * preserve the original method and body.
 */
function shouldRewriteMethod(status: number): boolean {
  return status === 301 || status === 302 || status === 303
}

async function executeFetch(
  url: string,
  fetchOptions: CurlyRequestInit,
  maxRedirects: number,
  proxyAgent?: ProxyAgent,
): Promise<FetchResult> {
  let currentUrl = url
  let redirectCount = 0
  let lastRedirectUrl: string | undefined
  let currentMethod = fetchOptions.method
  let currentBody = fetchOptions.body
  const redirectChain: RedirectHop[] = []

  while (true) {
    const hopOptions = { ...fetchOptions, method: currentMethod, body: currentBody }
    const requestOptions = proxyAgent ? { ...hopOptions, dispatcher: proxyAgent } : hopOptions
    const response = await fetch(currentUrl, requestOptions as RequestInit)

    if (!isRedirectStatus(response.status)) {
      return {
        response,
        urlEffective: currentUrl,
        numRedirects: redirectCount,
        redirectUrl: lastRedirectUrl,
        redirectChain,
      }
    }

    if (redirectCount >= maxRedirects) {
      const location = response.headers.get('Location')
      const nextUrl = location ? new URL(location, currentUrl).href : undefined
      if (maxRedirects === 0)
        return {
          response,
          urlEffective: currentUrl,
          numRedirects: redirectCount,
          redirectUrl: nextUrl,
          redirectChain,
        }
      throw new Error(`Maximum redirects (${maxRedirects}) exceeded`)
    }

    const location = response.headers.get('Location')
    if (!location)
      return {
        response,
        urlEffective: currentUrl,
        numRedirects: redirectCount,
        redirectUrl: lastRedirectUrl,
        redirectChain,
      }

    lastRedirectUrl = new URL(location, currentUrl).href

    // Per HTTP spec: 301/302/303 rewrite to GET and drop body.
    // 307/308 preserve the original method and body.
    const methodChanged = shouldRewriteMethod(response.status) && currentMethod !== 'GET'
    if (shouldRewriteMethod(response.status)) {
      currentMethod = 'GET'
      currentBody = undefined
    }

    redirectCount++
    const hop: RedirectHop = {
      status: response.status,
      from: currentUrl,
      to: lastRedirectUrl,
      methodChanged,
      method: currentMethod,
    }
    redirectChain.push(hop)

    logger().verbose(
      'redirect',
      `${response.status} ${currentUrl} → ${lastRedirectUrl}${methodChanged ? ` (method changed to ${currentMethod})` : ''}`,
    )

    currentUrl = lastRedirectUrl
  }
}

function isRedirectStatus(status: number): boolean {
  return status >= 300 && status < 400
}

/**
 * Parses a Response object and extracts the body based on Content-Type.
 * Automatically handles JSON, text, form data, and binary responses.
 *
 * @param response - The raw Response object from fetch
 * @param duration - Request duration in milliseconds
 * @returns Parsed response data including body, headers, status, and size
 */
export async function buildResponse({
  options,
  response,
  duration,
  urlEffective,
  numRedirects,
  redirectUrl,
  timing,
}: {
  options: FetchOptions
  response: Response
  duration: number
  urlEffective?: string
  numRedirects?: number
  redirectUrl?: string
  timing?: TimingData
}): Promise<ResponseData> {
  const method = buildMethod(options)
  if (method === 'HEAD') {
    return {
      response: null,
      duration,
      headers: response.headers,
      status: response.status,
      size: '0 B',
      urlEffective,
      numRedirects,
      redirectUrl,
      timing,
    }
  }

  const contentType = response.headers.get('content-type') ?? ''
  const size = await getResponseSize(response)

  logger().verbose('response', `Content-Type: ${contentType || '(not specified)'}`)
  logger().verbose('response', `Size: ${size}`)

  let data: unknown
  if (CONTENT_TYPES.json.includes(contentType)) {
    data = await response.json()
  } else if (CONTENT_TYPES.arrayBuffer.includes(contentType)) {
    data = await response.arrayBuffer()
  } else if (CONTENT_TYPES.formData.includes(contentType)) {
    data = await response.formData()
  } else if (CONTENT_TYPES.text.includes(contentType)) {
    data = await response.text()
  } else {
    logger().verbose('response', 'Inferring content type from response body...')
    data = await inferContentType(response)
  }

  return {
    response: data,
    duration,
    headers: response.headers,
    status: response.status,
    size,
    urlEffective,
    numRedirects,
    redirectUrl,
    timing,
  }
}

async function getResponseSize(response: Response): Promise<string> {
  const clonedResponse = response.clone()
  const text = await clonedResponse.text()
  const bytes = Buffer.byteLength(text)
  return formatBytes(bytes)
}

async function inferContentType(response: Response): Promise<unknown> {
  try {
    return await response.clone().json()
  } catch {
    return response.text()
  }
}

export function buildUrl(url: string, queryParams: FetchOptions['query']): string {
  if (!queryParams) {
    return url
  }

  const urlWithQueryParams = new URL(url)

  for (const q of queryParams) {
    const eqIdx = q.indexOf('=')
    if (eqIdx === -1) {
      logger().error(
        `Invalid query parameter: "${q}". Expected "key=value" (e.g., -q "search=hello")`,
      )
    }

    const key = q.slice(0, eqIdx)
    const value = q.slice(eqIdx + 1)
    urlWithQueryParams.searchParams.append(key, value)
  }

  return urlWithQueryParams.href
}

export function buildFetchOptions(options: FetchOptions): CurlyRequestInit {
  if (options.form && options.form.length > 0) {
    const headers = buildHeaders(options)
    delete headers['Content-Type']

    return {
      method: buildMethod(options),
      headers,
      body: buildFormData(options.form),
      redirect: 'manual' as const,
    }
  }

  return {
    method: buildMethod(options),
    headers: buildHeaders(options),
    body: buildBody(options),
    redirect: 'manual' as const,
  }
}

/**
 * Builds a FormData object from -F form field arguments.
 * Handles both plain text fields and file uploads.
 */
export function buildFormData(formFields: string[]): FormData {
  const formData = new FormData()

  for (const field of formFields) {
    const parsed = parseFormField(field)

    if (parsed.isFile) {
      const fileBuffer = readFileAsBuffer(parsed.value)
      const mimeType = getContentTypeFromExtension(parsed.value) ?? 'application/octet-stream'
      const blob = new Blob([fileBuffer], { type: mimeType })

      formData.append(parsed.name, blob, parsed.filename)
      logger().verbose(
        'form',
        `Added file field: ${parsed.name} = ${parsed.filename} (${mimeType})`,
      )
    } else {
      formData.append(parsed.name, parsed.value)
      logger().verbose('form', `Added text field: ${parsed.name} = ${parsed.value}`)
    }
  }

  return formData
}

export function buildMethod(options: FetchOptions): string {
  if (options.head) {
    return 'HEAD'
  } else if (options.method) {
    return options.method
  } else if (
    (options.data && options.data.length > 0) ||
    options['data-raw'] ||
    (options.form && options.form.length > 0) ||
    (options['data-urlencode'] && options['data-urlencode'].length > 0)
  ) {
    return 'POST'
  } else {
    return 'GET'
  }
}

/**
 * Builds up fetch headers object.
 *
 * If a POST / PUT request is made without any headers, our heuristic is to treat the content-type as application/json.
 * Otherwise we will just iterate over the headers you provide us and pass those along to fetch.
 *
 * Example(s)
 * curly --data-raw '{"userId": "1"}' -X POST https://jsonplaceholder.typicode.com/todos
 * headers created: {'Content-Type': 'application/json'}
 *
 * curly --data-raw '{"userId": "1"}' -X -H 'Content-type: application/json' -H 'foo:bar' POST https://jsonplaceholder.typicode.com/todos
 * headers created: {'Content-Type': 'application/json', 'foo': 'bar'}
 *
 * curly --data-raw '{"userId": "1"}' -X -H 'Content-type: application/json' -H 'Cookie: VALUE1;VALUE2' -H 'foo:bar' POST https://jsonplaceholder.typicode.com/todos
 * headers created: {'Content-Type': 'application/json', 'foo': 'bar', 'cookie': 'VALUE1;VALUE2'}
 */
export function buildHeaders(options: FetchOptions): Record<string, string> {
  if (!options.headers && (options.data || options['data-raw'] || options['data-urlencode'])) {
    if (options['data-urlencode'] && options['data-urlencode'].length > 0) {
      return { 'Content-Type': 'application/x-www-form-urlencoded' }
    }
    if (options.data?.length === 1 && options.data[0].startsWith('@')) {
      const filePath = options.data[0].slice(1)
      const contentType = getContentTypeFromExtension(filePath) ?? 'application/json'
      return { 'Content-Type': contentType }
    }
    return { 'Content-Type': 'application/json' }
  }

  const headers: Record<string, string> =
    options?.headers?.reduce((obj: Record<string, string>, h: string) => {
      const colonIdx = h.indexOf(':')
      if (colonIdx === -1) {
        logger().error(
          `Invalid header format: "${h}". Expected "Key: Value" (e.g., -H "Content-Type: application/json")`,
        )
      }

      const key = h.slice(0, colonIdx).trim()
      const value = h.slice(colonIdx + 1).trim()
      return { ...obj, [key]: value }
    }, {}) ?? {}

  return {
    ...headers,
    ...buildCookieHeaders(options),
    ...buildAuthHeader(options),
  }
}

/**
 * Builds cookie headers from command-line options.
 *
 * This deviates from curl's behavior for better user experience:
 * - curl uses -b <data|filename> and determines file vs data by presence of '='
 * - We allow multiple key=value pairs that we concatenate automatically
 * - File input requires exactly one cookie argument
 */
export function buildCookieHeaders(options: FetchOptions): Record<string, string> | undefined {
  if (!options.cookie || options.cookie.length === 0) {
    return undefined
  }

  const firstCookieValue = options.cookie[0]

  if (firstCookieValue.includes('=')) {
    return buildCookieHeaderFromKeyValuePairs(options.cookie)
  } else {
    return buildCookieHeaderFromFile(options.cookie)
  }
}

function buildCookieHeaderFromKeyValuePairs(cookieValues: string[]): { Cookie: string } {
  const invalidCookies = cookieValues.filter((cookie) => !cookie.includes('='))

  if (invalidCookies.length > 0) {
    logger().error(`Invalid cookie format. Expected key=value, got: ${invalidCookies.join(', ')}`)
  }

  const cookieString = cookieValues.join('; ')
  logger().verbose('cookies', `Sending cookies: ${cookieString}`)
  return { Cookie: cookieString }
}

function buildCookieHeaderFromFile(cookiePaths: string[]): { Cookie: string } | undefined {
  if (cookiePaths.length !== 1) {
    logger().error('When reading cookies from a file, provide exactly one file path')
  }

  const cookiePath = cookiePaths[0]
  try {
    logger().verbose('cookies', `Reading cookies from file: ${cookiePath}`)
    const cookieContent = readFileSync(cookiePath, 'utf8')
    const cookieHeader = applyCookieHeader(cookieContent)
    logger().verbose('cookies', `Loaded cookies: ${cookieHeader}`)
    return { Cookie: cookieHeader }
  } catch {
    logger().warn(`Failed to read cookie file: ${cookiePath}`)
    return undefined
  }
}

function buildAuthHeader(options: FetchOptions): { Authorization: string } | undefined {
  if (!options.user) {
    return undefined
  }

  if (!options.user.includes(':')) {
    logger().error('Basic auth credentials must be in format user:password')
  }

  const encoded = Buffer.from(options.user).toString('base64')
  logger().verbose('auth', `Using basic authentication for user: ${options.user.split(':')[0]}`)
  return { Authorization: `Basic ${encoded}` }
}

/**
 * Builds a URL-encoded request body from --data-urlencode entries.
 * Supported entry forms (matching curl's behavior):
 *   "content"       → encode content as-is, no name prefix
 *   "=content"      → encode content, no name prefix (explicit form)
 *   "name=value"    → name=<encoded value> (name stays literal)
 *   "@file"         → read file, encode contents, no name prefix
 *   "name@file"     → name=<encoded file contents>
 * Multiple entries are joined with '&'.
 */
export function buildUrlEncodedBody(entries: string[]): string {
  return entries.map(encodeDataUrlencodeEntry).join('&')
}

function encodeDataUrlencodeEntry(entry: string): string {
  const eqIdx = entry.indexOf('=')
  const atIdx = entry.indexOf('@')

  // No separator: encode the entire entry as the value
  if (eqIdx === -1 && atIdx === -1) {
    return encodeURIComponent(entry)
  }

  // Split on the earliest separator. '=' means the rest is a literal value;
  // '@' means the rest is a file path whose contents become the value.
  const useEquals = eqIdx !== -1 && (atIdx === -1 || eqIdx < atIdx)
  const sepIdx = useEquals ? eqIdx : atIdx
  const name = entry.slice(0, sepIdx)
  const rest = entry.slice(sepIdx + 1)
  const value = useEquals ? rest : readBodyFromFile(rest)
  const encoded = encodeURIComponent(value)

  // Empty name (e.g. "=content" or "@file") → no prefix
  return name ? `${name}=${encoded}` : encoded
}

export function buildBody(options: FetchOptions): string | undefined {
  if (options['data-urlencode'] && options['data-urlencode'].length > 0) {
    return buildUrlEncodedBody(options['data-urlencode'])
  }

  if ((!options.data || options.data.length === 0) && !options['data-raw']) return undefined

  if (options['data-raw']) {
    return options['data-raw']
  } else if (options.data) {
    if (options.data.length === 1 && options.data[0].startsWith('@')) {
      const filePath = options.data[0].slice(1)
      return readBodyFromFile(filePath)
    }

    const formattedData = options.data.reduce<Record<string, string>>((obj, d) => {
      const eqIdx = d.indexOf('=')
      if (eqIdx === -1) {
        logger().error(
          `Invalid data format: "${d}". Expected "key=value" (e.g., -d "name=John" -d "age=28")`,
        )
      }

      const key = d.slice(0, eqIdx)
      const value = d.slice(eqIdx + 1)
      obj[key] = value
      return obj
    }, {})

    return JSON.stringify(formattedData)
  }

  return undefined
}

type StyleColor = Parameters<typeof styleText>[0]

const METHOD_COLORS: Record<string, StyleColor> = {
  GET: 'green',
  POST: 'blue',
  PUT: 'yellow',
  PATCH: 'yellow',
  DELETE: 'red',
  HEAD: 'cyan',
  OPTIONS: 'magenta',
}

function colorizeMethod(method: string): string {
  if ('NO_COLOR' in process.env) return method
  const color = METHOD_COLORS[method.toUpperCase()] ?? 'white'
  return styleText(color, method)
}

interface ResourceTimingEntry {
  name: string
  startTime: number
  domainLookupEnd: number
  connectEnd: number
}

/**
 * Attempts to collect DNS and connection timing from Node.js performance resource entries.
 * Falls back gracefully if resource timing data is not available.
 */
function collectResourceTiming(
  url: string,
  _startTime: number,
): Pick<TimingData, 'timeNamelookup' | 'timeConnect'> {
  try {
    const entries = perf.getEntriesByType('resource') as unknown as ResourceTimingEntry[]
    const entry = entries.findLast((e) => e.name === url)

    if (entry) {
      perf.clearResourceTimings()
      return {
        timeNamelookup: entry.domainLookupEnd - entry.startTime,
        timeConnect: entry.connectEnd - entry.startTime,
      }
    }
  } catch {
    // Resource timing not available
  }

  return {}
}
