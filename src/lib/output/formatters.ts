import { promises } from 'fs'
import { STATUS_CODES } from 'node:http'
import { inspect, styleText } from 'node:util'
import { parseSetCookieHeaders } from '../../core/http/cookies'
import { type FetchOptions } from '../../core/http/client'
import { logger } from '../utils/logger'
import { writeOutputToFile } from '../utils/fs'
import { type ResponseData, type StatusColor } from '../../types'

export async function writeToCookieJar(
  data: ResponseData,
  options: FetchOptions,
): Promise<void> {
  const cookieHeaders = parseSetCookieHeaders(data.headers)
  const cookieJarFilePath = options['cookie-jar']!

  logger().verbose('cookies', `Saving cookies to jar: ${cookieJarFilePath}`)

  try {
    await promises.writeFile(cookieJarFilePath, JSON.stringify(cookieHeaders), 'utf-8')
    logger().verbose('cookies', `Saved ${Object.keys(cookieHeaders).length} cookie(s)`)
  } catch {
    logger().warn(`Failed to write to output path ${cookieJarFilePath}`)
  }
}

export async function writeToOutputFile(data: ResponseData, options: FetchOptions): Promise<void> {
  logger().verbose('output', `Writing response to file: ${options.output}`)
  await writeOutputToFile(data.response, options.output!, { colors: false })
  logger().verbose('output', `Response saved successfully`)
}

export async function stdout(data: ResponseData, options: FetchOptions): Promise<void> {
  if (options['write-out']) {
    printWriteOut(data, options['write-out'])
    return
  }

  if (options.head) {
    printHeaders(data.headers)
  } else if (options.include) {
    printHeaders(data.headers)
    console.log()
    printResponse(data.response)
    printStatusLine(data, options)
  } else if (options.output) {
    await writeToOutputFile(data, options)
    printResponse(data.response)
    printStatusLine(data, options)
  } else if (options['cookie-jar']) {
    await writeToCookieJar(data, options)
    printResponse(data.response)
    printStatusLine(data, options)
  } else {
    printResponse(data.response)
    printStatusLine(data, options)
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

export function printResponse(response: ResponseData['response']): void {
  console.log(inspect(response, { depth: null, maxArrayLength: null, colors: true }))
}

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

export function printHeaders(headers: Headers): void {
  const headersObj = Object.fromEntries(headers.entries())
  Object.entries(headersObj).forEach(([k, v]) => console.log(`${k}: ${v}`))
}

function printWriteOut(data: ResponseData, format: string): void {
  const output = format
    .replace(/%\{http_code\}/g, String(data.status))
    .replace(/%\{status_code\}/g, String(data.status))
    .replace(/%\{time_total\}/g, (data.duration / 1000).toFixed(6))
    .replace(/%\{size_download\}/g, data.size)
    .replace(/^http_code$/, String(data.status))
    .replace(/^status_code$/, String(data.status))
    .replace(/^time_total$/, (data.duration / 1000).toFixed(6))
    .replace(/^size_download$/, data.size)

  console.log(output)
}
