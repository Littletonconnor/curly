import React from 'react'
import { Box, Text } from 'ink'

interface HistogramProps {
  durations: number[]
  bucketCount?: number
  maxBarWidth?: number
}

interface Bucket {
  label: string
  count: number
  percentage: number
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
    }
  })
}

export function Histogram({ durations, bucketCount = 5, maxBarWidth = 30 }: HistogramProps) {
  const buckets = createBuckets(durations, bucketCount)

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
        return (
          <Box key={i}>
            <Text color="gray">{bucket.label.padEnd(maxLabelLen)} </Text>
            <Text color="green">{'█'.repeat(barLen)}</Text>
            <Text color="gray">{'░'.repeat(maxBarWidth - barLen)}</Text>
            <Text>
              {' '}
              {bucket.count} ({bucket.percentage.toFixed(1)}%)
            </Text>
          </Box>
        )
      })}
    </Box>
  )
}
