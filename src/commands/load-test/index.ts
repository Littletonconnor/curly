import { curl, buildResponse, type FetchOptions } from '../../core/http/client'
import { logger } from '../../lib/utils/logger'
import { parseIntOption } from '../../lib/utils/parse'
import { getErrorMessage } from '../../types'
import { ProgressIndicator } from './progress'
import { StatsCollector, type RequestResult } from './stats'

const DEFAULT_REQUESTS = 200
const DEFAULT_CONCURRENCY = 50

function createErrorResult(error: unknown): RequestResult {
  return {
    status: 500,
    duration: 0,
    size: '0',
    error: getErrorMessage(error),
  }
}

export async function load(url: string, options: FetchOptions): Promise<void> {
  const requests = parseIntOption(options.requests, DEFAULT_REQUESTS)
  const concurrency = parseIntOption(options.concurrency, DEFAULT_CONCURRENCY)

  logger().verbose('load-test', `Starting: ${requests} requests with concurrency ${concurrency}`)
  logger().verbose('load-test', `Target: ${url}`)

  const stats = new StatsCollector()
  const progress = new ProgressIndicator(requests)

  const startTime = performance.now()

  for (let i = 0; i < requests; i += concurrency) {
    const batchSize = Math.min(concurrency, requests - i)
    const batch = Array(batchSize)
      .fill(null)
      .map(() =>
        curl(url, options)
          .then(buildResponse)
          .catch((error: unknown) => createErrorResult(error)),
      )

    const batchResults = await Promise.all(batch)
    const successes = batchResults.filter(({ status }) => status >= 200 && status < 400).length
    const errors = batchResults.length - successes
    progress.update(successes, errors)
    stats.addResults(batchResults)
  }

  const endTime = performance.now()
  const totalDuration = (endTime - startTime) / 1000
  progress.finish()

  logger().verbose('load-test', `Completed in ${totalDuration.toFixed(2)}s`)

  stats.print(totalDuration)
}
