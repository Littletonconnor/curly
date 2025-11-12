export interface RequestResult {
  duration: number
  status: number
  size: string
  headers?: Headers
  error?: string
}

export const PERCENTILES = {
  p50: 50,
  p95: 95,
  p99: 99,
}

export class StatsCollector {
  private results: RequestResult[] = []

  addResults(results: RequestResult[]) {
    this.results.push(...results)
  }

  getPercentile(results: number[], percentile: number) {
    const length = results.length
    const index = Math.ceil((percentile / 100) * length) - 1
    return results[Math.max(0, index)]
  }

  getStatusCodes() {
    const breakdown: Record<number, number> = {}
    for (const result of this.results) {
      if (result.status === 0) return
      breakdown[result.status] = (breakdown[result.status] || 0) + 1
    }
    return breakdown
  }

  getStats() {
    const durations = this.results
      .filter((r) => !r.error)
      .map((r) => r.duration)
      .sort((a, b) => a - b)

    return {
      total: this.results.length,
      successful: durations.length,
      failed: this.results.length - durations.length,
      min: durations[0],
      max: durations[durations.length - 1],
      mean: durations.reduce((a, b) => a + b, 0) / durations.length,
      p50: this.getPercentile(durations, PERCENTILES.p50),
      p95: this.getPercentile(durations, PERCENTILES.p95),
      p99: this.getPercentile(durations, PERCENTILES.p99),
      statusCodes: this.getStatusCodes(),
      errors: this.results.filter((r) => r.error).map((r) => r.error),
    }
  }

  printSummary(duration: number) {
    const { min, max, mean, total } = this.getStats()
    const requestsPerSecond = total / duration

    console.log('')
    console.log('Summary:')
    console.log('  Slowest:      ', max.toFixed(2))
    console.log('  Fastest:      ', min.toFixed(2))
    console.log('  Average:      ', mean.toFixed(2))
    console.log('  Requests/sec: ', requestsPerSecond.toFixed(2))
  }

  printStatusCodeDistribution() {
    const statusCodes = this.getStatusCodes()
    if (!statusCodes) return

    console.log('')
    console.log('')
    console.log('Status code distribution:')
    for (const [key, value] of Object.entries(statusCodes)) {
      console.log(`  [${key}] ${value} responses`)
    }
  }
}
