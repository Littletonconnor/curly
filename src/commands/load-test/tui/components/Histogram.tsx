import React from 'react'
import { Box, Text } from 'ink'
import { getPercentile } from '../../stats'

interface HistogramProps {
  durations: number[]
  bucketCount?: number
  maxBarWidth?: number
}

interface Bucket {
  label: string
  count: number
  percentage: number
  rangeStart: number
  rangeEnd: number
}

interface PercentileMarker {
  label: string
  value: number
  color: string
}

function createBuckets(durations: number[], bucketCount: number): Bucket[] {
  if (durations.length === 0) {
    return []
  }

  const sorted = [...durations].sort((a, b) => a - b)
  const min = sorted[0]
  const max = sorted[sorted.length - 1]

  // Handle case where all durations are the same
  if (max === min) {
    return [
      {
        label: `${min.toFixed(0)}ms`,
        count: durations.length,
        percentage: 100,
        rangeStart: min,
        rangeEnd: max,
      },
    ]
  }

  const bucketSize = (max - min) / bucketCount
  const buckets: number[] = Array(bucketCount).fill(0)

  for (const d of sorted) {
    const idx = Math.min(Math.floor((d - min) / bucketSize), bucketCount - 1)
    buckets[idx]++
  }

  return buckets.map((count, i) => {
    const start = min + i * bucketSize
    const end = start + bucketSize
    return {
      label: `${start.toFixed(0)}-${end.toFixed(0)}ms`,
      count,
      percentage: (count / durations.length) * 100,
      rangeStart: start,
      rangeEnd: end,
    }
  })
}

function getPercentileMarkers(durations: number[]): PercentileMarker[] {
  if (durations.length === 0) return []

  const sorted = [...durations].sort((a, b) => a - b)
  return [
    { label: 'p50', value: getPercentile(sorted, 50), color: 'cyan' },
    { label: 'p95', value: getPercentile(sorted, 95), color: 'yellow' },
    { label: 'p99', value: getPercentile(sorted, 99), color: 'red' },
  ]
}

function getBucketMarker(bucket: Bucket, markers: PercentileMarker[]): PercentileMarker | null {
  // Find the highest priority marker that falls within this bucket
  for (const marker of [...markers].reverse()) {
    if (marker.value >= bucket.rangeStart && marker.value < bucket.rangeEnd) {
      return marker
    }
  }
  // Special case: last bucket includes the max value
  const lastMarker = markers[markers.length - 1]
  if (lastMarker && lastMarker.value >= bucket.rangeStart && lastMarker.value <= bucket.rangeEnd) {
    return lastMarker
  }
  return null
}

export function Histogram({ durations, bucketCount = 10, maxBarWidth = 30 }: HistogramProps) {
  const buckets = createBuckets(durations, bucketCount)
  const markers = getPercentileMarkers(durations)

  if (buckets.length === 0) {
    return (
      <Box flexDirection="column">
        <Text bold>Latency Distribution</Text>
        <Text color="gray">  No data yet...</Text>
      </Box>
    )
  }

  const maxCount = Math.max(...buckets.map((b) => b.count))
  const maxLabelLen = Math.max(...buckets.map((b) => b.label.length))

  return (
    <Box flexDirection="column">
      <Text bold>Latency Distribution</Text>
      {buckets.map((bucket, i) => {
        const barLen = maxCount > 0 ? Math.round((bucket.count / maxCount) * maxBarWidth) : 0
        const marker = getBucketMarker(bucket, markers)
        return (
          <Box key={i}>
            <Text color="gray">{bucket.label.padEnd(maxLabelLen)} </Text>
            <Text color="green">{'█'.repeat(barLen)}</Text>
            <Text color="gray">{'░'.repeat(maxBarWidth - barLen)}</Text>
            <Text>
              {' '}
              {bucket.count} ({bucket.percentage.toFixed(1)}%)
            </Text>
            {marker && (
              <Text color={marker.color as 'cyan' | 'yellow' | 'red'}> ← {marker.label}</Text>
            )}
          </Box>
        )
      })}
    </Box>
  )
}
