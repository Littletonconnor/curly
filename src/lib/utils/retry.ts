import { logger } from './logger'
import { isError, isNodeError, getErrorMessage } from '../../types'

export interface RetryOptions {
  maxRetries: number
  baseDelay: number
  retryAllErrors?: boolean
  shouldRetry?: (error: unknown) => boolean
  shouldRetryResult?: (result: unknown) => boolean
}

const defaultShouldRetry = (error: unknown): boolean => {
  if (!isError(error)) return false

  if (error.name === 'AbortError') return true

  if (isNodeError(error)) {
    return (
      error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT'
    )
  }

  return false
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Wraps an async operation with retry logic using exponential backoff.
 * Retries on network errors (ECONNRESET, ECONNREFUSED, ETIMEDOUT) and AbortError.
 * When shouldRetryResult is provided, also retries on successful results that match the predicate.
 *
 * @param operation - The async function to execute
 * @param options - Retry configuration (maxRetries, baseDelay, optional shouldRetry predicate)
 * @returns The result of the operation
 * @throws The last error if all retries are exhausted
 */
export async function withRetry<T>(operation: () => Promise<T>, options: RetryOptions): Promise<T> {
  const { maxRetries, baseDelay, shouldRetry = defaultShouldRetry, shouldRetryResult } = options

  if (maxRetries === 0) {
    return operation()
  }

  let lastError: unknown = null
  let lastResult: T | undefined

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = baseDelay * Math.pow(2, attempt - 1)
        logger().verbose('retry', `Attempt ${attempt + 1}/${maxRetries + 1}, waiting ${delay}ms...`)
        await sleep(delay)
      }
      const result = await operation()
      if (shouldRetryResult && shouldRetryResult(result) && attempt < maxRetries) {
        lastResult = result
        logger().verbose('retry', 'Retrying due to HTTP error status')
        continue
      }
      return result
    } catch (error: unknown) {
      lastError = error
      if (!shouldRetry(error) || attempt >= maxRetries) {
        throw error
      }
      logger().verbose('retry', `Request failed: ${getErrorMessage(error)}`)
    }
  }

  if (lastResult !== undefined) {
    return lastResult
  }
  throw lastError
}
