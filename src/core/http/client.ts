import { readFileSync } from 'fs'
import { cli } from '../../lib/cli/parser'
import { CONTENT_TYPES } from '../config/constants'
import { isValidJson } from '../../lib/utils/file'
import { applyCookieHeader } from './cookies'
import { logger } from '../../lib/utils/logger'

export type FetchOptions = ReturnType<typeof cli>['values']

export async function curl(url: string, options: FetchOptions) {
  const fetchOptions = buildFetchOptions(options)
  try {
    logger().debug(`Calling fetch with options: ${JSON.stringify(fetchOptions)}`)
    const startTime = performance.now()
    const response = await fetch(buildUrl(url, options.query), fetchOptions)
    const duration = performance.now() - startTime
    logger().debug('Fetch response finished')
    return { response, duration }
  } catch (e: any) {
    logger().error(`Fetch response failed: ${e.message}`)
    throw e
  }
}

export async function buildResponse({
  response,
  duration,
}: {
  response: Response
  duration: number
}) {
  const contentType = response.headers.get('content-type') ?? ''
  logger().debug(
    `Attempting to resolve Content-Type of: ${contentType ? contentType : 'Not specified'}`,
  )

  const size = await getResponseSize(response)

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
    logger().debug('Content-Type was not found, so attempting to infer it instead. ')
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
    logger().debug('Attempting to resolve the response as JSON.')
    return await response.clone().json()
  } catch (_: unknown) {
    logger().debug('Resolving as JSON did not work. Attempting to now resolve as text.')
    return response.text()
  }
}

export function buildUrl(url: string, queryParams: FetchOptions['query']) {
  if (!queryParams) {
    logger().debug(`Calling fetch with url: ${url}`)
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

  logger().debug(`Calling fetch with url: ${urlWithQueryParams}`)
  return urlWithQueryParams.href
}

// TODO: Fix this type issue
export function buildFetchOptions(options: FetchOptions): any {
  return {
    method: buildMethod(options),
    headers: buildHeaders(options),
    body: buildBody(options),
  }
}

export function buildMethod(options: FetchOptions) {
  if (options.method) {
    return options.method
  } else if (options.data || options['data-raw']) {
    return 'POST'
  } else {
    return 'GET'
  }
}

/*
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
  return { Cookie: cookieString }
}

function buildCookieHeaderFromFile(cookiePaths: string[]) {
  if (cookiePaths.length !== 1) {
    logger().error('When reading cookies from a file, provide exactly one file path')
  }

  const cookiePath = cookiePaths[0]
  try {
    const cookieContent = readFileSync(cookiePath, 'utf8')
    return { Cookie: applyCookieHeader(cookieContent) }
  } catch (error) {
    logger().warn(`Failed to read cookie file: ${cookiePath}`)
    return undefined
  }
}

export function buildBody(options: FetchOptions) {
  if (!options.data && !options['data-raw']) return undefined

  if (options['data-raw']) {
    if (isValidJson(options['data-raw'])) {
      return options['data-raw']
    } else {
      logger().error(`data-raw must be valid json (e.g., --data-raw '{"name": "John Doe"}').`)
    }
  } else if (options.data) {
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
