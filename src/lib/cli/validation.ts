import { type FetchOptions } from '../../types'
import { logger } from '../utils/logger'

const VALID_EXPORT_FORMATS = ['json', 'csv'] as const

const PROTOCOL_TYPOS: Record<string, string> = {
  'htp://': 'http://',
  'htps://': 'https://',
  'htttp://': 'http://',
  'httpp://': 'http://',
  'httpss://': 'https://',
}

export function validateExportFlag(exportFormat: string | undefined, isLoadTest: boolean): void {
  if (exportFormat && !isLoadTest) {
    logger().error('--export is only available in load test mode (use -n or -c)')
  }
  if (
    exportFormat &&
    !VALID_EXPORT_FORMATS.includes(exportFormat as (typeof VALID_EXPORT_FORMATS)[number])
  ) {
    logger().error(`Invalid export format: "${exportFormat}". Valid formats: json, csv`)
  }
}

/**
 * Validates all user-provided options before executing a request.
 * Called once after CLI parsing and option merging are complete.
 */
export function validateOptions(url: string, options: FetchOptions): void {
  validateUrl(url)
  validateHeaders(options.headers)
  validateTimeout(options.timeout)
  validateMaxRedirects(options['max-redirects'])
  validateRetryOptions(options.retry, options['retry-delay'])
}

function validateHeaders(headers: string[] | undefined): void {
  if (!headers) return
  for (const header of headers) {
    if (!header.includes(':')) {
      logger().error(
        `Invalid header format: "${header}"\n  Headers must be in "Key: Value" format (e.g., -H "Content-Type: application/json")`,
      )
    }
    const key = header.split(':')[0].trim()
    if (!key) {
      logger().error(`Invalid header: "${header}" — header name cannot be empty`)
    }
  }
}

function validateUrl(url: string): void {
  for (const [typo, correction] of Object.entries(PROTOCOL_TYPOS)) {
    if (url.startsWith(typo)) {
      logger().error(
        `Invalid URL protocol "${typo}" — did you mean "${correction}"?\n  ${url.replace(typo, correction)}`,
      )
    }
  }

  if (!url.includes('://')) {
    logger().error(`Missing protocol in URL "${url}" — did you mean "https://${url}"?`)
  }

  try {
    new URL(url)
  } catch {
    logger().error(`Malformed URL "${url}" — check for typos or missing characters`)
  }
}

function validateTimeout(value: string | undefined): void {
  if (value === undefined) return
  const parsed = parseInt(value, 10)
  if (isNaN(parsed) || parsed <= 0) {
    logger().error(`Invalid --timeout value "${value}". Must be a positive integer (milliseconds).`)
  }
}

function validateMaxRedirects(value: string | undefined): void {
  if (value === undefined) return
  const parsed = parseInt(value, 10)
  if (isNaN(parsed) || parsed < 0) {
    logger().error(`Invalid --max-redirects value "${value}". Must be a non-negative integer.`)
  }
}

function validateRetryOptions(retry: string | undefined, retryDelay: string | undefined): void {
  if (retry !== undefined && retry !== '0') {
    const parsed = parseInt(retry, 10)
    if (isNaN(parsed) || parsed < 0) {
      logger().error(`Invalid --retry value "${retry}". Must be a non-negative integer.`)
    }
  }
  if (retryDelay !== undefined && retryDelay !== '1000') {
    const parsed = parseInt(retryDelay, 10)
    if (isNaN(parsed) || parsed <= 0) {
      logger().error(
        `Invalid --retry-delay value "${retryDelay}". Must be a positive integer (milliseconds).`,
      )
    }
  }
}
