import os from 'os'
import path from 'path'
import { inspect, styleText } from 'node:util'
import { promises } from 'fs'
import { buildBody, type FetchOptions } from './fetch'
import { parseSetCookieHeaders } from './cookies'
import { logger } from './logger'

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
export async function writeToCookieJar(options: FetchOptions, response: Response) {
  logger().debug(`Found cookie-jar flag, attempting to write to a cookie-jar file`)
  const cookieHeaders = parseSetCookieHeaders(response.headers)
  const cookieJarFilePath = options['cookie-jar']!

  try {
    logger().debug(`Writing cookie-jar headers to ${cookieJarFilePath}`)
    await promises.writeFile(cookieJarFilePath, JSON.stringify(cookieHeaders), 'utf-8')
  } catch (error: unknown) {
    logger().warn(`Failed to write to output path ${cookieJarFilePath}`)
  }
}

export async function writeToOutputFile<T>(options: FetchOptions, data: T) {
  logger().debug(`Writing response to output file`)

  const buffer = inspect(data, { depth: null, maxArrayLength: null, colors: true })

  try {
    logger().debug(`Writing response to ${options.output}`)
    await promises.writeFile(options.output!, buffer, 'utf8')
  } catch (e: unknown) {
    logger().warn(`Failed to write to output path ${options.output}`)
  }
}

export async function stdout<T>(options: FetchOptions, response: Response, data: T) {
  logger().debug(`Writing response to stdout`)

  const headersArray = buildHeadersArray(options)

  for (const header of headersArray) {
    if (header === 'head') {
      printHeaders(response.headers)
      printSummary(data, response)
      break
    }
    if (header === 'include') {
      printHeaders(response.headers)
    }
    if (header === 'output') {
      await writeToOutputFile(options, data)
    }
    if (header === 'cookie-jar') {
      await writeToCookieJar(options, response)
    }
    if (header === 'summary') {
      printSummary(data, response)
    }
  }

  if (options.head || options.summary) return

  printResponse(data, response)
}

function printStatusCode(status: number) {
  if (status < 400) {
    console.log('status code: ', styleText('greenBright', status.toString()))
  } else {
    console.log('status code: ', styleText('redBright', status.toString()))
  }
}

export function printResponse<T>(data: T, response: Response) {
  console.log(styleText('white', '\n📄 ---- [CURLY] RESPONSE ----'))
  console.log(inspect(data, { depth: null, maxArrayLength: null, colors: true }))
  printSummary(data, response)
}

export function printSummary<T>(data: T, response: Response) {
  const responseSize = Buffer.byteLength(JSON.stringify(data))

  console.log(styleText('magenta', '\n📊 ---- [CURLY] SUMMARY ----'))
  printStatusCode(response.status)
  console.log(`response size: ${responseSize} bytes`)
}

export function printHeaders(headers: Headers) {
  const headersObj = Object.fromEntries(headers.entries())
  console.log(styleText('blue', '\n📜---- [CURLY] HEADERS ----'))
  for (const [key, value] of Object.entries(headersObj)) {
    console.log(`${key}: ${value}`)
  }
}

export function printDebug(url: string, options: FetchOptions, status: number) {
  console.log(styleText('gray', '\n🐛 ---- [CURLY] DEBUG MODE ----'))
  console.log(`URL: ${url}`)
  console.log(`Method: ${options.method ?? 'GET'}`)
  printStatusCode(status)
  console.log(`Body: ${buildBody(options) ?? 'None'}`)
}
