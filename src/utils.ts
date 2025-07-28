import { promises } from 'fs'
import { STATUS_CODES } from 'node:http'
import { inspect, styleText } from 'node:util'
import os from 'os'
import path from 'path'
import { parseSetCookieHeaders } from './cookies'
import { buildBody, buildResponse, type FetchOptions } from './fetch'
import { logger } from './logger'
import { drawTable } from './table'
import { Data } from './types'

type PrintType = 'include' | 'head' | 'summary' | 'default' | 'output' | 'cookie-jar'
export function buildPrintType(options: FetchOptions): PrintType {
  if (options['cookie-jar']) {
    return 'include'
  } else if (options.head) {
    return 'head'
  } else if (options.summary) {
    return 'summary'
  } else if (options.output) {
    return 'output'
  } else if (options.include) {
    return 'cookie-jar'
  } else {
    return 'default'
  }
}

function buildHeadersArray(options: FetchOptions) {
  return Object.keys(options).filter((option) => option)
}

export function isValidJson(str: unknown) {
  if (typeof str !== 'string') return false

  try {
    JSON.parse(str)
    return true
  } catch (_: unknown) {
    return false
  }
}

export function printHelpMessage() {
  const message = `Usage: curly [OPTIONS] <url>

Options:
  -h, --help                   Show help menu

  -history, --history          Show hisory logs (defaults to ~./curly_history.txt)

  -X, --method <METHOD>        HTTP method to use (default: GET)

  -d <key=value,...>           Key=value pairs for request body
                               Example: curly -X POST -d name=Connor -d age=28 https://example.com/api

  --data-raw <data>            Raw data input
                               Example: curly --data-raw '{"name": "Connor"}' https://example.com/api

  -H, --header <header>        Specify request headers
                               Example: curly -H "Content-Type: application/json" https://example.com/api

  -q, --query <key=value>      Add query parameters to the URL
                               Example: curly -q "search=cli" https://example.com/api

  -o, --output                 Write output to a file instead of stdout
                               Example: curly -o ./test.tsxt https://example.com/api

  -I, --head                   Fetch only the headers
                               Example: curly -I https://example.com

  -b, --cookie                 Pass the data to the HTTP server in the cookie header.
                               Can be in the form of a string, or a file.
                               Example: curly -b "NAME1=VALUE1;" https://example.com

  -c, --cookie-jar             Specify to which file you want curl to write all cookies after a completed operation.
                               Example: curly -c saved_cookies.txt https://example.com


  -i, --include                Include HTTP headers in the output
                               Example: curly -i https://example.com

  --debug                      Print debug information
                               Example: curly --debug https://example.com
`
  console.log(message)
}

// TODO: build some removal system in here.
// Example: We get to 1000 lines of history so we start to remove old entries.
export async function writeHistoryFile() {
  const filePath = path.join(os.homedir(), 'curly_history.txt')
  const args = process.argv.slice(2)
  const command = `curly ${args.join(' ')}\n`

  try {
    logger().debug(`Attempting to write history file at ${filePath}`)
    await promises.appendFile(filePath, command, 'utf8')
    logger().debug(`Successfully wrote to history file at ${filePath}`)
  } catch (e) {
    logger().error(`There was an error writing to the history file ${e}`)
  }
}

export async function printHistoryFile() {
  const filePath = path.join(os.homedir(), 'curly_history.txt')

  try {
    logger().debug(`Attempting to read history file at ${filePath}`)

    console.log(styleText('yellowBright', '\n📄 ---- [CURLY] HISTORY ----'))
    const fileContentBlog = await promises.readFile(filePath, { encoding: 'utf8' })
    const content = fileContentBlog.split('\n')
    for (const line of content) {
      console.log(line)
    }

    logger().debug(`Successfully read history file at ${filePath}`)
  } catch (e: any) {
    if (e.code === 'ENOENT') {
      logger().error('history file does not yet exist. Run at least one curly command!')
    } else {
      logger().error(`There was an error reading to the history file ${e}`)
    }
  }
}

/**
 * Extracts cookie names and values from Set-Cookie headers.
 *
 * **Note:** Currently, this function only parses the cookie name and value.
 * Future improvements will include parsing additional attributes such as `path`,
 * `expires`, `secure`, and `HttpOnly`.
 *
 * @returns An object mapping each cookie name to its corresponding value.
 *
 * @example
 * ```typescript
 * // Given the following Set-Cookie header:
 * // 'login_xsrf=GQMerzziut0/gKulOmK4qQ==; path=/; secure; HttpOnly'
 *
 * const headers = new Headers();
 * headers.append('Set-Cookie', 'login_xsrf=GQMerzziut0/gKulOmK4qQ==; path=/; secure; HttpOnly');
 *
 * const cookies = parseSetCookieHeaders(headers);
 * console.log(cookies);
 * // Output:
 * // {
 * //   login_xsrf: 'GQMerzziut0/gKulOmK4qQ=='
 * // }
 * ```
 * @param options
 * @param response
 */
export async function writeToCookieJar(
  data: Awaited<ReturnType<typeof buildResponse>>,
  options: FetchOptions,
) {
  logger().debug(`Found cookie-jar flag, attempting to write to a cookie-jar file`)
  const cookieHeaders = parseSetCookieHeaders(data.headers)
  const cookieJarFilePath = options['cookie-jar']!

  try {
    logger().debug(`Writing cookie-jar headers to ${cookieJarFilePath}`)
    await promises.writeFile(cookieJarFilePath, JSON.stringify(cookieHeaders), 'utf-8')
  } catch (error: unknown) {
    logger().warn(`Failed to write to output path ${cookieJarFilePath}`)
  }
}

export async function writeToOutputFile(data: Data, options: FetchOptions) {
  logger().debug(`Writing response to output file`)

  const buffer = inspect(data.response, { depth: null, maxArrayLength: null, colors: true })

  try {
    logger().debug(`Writing response to ${options.output}`)
    await promises.writeFile(options.output!, buffer, 'utf8')
  } catch (e: unknown) {
    logger().warn(`Failed to write to output path ${options.output}`)
  }
}

export async function stdout(data: Data, options: FetchOptions) {
  logger().debug(`Writing response to stdout`)

  const headersArray = buildHeadersArray(options)

  for (const header of headersArray) {
    if (header === 'head') {
      printHeaders(data.headers)
      break
    }
    if (header === 'include') {
      printHeaders(data.headers)
    }
    if (header === 'output') {
      await writeToOutputFile(data, options)
    }
    if (header === 'cookie-jar') {
      await writeToCookieJar(data, options)
    }
    if (header === 'summary') {
      printSummary(data, options)
    }
  }

  if (options.head || options.summary) return

  printResponse(data)
}

function getStatusText(status: number) {
  return STATUS_CODES[status] || 'unknown status'
}

export function printResponse(data: Data) {
  console.log(inspect(data, { depth: null, maxArrayLength: null, colors: true }))
}

export function printSummary(data: Data, options: FetchOptions) {
  const rows = [
    { label: 'Status', value: `${data.status} ${getStatusText(data.status)}` },
    { label: 'Duration', value: `${data.duration.toFixed(2)} ms` },
    { label: 'Size', value: `${data.size}` },
    { label: 'Method', value: `${options.method ?? 'GET'}` },
    { label: 'Request Body', value: buildBody(options) ?? 'N/A' },
  ]

  drawTable(rows)
}

export function printHeaders(headers: Headers) {
  const headersObj = Object.fromEntries(headers.entries())
  const rows = []
  for (const [key, value] of Object.entries(headersObj)) {
    rows.push({ label: key, value })
  }

  drawTable(rows)
}
