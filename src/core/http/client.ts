import { readFileSync } from 'fs'
import { cli } from '../../lib/cli/parser'
import { CONTENT_TYPES } from '../config/constants'
import { isValidJson, readBodyFromFile, getContentTypeFromExtension } from '../../lib/utils/file'
import { applyCookieHeader } from './cookies'
import { logger } from '../../lib/utils/logger'
import { withRetry } from '../../lib/utils/retry'

export type FetchOptions = ReturnType<typeof cli>['values']

export async function curl(url: string, options: FetchOptions) {
  const fetchOptions = buildFetchOptions(options)
  const timeoutMs = options.timeout ? parseInt(options.timeout, 10) : undefined
  const { signal, cleanup } = createTimeoutSignal(timeoutMs)
  const maxRedirects = getMaxRedirects(options)

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
    maxRetries: options.retry ? parseInt(options.retry, 10) : 0,
    baseDelay: options['retry-delay'] ? parseInt(options['retry-delay'], 10) : 1000,
  }

  try {
    return await withRetry(async () => {
      const startTime = performance.now()
      const response = await executeFetch(finalUrl, fetchOptions, maxRedirects)
      const duration = performance.now() - startTime
      logger().verbose(
        'response',
        `${response.status} ${response.statusText} (${duration.toFixed(0)}ms)`,
      )
      return { response, duration }
    }, retryOptions)
  } catch (e: any) {
    if (e.name === 'AbortError') {
      logger().error(`Request timed out after ${timeoutMs}ms`)
    }
    logger().error(`Fetch response failed: ${e.message}`)
    throw e
  } finally {
    cleanup()
  }
}

function createTimeoutSignal(timeoutMs: number | undefined) {
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

function getMaxRedirects(options: FetchOptions): number {
  if (!options.follow) return 0
  if (options['max-redirects']) return parseInt(options['max-redirects'], 10)
  return 20
}

async function executeFetch(
  url: string,
  fetchOptions: RequestInit,
  maxRedirects: number,
): Promise<Response> {
  let currentUrl = url
  let redirectCount = 0

  while (true) {
    const response = await fetch(currentUrl, fetchOptions)

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

export async function buildResponse({
  response,
  duration,
}: {
  response: Response
  duration: number
}) {
  const contentType = response.headers.get('content-type') ?? ''
  const size = await getResponseSize(response)

  logger().verbose('response', `Content-Type: ${contentType || '(not specified)'}`)
  logger().verbose('response', `Size: ${size}`)

  let data
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

async function getResponseSize(response: Response) {
  const clonedResponse = response.clone()
  const text = await clonedResponse.text()
  const bytes = Buffer.byteLength(text)
  return formatBytes(bytes)
}

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`
  } else if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  } else {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }
}

async function inferContentType(response: Response) {
  try {
    return await response.clone().json()
  } catch {
    return response.text()
  }
}

export function buildUrl(url: string, queryParams: FetchOptions['query']) {
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

// TODO: Fix this type issue
export function buildFetchOptions(options: FetchOptions): any {
  return {
    method: buildMethod(options),
    headers: buildHeaders(options),
    body: buildBody(options),
    redirect: 'manual' as const,
  }
}

export function buildMethod(options: FetchOptions) {
  if (options.method) {
    return options.method
  } else if ((options.data && options.data.length > 0) || options['data-raw']) {
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
export function buildHeaders(options: FetchOptions) {
  if (!options.headers && (options.data || options['data-raw'])) {
    if (options.data?.length === 1 && options.data[0].startsWith('@')) {
      const filePath = options.data[0].slice(1)
      const contentType = getContentTypeFromExtension(filePath) ?? 'application/json'
      return { 'Content-Type': contentType }
    }
    return { 'Content-Type': 'application/json' }
  }

  const headers = options?.headers?.reduce((obj, h) => {
    if (!h.includes(':')) {
      logger().error('Headers are improperly formatted.')
    } else if (h.toLowerCase().includes('cookie')) {
      const [name, value] = h.split(/:(.+)/).map((part) => part.trim())
      return { ...obj, [name]: value }
    }

    const [key, value] = h.split(':')
    return { ...obj, [key.trim()]: value.trim() }
  }, {})

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
export function buildCookieHeaders(options: FetchOptions) {
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

function buildCookieHeaderFromKeyValuePairs(cookieValues: string[]) {
  const invalidCookies = cookieValues.filter((cookie) => !cookie.includes('='))

  if (invalidCookies.length > 0) {
    logger().error(`Invalid cookie format. Expected key=value, got: ${invalidCookies.join(', ')}`)
  }

  const cookieString = cookieValues.join('; ')
  logger().verbose('cookies', `Sending cookies: ${cookieString}`)
  return { Cookie: cookieString }
}

function buildCookieHeaderFromFile(cookiePaths: string[]) {
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

function buildAuthHeader(options: FetchOptions) {
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

export function buildBody(options: FetchOptions) {
  if ((!options.data || options.data.length === 0) && !options['data-raw']) return undefined

  if (options['data-raw']) {
    if (isValidJson(options['data-raw'])) {
      return options['data-raw']
    } else {
      logger().error(`data-raw must be valid json (e.g., --data-raw '{"name": "John Doe"}').`)
    }
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
