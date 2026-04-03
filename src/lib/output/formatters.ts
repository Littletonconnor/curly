import { promises as fs } from 'fs'
import { createWriteStream } from 'node:fs'
import { STATUS_CODES } from 'node:http'
import { Readable, Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { inspect, styleText } from 'node:util'
import { type FetchOptions } from '../../core/http/client'
import { parseSetCookieHeaders } from '../../core/http/cookies'
import { type ResponseData, type StatusColor } from '../../types'
import { formatBytes } from '../utils'
import { logger } from '../utils/logger'
import { ProgressIndicator } from './download-progress'
import { formatJsonOutput } from './json-output'

export interface OutputContext {
  url: string
  method: string
}

/**
 * Extracts Set-Cookie headers from the response and saves them to a cookie jar file.
 */
export async function writeToCookieJar(data: ResponseData, options: FetchOptions): Promise<void> {
  const cookieHeaders = parseSetCookieHeaders(data.headers)
  const cookieJarFilePath = options['cookie-jar']!

  logger().verbose('cookies', `Saving cookies to jar: ${cookieJarFilePath}`)

  try {
    await fs.writeFile(cookieJarFilePath, JSON.stringify(cookieHeaders), 'utf-8')
    logger().verbose('cookies', `Saved ${Object.keys(cookieHeaders).length} cookie(s)`)
  } catch {
    logger().warn(`Failed to write to output path ${cookieJarFilePath}`)
  }
}

/**
 * Main output handler that formats and displays the HTTP response.
 * Handles cookie jar saving, JSON output, file output, headers display, and status line.
 */
export async function stdout(
  data: ResponseData,
  options: FetchOptions,
  context?: OutputContext,
): Promise<void> {
  if (options['cookie-jar']) {
    await writeToCookieJar(data, options)
  }

  if (options.json && context) {
    const jsonOutput = formatJsonOutput(context.url, context.method, data)
    const jsonString = JSON.stringify(jsonOutput, null, 2)

    if (options.output) {
      try {
        await fs.writeFile(options.output, jsonString, 'utf8')
      } catch {
        logger().warn(`Failed to write to output path ${options.output}`)
      }
      logger().verbose('output', `JSON response saved to: ${options.output}`)
    } else {
      console.log(jsonString)
    }
    return
  }

  const includeHeaders = !!(options.include || options.head)
  const includeBody = !options.head

  if (!options.output) {
    printContent(data, { includeHeaders, includeBody })
  }

  if (options['write-out']) {
    printWriteOut(data, options['write-out'])
  }

  printStatusLine(data, options)
}

function printContent(
  data: ResponseData,
  opts: { includeHeaders: boolean; includeBody: boolean },
): void {
  if (opts.includeHeaders) {
    printHeaders(data.headers)
    if (opts.includeBody) console.log()
  }
  if (opts.includeBody) {
    printResponse(data.response)
  }
}

/**
 * Streams an HTTP response body directly to a file on disk.
 *
 * Uses Node's stream pipeline pattern (Readable → Transform → Writable) to avoid
 * buffering the entire response in memory, which would crash on large files that
 * exceed Node's ~512MB string limit (ERR_STRING_TOO_LONG).
 *
 * The pipeline works in three stages:
 *  1. Readable  — the HTTP response body, converted from a web ReadableStream
 *                 to a Node.js Readable via Readable.fromWeb()
 *  2. Transform — a pass-through that counts bytes per chunk to drive the progress bar,
 *                 forwarding each chunk downstream unchanged
 *  3. Writable  — a file write stream that writes raw binary bytes to disk
 *
 * pipeline() from stream/promises connects these stages, handling backpressure
 * (slowing reads if writes fall behind) and cleanup (closing all streams on error).
 *
 * @param response - The raw fetch Response with an unconsumed body
 * @param filePath - Destination file path to write to
 * @returns The human-readable size of the downloaded file
 */
export async function streamDownload(response: Response, filePath: string) {
  const contentLengthHeader = response.headers.get('Content-Length')
  const totalBytes = contentLengthHeader ? parseInt(contentLengthHeader, 10) : null

  const progress = new ProgressIndicator(totalBytes)

  const progressTransform = new Transform({
    transform(chunk, _, callback) {
      progress.update(chunk.length)
      callback(null, chunk)
    },
  })

  if (!response.body) {
    createWriteStream(filePath).end()
    return {
      size: '0 B',
    }
  }

  const nodeReadable = Readable.fromWeb(response.body as any)
  const writeStream = createWriteStream(filePath)
  await pipeline(nodeReadable, progressTransform, writeStream)

  progress.finish()
  return {
    size: formatBytes(progress.getBytesWritten()),
  }
}

function getStatusText(status: number): string {
  return STATUS_CODES[status] || 'unknown status'
}

function getStatusColor(status: number): StatusColor {
  if (status >= 200 && status < 300) return 'green'
  if (status >= 300 && status < 400) return 'yellow'
  if (status >= 400) return 'red'
  return 'white'
}

/**
 * Prints the response body to stdout with syntax highlighting.
 */
export function printResponse(response: ResponseData['response']): void {
  console.log(inspect(response, { depth: null, maxArrayLength: null, colors: true }))
}

/**
 * Prints the colored status line showing HTTP status, duration, and response size.
 */
export function printStatusLine(data: ResponseData, options: FetchOptions): void {
  if (options.quiet) return

  const status = `${data.status} ${getStatusText(data.status)}`
  const duration = `${data.duration.toFixed(0)}ms`
  const size = data.size

  const color = getStatusColor(data.status)
  const statusColored = styleText(color, status)
  const details = styleText('gray', `${duration}  ${size}`)

  console.log()
  console.log(`${statusColored}  ${details}`)
}

/**
 * Prints response headers to stdout in "key: value" format.
 */
export function printHeaders(headers: Headers): void {
  const headersObj = Object.fromEntries(headers.entries())
  Object.entries(headersObj).forEach(([k, v]) => console.log(`${k}: ${v}`))
}

/**
 * Prints formatted output using curl-style write-out format strings.
 * Supports variables like %{http_code}, %{time_total}, %{size_download},
 * %{content_type}, %{url_effective}, %{redirect_url}, %{num_redirects},
 * %{header_json}, and escape sequences like \n, \t, \r, and \\.
 */
function printWriteOut(data: ResponseData, format: string): void {
  const contentType = data.headers.get('content-type') ?? ''
  const headerJson = JSON.stringify(Object.fromEntries(data.headers.entries()))

  const output = format
    .replace(/%\{http_code\}/g, String(data.status))
    .replace(/%\{status_code\}/g, String(data.status))
    .replace(/%\{time_total\}/g, (data.duration / 1000).toFixed(6))
    .replace(/%\{size_download\}/g, data.size)
    .replace(/%\{content_type\}/g, contentType)
    .replace(/%\{url_effective\}/g, data.urlEffective ?? '')
    .replace(/%\{redirect_url\}/g, data.redirectUrl ?? '')
    .replace(/%\{num_redirects\}/g, String(data.numRedirects ?? 0))
    .replace(/%\{header_json\}/g, headerJson)
    .replace(/^http_code$/, String(data.status))
    .replace(/^status_code$/, String(data.status))
    .replace(/^time_total$/, (data.duration / 1000).toFixed(6))
    .replace(/^size_download$/, data.size)
    .replace(/\\([ntr\\])/g, (_, char) => {
      const escapes: Record<string, string> = { n: '\n', t: '\t', r: '\r', '\\': '\\' }
      return escapes[char] ?? char
    })

  console.log(output)
}
