import type { StatsCollector } from '../stats'

export function formatCsv(stats: StatsCollector, duration: number): string {
  const statsData = stats.getStats()

  const lines: string[] = []

  lines.push('metric,value')
  lines.push(`total_requests,${statsData.total}`)
  lines.push(`successful,${statsData.successful}`)
  lines.push(`failed,${statsData.failed}`)
  lines.push(`duration_secs,${duration.toFixed(4)}`)
  lines.push(`requests_per_sec,${(statsData.total / duration).toFixed(4)}`)

  lines.push(`latency_min_secs,${(statsData.min ?? 0).toFixed(4)}`)
  lines.push(`latency_max_secs,${(statsData.max ?? 0).toFixed(4)}`)
  lines.push(`latency_avg_secs,${statsData.mean.toFixed(4)}`)
  lines.push(`latency_p10_secs,${statsData.p10.toFixed(4)}`)
  lines.push(`latency_p25_secs,${statsData.p25.toFixed(4)}`)
  lines.push(`latency_p50_secs,${statsData.p50.toFixed(4)}`)
  lines.push(`latency_p75_secs,${statsData.p75.toFixed(4)}`)
  lines.push(`latency_p90_secs,${statsData.p90.toFixed(4)}`)
  lines.push(`latency_p95_secs,${statsData.p95.toFixed(4)}`)
  lines.push(`latency_p99_secs,${statsData.p99.toFixed(4)}`)

  for (const [code, count] of Object.entries(statsData.statusCodes)) {
    lines.push(`status_${code},${count}`)
  }

  return lines.join('\n')
}
