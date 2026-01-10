import { promises } from 'fs'
import { STATUS_CODES } from 'node:http'
import { inspect, styleText } from 'node:util'
import { parseSetCookieHeaders } from '../../core/http/cookies'
import { buildResponse, type FetchOptions } from '../../core/http/client'
import { logger } from '../utils/logger'
import { Data } from '../../types'

export async function writeToCookieJar(
  data: Awaited<ReturnType<typeof buildResponse>>,
  options: FetchOptions,
) {
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

export async function writeToOutputFile(data: Data, options: FetchOptions) {
  const buffer = inspect(data.response, { depth: null, maxArrayLength: null, colors: false })

  logger().verbose('output', `Writing response to file: ${options.output}`)

  try {
    await promises.writeFile(options.output!, buffer, 'utf8')
    logger().verbose('output', `Response saved successfully`)
  } catch {
    logger().warn(`Failed to write to output path ${options.output}`)
  }
}

export async function stdout(data: Data, options: FetchOptions) {
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

function getStatusText(status: number) {
  return STATUS_CODES[status] || 'unknown status'
}

function getStatusColor(status: number): Parameters<typeof styleText>[0] {
  if (status >= 200 && status < 300) return 'green'
  if (status >= 300 && status < 400) return 'yellow'
  if (status >= 400) return 'red'
  return 'white'
}

export function printResponse(response: Data['response']) {
  console.log(inspect(response, { depth: null, maxArrayLength: null, colors: true }))
}

export function printStatusLine(data: Data, options: FetchOptions) {
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

export function printHeaders(headers: Headers) {
  const headersObj = Object.fromEntries(headers.entries())
  Object.entries(headersObj).forEach(([k, v]) => console.log(`${k}: ${v}`))
}
