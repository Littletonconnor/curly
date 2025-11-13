import { curl, buildResponse, type FetchOptions } from '../../core/http/client'
import { logger } from '../../lib/utils/logger'
import { StatsCollector } from './stats'

const DEFAULT_REQUESTS = '200'
const DEFAULT_CONCURRENCY = '50'

export async function load(url: string, options: FetchOptions) {
  const requests = parseInt(options.requests || DEFAULT_REQUESTS)
  const concurrency = parseInt(options.concurrency || DEFAULT_CONCURRENCY)

  logger().debug(`Starting load test: ${requests} requests with ${concurrency} concurrency`)

  const stats = new StatsCollector()
  const startTime = performance.now()

  for (let i = 0; i < requests; i += concurrency) {
    const batchSize = Math.min(concurrency, requests - i)
    const batch = Array(batchSize)
      .fill(null)
      .map(() =>
        curl(url, options)
          .then(buildResponse)
          .catch((error) => ({
            status: 0,
            duration: 0,
            size: '0',
            error: error.message,
          })),
      )

    const batchResults = await Promise.all(batch)
    stats.addResults(batchResults)
  }

  const endTime = performance.now()
  const totalDuration = (endTime - startTime) / 1000
  stats.printSummary(totalDuration)
  stats.printStatusCodeDistribution()

  logger().debug(`Finished load test: ${requests} requests with ${concurrency} concurrency`)
}
