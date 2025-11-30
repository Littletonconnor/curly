import { curl, buildResponse, type FetchOptions } from '../../core/http/client'
import { logger } from '../../lib/utils/logger'
import { ProgressIndicator } from './progress'
import { StatsCollector } from './stats'

const DEFAULT_REQUESTS = '200'
const DEFAULT_CONCURRENCY = '50'

export async function load(url: string, options: FetchOptions) {
  const requests = parseInt(options.requests || DEFAULT_REQUESTS)
  const concurrency = parseInt(options.concurrency || DEFAULT_CONCURRENCY)

  logger().debug(`Starting load test: ${requests} requests with ${concurrency} concurrency`)

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
          .catch((error) => ({
            status: 500,
            duration: 0,
            size: '0',
            error: error.message,
          })),
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
  stats.print(totalDuration)

  logger().debug(`Finished load test: ${requests} requests with ${concurrency} concurrency`)
}
