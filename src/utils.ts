import { inspect, styleText } from 'node:util'
import { cli } from './cli.ts'
import { CONTENT_TYPES } from './constants.ts'

type FetchOptions = ReturnType<typeof cli>['values']

export function printHelpMessage() {
  const message = `Usage: curly [OPTIONS] <url>

Options:
  -h, --help                   Show help menu

  -X, --method <METHOD>        HTTP method to use (default: GET)

  -d <key=value,...>           Key=value pairs for request body
                               Example: curly -X POST -d name=Connor -d age=28 https://example.com/api

  --data-raw <data>            Raw data input
                               Example: curly --data-raw '{"name": "Connor"}' https://example.com/api

  -H, --header <header>        Specify request headers
                               Example: curly -H "Content-Type: application/json" https://example.com/api

  -q, --query <key=value>      Add query parameters to the URL
                               Example: curly -q "search=cli" https://example.com/api

  -I, --head                   Fetch only the headers
                               Example: curly -I https://example.com

  -i, --include                Include HTTP headers in the output
                               Example: curly -i https://example.com

  --debug                      Print debug information
                               Example: curly --debug https://example.com
`
  console.log(message)
}

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
  return {
    method: buildMethod(options),
    headers: buildHeaders(options),
    body: buildBody(options),
  }
}

function buildMethod(options: FetchOptions) {
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
function buildHeaders(options: FetchOptions) {
  if (!options.headers && (options.data || options['data-raw'])) {
    return { 'Content-Type': 'application/json' }
  }

  return (
    options?.headers?.reduce((obj, h) => {
      if (!h.includes(':')) {
        logger().error('Headers are improperly formatted.')
      }
      const [left, right] = h.split(':')
      return { ...obj, [left.trim()]: right.trim() }
    }, {}) ?? {}
  )
}

function buildBody(options: FetchOptions) {
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

    return JSON.stringify(formattedData)
  }

  return undefined
}

export function buildPrintType(options: FetchOptions): 'debug' | 'include' | 'head' | 'default' {
  if (options.debug) {
    return 'debug'
  } else if (options.include) {
    return 'include'
  } else if (options.head) {
    return 'head'
  } else {
    return 'default'
  }
}

function isValidJson(str: unknown) {
  if (typeof str !== 'string') return false

  try {
    JSON.parse(str)
    return true
  } catch (_: unknown) {
    return false
  }
}

export function stout<T>(url: string, requestOptions: FetchOptions, response: Response, data: T) {
  const type = buildPrintType(requestOptions)
  switch (type) {
    case 'debug':
      printDebug(url, requestOptions, response.status)
      break
    case 'head':
      printHeaders(response.headers, response.status)
      break
    case 'include':
      printHeaders(response.headers, response.status)
      console.log('\n---- [CURLY] RESPONSE ----------')
      console.log(inspect(data, { depth: null, maxArrayLength: null, colors: true }))
      break
    default:
      console.log(inspect(data, { depth: null, maxArrayLength: null, colors: true }))
      break
  }
}

export function printHeaders(headers: Headers, status: number) {
  const headersObj = Object.fromEntries(headers.entries())
  console.log('---- [CURLY] HEADERS ----------')
  console.log(`status: ${status}`)
  for (const [key, value] of Object.entries(headersObj)) {
    console.log(`${key}: ${value}`)
  }
}

export function printDebug(url: string, options: FetchOptions, status: number) {
  console.log(`---- [CURLY] DEBUG MODE ---------`)
  console.log(`URL      : ${url}`)
  console.log(`Method   : ${options.method ?? 'GET'}`)
  console.log(`status   : ${status}`)
  console.log(`Body     : ${buildBody(options) ?? 'None'}`)
}

export async function asyncCompute<T>(fn: () => Promise<T>) {
  return await fn()
}

export function logger() {
  return {
    info(...args: string[]) {
      console.log(styleText('gray', `[curly(info)]: ${args.join(' ')}`))
    },
    success(...args: string[]) {
      console.log(styleText('green', `[curly(success)]: ${args.join(' ')}`))
    },
    warn(...args: string[]) {
      console.log(styleText('dim', `[curly(warn)]: ${args.join(' ')}`))
    },
    error(...args: string[]) {
      console.log(styleText('red', `[curly(error)]: ${args.join(' ')}`))
      process.exit(1)
    },
  }
}
