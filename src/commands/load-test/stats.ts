export interface RequestResult {
  duration: number
  status: number
  size: string
  headers?: Headers
  error?: string
}

export const PERCENTILES = {
  p10: 10,
  p25: 25,
  p50: 50,
  p75: 75,
  p90: 90,
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
      if (result.status === 0) continue
      breakdown[result.status] = (breakdown[result.status] || 0) + 1
    }
    return breakdown
  }

  getDurations() {
    return this.results
      .filter((r) => !r.error)
      .map((r) => r.duration / 1000)
      .sort((a, b) => a - b)
  }

  getStats() {
    const durations = this.getDurations()

    return {
      total: this.results.length,
      successful: durations.length,
      failed: this.results.length - durations.length,
      min: durations[0],
      max: durations[durations.length - 1],
      mean: durations.reduce((a, b) => a + b, 0) / durations.length,
      p10: this.getPercentile(durations, PERCENTILES.p10),
      p25: this.getPercentile(durations, PERCENTILES.p25),
      p50: this.getPercentile(durations, PERCENTILES.p50),
      p75: this.getPercentile(durations, PERCENTILES.p75),
      p90: this.getPercentile(durations, PERCENTILES.p90),
      p95: this.getPercentile(durations, PERCENTILES.p95),
      p99: this.getPercentile(durations, PERCENTILES.p99),
      statusCodes: this.getStatusCodes(),
      durations,
      errors: this.results.filter((r) => r.error).map((r) => r.error),
    }
  }

  print(duration: number) {
    this.printSummary(duration)
    this.printHistogram()
    this.printLatencyDistribution()
    this.printStatusCodeDistribution()
  }

  printSummary(duration: number) {
    const { min, max, mean, total } = this.getStats()
    const requestsPerSecond = total / duration

    console.log('')
    console.log('Summary:')
    console.log('  Total:        ', duration.toFixed(4), 'secs')
    console.log('  Slowest:      ', max.toFixed(4), 'secs')
    console.log('  Fastest:      ', min.toFixed(4), 'secs')
    console.log('  Average:      ', mean.toFixed(4), 'secs')
    console.log('  Requests/sec: ', requestsPerSecond.toFixed(4))
  }

  printHistogram() {
    const bucket = '■'
    const numBuckets = 10
    const maxBarLength = 40

    const { durations, min, max } = this.getStats()

    if (durations.length === 0) return

    const bucketSize = (max - min) / numBuckets

    const buckets = Array.from({ length: numBuckets }, () => 0)

    for (const duration of durations) {
      const bucketIndex = Math.floor((duration - min) / bucketSize)
      const finalIndex = bucketIndex >= numBuckets ? numBuckets - 1 : bucketIndex
      buckets[finalIndex]++
    }

    const maxCount = Math.max(...buckets)
    const maxCountWidth = String(maxCount).length

    console.log('')
    console.log('Response time histogram:')
    for (let i = 0; i < numBuckets; i++) {
      const bucketStart = min + i * bucketSize
      const count = buckets[i]
      const paddedCount = String(count).padStart(maxCountWidth)
      const barLength = maxCount > 0 ? Math.round((count / maxCount) * maxBarLength) : 0
      const bar = bucket.repeat(barLength)
      console.log(`  ${bucketStart.toFixed(3)} [${paddedCount}]    |${bar}`)
    }
  }

  printStatusCodeDistribution() {
    const statusCodes = this.getStatusCodes()
    if (!statusCodes || Object.keys(statusCodes).length === 0) return

    console.log('')
    console.log('')
    console.log('Status code distribution:')
    for (const [key, value] of Object.entries(statusCodes)) {
      console.log(`  [${key}] ${value} responses`)
    }
  }

  printLatencyDistribution() {
    const { p10, p25, p50, p75, p90, p99 } = this.getStats()

    console.log('')
    console.log('')
    console.log('Latency distribution:')
    console.log(`  10% in ${p10.toFixed(4)} secs`)
    console.log(`  25% in ${p25.toFixed(4)} secs`)
    console.log(`  50% in ${p50.toFixed(4)} secs`)
    console.log(`  75% in ${p75.toFixed(4)} secs`)
    console.log(`  90% in ${p90.toFixed(4)} secs`)
    console.log(`  99% in ${p99.toFixed(4)} secs`)
  }
}
