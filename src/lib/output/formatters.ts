import { promises } from 'fs'
import { STATUS_CODES } from 'node:http'
import { inspect } from 'node:util'
import { parseSetCookieHeaders } from '../../core/http/cookies'
import { buildBody, buildResponse, type FetchOptions } from '../../core/http/client'
import { logger } from '../utils/logger'
import { drawTable } from './table'
import { Data } from '../../types'

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

  if (options.head) {
    printHeaders(data.headers, options)
  } else if (options.include) {
    printHeaders(data.headers, options)
    console.log()
    printResponse(data.response)
  } else if (options.output) {
    await writeToOutputFile(data, options)
    printResponse(data.response)
  } else if (options.summary) {
    printSummary(data, options)
  } else if (options['cookie-jar']) {
    await writeToCookieJar(data, options)
    printResponse(data.response)
  } else {
    printResponse(data.response)
  }
}

function getStatusText(status: number) {
  return STATUS_CODES[status] || 'unknown status'
}

export function printResponse(response: Data['response']) {
  console.log(inspect(response, { depth: null, maxArrayLength: null, colors: true }))
}

export function printSummary(data: Data, options: FetchOptions) {
  const rows = [
    { label: 'Status', value: `${data.status} ${getStatusText(data.status)}` },
    { label: 'Duration', value: `${data.duration.toFixed(2)} ms` },
    { label: 'Size', value: `${data.size}` },
    { label: 'Method', value: `${options.method ?? 'GET'}` },
    { label: 'Request Body', value: buildBody(options) ?? 'N/A' },
  ]

  if (options.table) {
    drawTable(rows)
  } else {
    rows.forEach(({ label, value }) => console.log(`${label}=${value}`))
  }
}

export function printHeaders(headers: Headers, options: FetchOptions) {
  const headersObj = Object.fromEntries(headers.entries())
  const rows = []
  for (const [key, value] of Object.entries(headersObj)) {
    rows.push({ label: key, value })
  }

  if (options.table) {
    drawTable(rows)
  } else {
    Object.entries(headersObj).forEach(([k, v]) => console.log(`${k}=${v}`))
  }
}
