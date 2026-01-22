import type { StatsCollector } from '../stats'

export interface LoadTestJsonExport {
  summary: {
    totalRequests: number
    successful: number
    failed: number
    duration: number
    requestsPerSecond: number
  }
  latency: {
    min: number
    max: number
    avg: number
    p10: number
    p25: number
    p50: number
    p75: number
    p90: number
    p95: number
    p99: number
  }
  statusCodes: Record<number, number>
  errors: (string | undefined)[]
}

export function formatJson(stats: StatsCollector, duration: number): string {
  const statsData = stats.getStats()
  const requestsPerSecond = statsData.total / duration

  const exportData: LoadTestJsonExport = {
    summary: {
      totalRequests: statsData.total,
      successful: statsData.successful,
      failed: statsData.failed,
      duration: Number(duration.toFixed(4)),
      requestsPerSecond: Number(requestsPerSecond.toFixed(4)),
    },
    latency: {
      min: Number((statsData.min ?? 0).toFixed(4)),
      max: Number((statsData.max ?? 0).toFixed(4)),
      avg: Number(statsData.mean.toFixed(4)),
      p10: Number(statsData.p10.toFixed(4)),
      p25: Number(statsData.p25.toFixed(4)),
      p50: Number(statsData.p50.toFixed(4)),
      p75: Number(statsData.p75.toFixed(4)),
      p90: Number(statsData.p90.toFixed(4)),
      p95: Number(statsData.p95.toFixed(4)),
      p99: Number(statsData.p99.toFixed(4)),
    },
    statusCodes: statsData.statusCodes,
    errors: statsData.errors,
  }

  return JSON.stringify(exportData, null, 2)
}
