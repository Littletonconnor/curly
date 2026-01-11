import { logger } from './logger'

export interface RetryOptions {
  maxRetries: number
  baseDelay: number
  shouldRetry?: (error: any) => boolean
}

const defaultShouldRetry = (error: any): boolean => {
  return (
    error.name === 'AbortError' ||
    error.code === 'ECONNRESET' ||
    error.code === 'ECONNREFUSED' ||
    error.code === 'ETIMEDOUT'
  )
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const { maxRetries, baseDelay, shouldRetry = defaultShouldRetry } = options

  if (maxRetries === 0) {
    return operation()
  }

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = baseDelay * Math.pow(2, attempt - 1)
        logger().verbose('retry', `Attempt ${attempt + 1}/${maxRetries + 1}, waiting ${delay}ms...`)
        await sleep(delay)
      }
      return await operation()
    } catch (error: any) {
      lastError = error
      if (!shouldRetry(error) || attempt >= maxRetries) {
        throw error
      }
      logger().verbose('retry', `Request failed: ${error.message}`)
    }
  }

  throw lastError
}
