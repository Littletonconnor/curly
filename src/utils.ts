import { styleText } from 'node:util'
import { cli } from './cli.ts'
import { CONTENT_TYPES } from './constants.ts'

type FetchOptions = ReturnType<typeof cli>['values']

export function printHelpMessage() {
  const message = `Usage: curly [--method <METHOD>] <url>
  Options:
    -h --help                   Show help menu

    -X --method <METHOD>        HTTP method to use (default: GET)

    -d <key=value,...>          Comma-separated key=value pairs

    --d-raw <data>              Raw data input

    -H, --header 

    -I, --head                  Fetch the headers only.
                                  Example(s):
                                    curl -I https://example.com

    --debug                     Print debug information
`
  console.log(message)
}

export async function curl(url: string, options: FetchOptions) {
  return await fetch(url, buildFetchOptions(options))
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

export function buildFetchOptions(options: FetchOptions) {
  return {
    method: buildMethod(options.method),
    headers: buildHeaders(options.headers),
    body: buildBody(options.data, options['data-raw']),
  }
}

function buildMethod(method: string) {
  console.log('METHOD', method)
  return method ?? 'GET'
}

function buildHeaders(headers: string[] | undefined) {
  if (!headers) return {}

  return headers.reduce((obj, h) => {
    if (!h.includes(':')) {
      console.error(styleText('red', '[curly]: Headers are improperly formatted.'))
      process.exit(1)
    }
    const [left, right] = h.split(':')
    return { ...obj, [left.trim()]: right.trim() }
  }, {})
}

function buildBody(
  data: ReturnType<typeof cli>['values']['data'],
  dataRaw: ReturnType<typeof cli>['values']['data-raw'],
) {
  if (!data && !dataRaw) return undefined

  // Example of data: name=John Doe,age=30
  // Example of raw-data: name=John Doe,age=30
  if (dataRaw) {
    if (isValidJson(dataRaw)) {
      console.log('RAW DATA', dataRaw)
      return dataRaw
    } else {
      console.error(
        styleText(
          'red',
          `[curly]: data-raw must be valid json (e.g., --data-raw '{"name": "Connor"}').`,
        ),
      )
    }
  } else if (data) {
    console.log('DATA', data)
  }

  return undefined
}

export function buildPrintType(options: FetchOptions): 'debug' | 'headers' | 'default' {
  if (options.debug) {
    return 'debug'
  } else if (options.include) {
    return 'headers'
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
    case 'headers':
      printHeaders(requestOptions, response.status)
      break
    default:
      console.log(data)
      break
  }
}

export function printHeaders(options: FetchOptions, status: number) {
  if (!options.headers) {
    console.log('[CURLY] NO HEADERS FOUND')
    return
  }

  const headersInstance = new Headers(options.headers as unknown as HeadersInit) // TODO: Fix types
  const headersObj = Object.fromEntries(headersInstance.entries())
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
  console.log(`Body     : ${buildBody(options.data, options['data-raw']) ?? 'None'}`)
}

export async function asyncCompute<T>(fn: () => Promise<T>) {
  return await fn()
}
