import { curl, buildResponse, type FetchOptions } from '../fetch'
import { logger } from '../logger'
import { StatsCollector } from './stats'

const DEFAULT_REQUESTS = '200'
const DEFAULT_CONCURRENCY = '50'

export async function load(url: string, options: FetchOptions) {
  const requests = parseInt(options.requests || DEFAULT_REQUESTS)
  const concurrency = parseInt(options.concurrency || DEFAULT_CONCURRENCY)
  const duration = options.duration ? parseInt(options.duration) : undefined

  logger().debug(`Starting load test: ${requests} requests with ${concurrency} concurrency`)

  console.log(`Load test configuration`)
  console.log(`URL: ${url}`)
  console.log(`Requests ${duration ? 'unlimited (time-based)' : requests}`)
  console.log(`Concurrency: ${concurrency}`)
  if (duration) console.log(`Duration: ${duration} seconds`)

  const stats = new StatsCollector()

  for (let i = 0; i < requests; i += concurrency) {
    const batchSize = Math.min(concurrency, requests - i)
    const batch = Array(batchSize)
      .fill(null)
      .map(() =>
        curl(url, options)
          .then(buildResponse)
          .catch((error) => ({
            duration: 0,
            status: 0,
            size: '0',
            error: error.message,
          })),
      )

    const batchResults = await Promise.all(batch)
    stats.addResults(batchResults)
  }

  const results = stats.getStats()
  console.log('results', results)

  logger().debug(`Finished load test: ${requests} requests with ${concurrency} concurrency`)
}
