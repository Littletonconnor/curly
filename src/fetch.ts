import { readFileSync } from 'fs'
import { cli } from './cli'
import { CONTENT_TYPES } from './constants'
import { isValidJson, logger } from './utils'
import { applyCookieHeader } from './cookies'

export type FetchOptions = ReturnType<typeof cli>['values']

export async function curl(url: string, options: FetchOptions) {
  return await fetch(buildUrl(url, options.query), buildFetchOptions(options))
}

export async function resolveData(response: Response) {
  const contentType = response.headers['content-type'] ?? ''

  if (CONTENT_TYPES.json.includes(contentType)) {
    return await response.json()
  } else if (CONTENT_TYPES.arrayBuffer.includes(contentType)) {
    return await response.arrayBuffer()
  } else if (CONTENT_TYPES.formData.includes(contentType)) {
    return await response.formData()
  } else if (CONTENT_TYPES.text.includes(contentType)) {
    return await response.text()
  } else {
    return inferContentType(response)
  }
}

// Attempts to mimic the curl API by allowing consumers of the CLI hit API or HTML documents
// Without having to specify content-type headers.
async function inferContentType(response: Response) {
  try {
    // heuristic we're using here is to always treat curly requests as json first.
    return await response.clone().json()
  } catch (_: unknown) {
    return response.text()
  }
}

export function buildUrl(url: string, queryParams: FetchOptions['query']) {
  if (!queryParams) return url

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

export function buildFetchOptions(options: FetchOptions) {
  console.log('HEADERS', buildHeaders(options))
  return {
    method: buildMethod(options),
    headers: buildHeaders(options),
    body: buildBody(options),
  }
}

export function buildMethod(options: FetchOptions) {
  return options.method ?? 'GET'
}

/*
 * Builds up fetch headers object.
 *
 * If a POST / PUT request is made without any headers, our heuristic is to treat the content-type as application/json.
 * Otherwise we will just iterate over the headers you provide us and pass those along to fetch.
 *
 * Example(s)
 * curly --data-raw '{"userId": "1"}' -X POST https://jsonplaceholder.typicode.com/todos
 *  headers created: {'Content-Type': 'application/json'}
 *
 * curly --data-raw '{"userId": "1"}' -X -H 'Content-type: application/json' -H 'foo:bar' POST https://jsonplaceholder.typicode.com/todos
 *  headers created: {'Content-Type': 'application/json', 'foo': 'bar'}
 */
export function buildHeaders(options: FetchOptions): HeadersInit {
  if (!options.headers && (options.data || options['data-raw'])) {
    return { 'Content-Type': 'application/json' }
  }

  const headers = options?.headers?.reduce((obj, h) => {
    if (!h.includes(':')) {
      logger().error('Headers are improperly formatted.')
    }
    const [key, value] = h.split(':')
    return { ...obj, [key.trim()]: value.trim() }
  }, {})

  return {
    ...headers,
    ...buildCookieHeaders(options),
  }
}

export function buildCookieHeaders(options: FetchOptions) {
  if (!options.cookie) return { Cookie: '' }

  try {
    const cookieValue = readFileSync(options.cookie, 'utf8')
    const sanitizedCookieValue = applyCookieHeader(cookieValue)
    return { Cookie: sanitizedCookieValue }
  } catch (e: any) {
    if (e.code === 'ENOENT') {
      return { Cookie: options.cookie }
    } else {
      logger().error('Error reading cookie file. It does not exist.')
      // TODO: figure out how to not require this with typescript.
      // Since the programs exits at the logger step anyways.
      return { Cookie: '' }
    }
  }
}

export function buildBody(options: FetchOptions) {
  if (!options.data && !options['data-raw']) return undefined

  if (options['data-raw']) {
    if (isValidJson(options['data-raw'])) {
      return options['data-raw']
    } else {
      logger().error(`data-raw must be valid json (e.g., --data-raw '{"name": "Connor"}').`)
    }
  } else if (options.data) {
    const formattedData = options.data.reduce((obj, d) => {
      if (!d.includes('=')) {
        logger().error('data must be formatted correctly (e.g., key1=value1).')
      }

      const [key, value] = d.split('=')
      obj[key] = value
      return obj
    }, {})

    // TODO: Also include headers here
    return JSON.stringify(formattedData)
  }

  return undefined
}
