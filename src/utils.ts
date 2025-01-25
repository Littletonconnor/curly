import { inspect, styleText } from 'node:util'
import { promises } from 'fs'
import { buildBody, type FetchOptions } from './fetch.ts'
import { parseSetCookieHeaders } from './cookies.ts'

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

export function isValidJson(str: unknown) {
  if (typeof str !== 'string') return false

  try {
    JSON.parse(str)
    return true
  } catch (_: unknown) {
    return false
  }
}

/**
 * Extracts cookie names and values from Set-Cookie headers.
 *
 * **Note:** Currently, this function only parses the cookie name and value.
 * Future improvements will include parsing additional attributes such as `path`,
 * `expires`, `secure`, and `HttpOnly`.
 *
 * @param headers - The HTTP headers containing Set-Cookie entries.
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
 */
export async function toCookieJar(options: FetchOptions, response: Response) {
  const cookieHeaders = parseSetCookieHeaders(response.headers)
  const cookieJarFilePath = options['cookie-jar']!

  try {
    await promises.writeFile(cookieJarFilePath, JSON.stringify(cookieHeaders), 'utf-8')
  } catch (error: unknown) {
    logger().warn(`Failed to write to output path ${cookieJarFilePath}`)
  }
}

export async function toOutput<T>(url: string, options: FetchOptions, response: Response, data: T) {
  let buffer = ''

  const type = buildPrintType(options)
  const headersObj = Object.fromEntries(response.headers.entries())
  switch (type) {
    case 'debug':
      buffer += `---- [CURLY] DEBUG MODE ---------\n`
      buffer += `URL      : ${url}\n`
      buffer += `Method   : ${options.method ?? 'GET'}\n`
      buffer += `status   : ${response.status}\n`
      buffer += `Body     : ${buildBody(options) ?? 'None'}\n`
      break
    case 'head':
      buffer += '---- [CURLY] HEADERS ----------\n'
      buffer += `status: ${response.status}\n`
      for (const [key, value] of Object.entries(headersObj)) {
        buffer += `${key}: ${value}\n`
      }
      break
    case 'include':
      buffer += '---- [CURLY] HEADERS ----------\n'
      buffer += `status: ${response.status}\n`
      for (const [key, value] of Object.entries(headersObj)) {
        buffer += `${key}: ${value}\n`
      }
      buffer += '\n---- [CURLY] RESPONSE ----------\n'
      buffer += inspect(data, { depth: null, maxArrayLength: null, colors: true })
      break
    default:
      buffer += inspect(data, { depth: null, maxArrayLength: null, colors: true })
      break
  }

  try {
    await promises.writeFile(options.output!, buffer, 'utf8')
  } catch (e: unknown) {
    logger().warn(`Failed to write to output path ${options.output}`)
  }
}

export function stdout<T>(url: string, requestOptions: FetchOptions, response: Response, data: T) {
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
