import { readFileSync } from 'fs'
import { ProxyAgent } from 'undici'
import { CONTENT_TYPES } from '../config/constants'
import {
  readBodyFromFile,
  getContentTypeFromExtension,
  parseFormField,
} from '../../lib/utils/file'
import { applyCookieHeader } from './cookies'
import { logger } from '../../lib/utils/logger'
import { withRetry } from '../../lib/utils/retry'
import { parseIntOption, formatBytes } from '../../lib/utils/parse'
import {
  type FetchOptions,
  type CurlyRequestInit,
  type ResponseData,
  isError,
  getErrorMessage,
} from '../../types'

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
export async function curl(
  url: string,
  options: FetchOptions,
  externalSignal?: AbortSignal,
): Promise<{ response: Response; duration: number }> {
  const fetchOptions = buildFetchOptions(options)
  const timeoutMs = parseIntOption(options.timeout, 0) || undefined
  const { signal: timeoutSignal, cleanup } = createTimeoutSignal(timeoutMs)
  const maxRedirects = getMaxRedirects(options)

  // Combine timeout signal with external signal if both exist
  const signal = combineSignals(timeoutSignal, externalSignal)
  if (signal) {
    fetchOptions.signal = signal
  }

  const finalUrl = buildUrl(url, options.query)
  logger().verbose('request', `${fetchOptions.method} ${finalUrl}`)

  if (fetchOptions.headers && Object.keys(fetchOptions.headers).length > 0) {
    logger().verbose('request', `Headers: ${JSON.stringify(fetchOptions.headers)}`)
  }

  if (fetchOptions.body) {
    logger().verbose('request', `Body: ${fetchOptions.body}`)
  }

  const retryOptions = {
    maxRetries: parseIntOption(options.retry, 0),
    baseDelay: parseIntOption(options['retry-delay'], 1000),
  }

  const proxyAgent = createProxyAgent(options.proxy)

  try {
    return await withRetry(async () => {
      const startTime = performance.now()
      const response = await executeFetch(finalUrl, fetchOptions, maxRedirects, proxyAgent)
      const duration = performance.now() - startTime
      logger().verbose(
        'response',
        `${response.status} ${response.statusText} (${duration.toFixed(0)}ms)`,
      )
      return { response, duration }
    }, retryOptions)
  } catch (error: unknown) {
    if (isError(error) && error.name === 'AbortError') {
      logger().error(`Request timed out after ${timeoutMs}ms`)
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

  // Combine both signals using AbortSignal.any if available (Node 20+)
  if ('any' in AbortSignal) {
    return AbortSignal.any([timeoutSignal, externalSignal])
  }

  // Fallback: create a new controller that aborts when either signal aborts
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

async function executeFetch(
  url: string,
  fetchOptions: CurlyRequestInit,
  maxRedirects: number,
  proxyAgent?: ProxyAgent,
): Promise<Response> {
  let currentUrl = url
  let redirectCount = 0

  while (true) {
    const requestOptions = proxyAgent
      ? { ...fetchOptions, dispatcher: proxyAgent }
      : fetchOptions
    const response = await fetch(currentUrl, requestOptions as RequestInit)

    if (!isRedirectStatus(response.status)) {
      return response
    }

    if (redirectCount >= maxRedirects) {
      if (maxRedirects === 0) return response
      throw new Error(`Maximum redirects (${maxRedirects}) exceeded`)
    }

    const location = response.headers.get('Location')
    if (!location) return response

    currentUrl = new URL(location, currentUrl).href
    redirectCount++
    logger().verbose(
      'redirect',
      `Following redirect ${redirectCount}/${maxRedirects} → ${currentUrl}`,
    )
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
  response,
  duration,
}: {
  response: Response
  duration: number
}): Promise<ResponseData> {
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
    if (!q.includes('=')) {
      logger().error(`query params must be valid (e.g., -q foo=bar).`)
    }

    const [key, value] = q.split('=')
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
      const fileBuffer = readFileSync(parsed.value)
      const mimeType = getContentTypeFromExtension(parsed.value) ?? 'application/octet-stream'
      const blob = new Blob([fileBuffer], { type: mimeType })

      formData.append(parsed.name, blob, parsed.filename)
      logger().verbose('form', `Added file field: ${parsed.name} = ${parsed.filename} (${mimeType})`)
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
    (options.form && options.form.length > 0)
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
  if (!options.headers && (options.data || options['data-raw'])) {
    if (options.data?.length === 1 && options.data[0].startsWith('@')) {
      const filePath = options.data[0].slice(1)
      const contentType = getContentTypeFromExtension(filePath) ?? 'application/json'
      return { 'Content-Type': contentType }
    }
    return { 'Content-Type': 'application/json' }
  }

  const headers: Record<string, string> = options?.headers?.reduce(
    (obj: Record<string, string>, h: string) => {
      if (!h.includes(':')) {
        logger().error('Headers are improperly formatted.')
      } else if (h.toLowerCase().includes('cookie')) {
        const [name, value] = h.split(/:(.+)/).map((part) => part.trim())
        return { ...obj, [name]: value }
      }

      const [key, value] = h.split(':')
      return { ...obj, [key.trim()]: value.trim() }
    },
    {},
  ) ?? {}

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

export function buildBody(options: FetchOptions): string | undefined {
  if ((!options.data || options.data.length === 0) && !options['data-raw']) return undefined

  if (options['data-raw']) {
    return options['data-raw']
  } else if (options.data) {
    if (options.data.length === 1 && options.data[0].startsWith('@')) {
      const filePath = options.data[0].slice(1)
      return readBodyFromFile(filePath)
    }

    const formattedData = options.data.reduce<Record<string, string>>((obj, d) => {
      if (!d.includes('=')) {
        logger().error('data must be formatted correctly (e.g., key1=value1).')
      }

      const [key, value] = d.split('=')
      obj[key] = value
      return obj
    }, {})

    return JSON.stringify(formattedData)
  }

  return undefined
}
