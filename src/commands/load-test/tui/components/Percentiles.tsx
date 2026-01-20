import React from 'react'
import { Box, Text } from 'ink'

interface PercentilesProps {
  durations: number[]
}

function getPercentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  const idx = Math.ceil((p / 100) * sorted.length) - 1
  return sorted[Math.max(0, idx)]
}

export function Percentiles({ durations }: PercentilesProps) {
  if (durations.length === 0) {
    return (
      <Box flexDirection="column">
        <Text bold>Percentiles</Text>
        <Text color="gray">  No data yet...</Text>
      </Box>
    )
  }

  const sorted = [...durations].sort((a, b) => a - b)
  const p50 = getPercentile(sorted, 50)
  const p75 = getPercentile(sorted, 75)
  const p90 = getPercentile(sorted, 90)
  const p99 = getPercentile(sorted, 99)

  return (
    <Box flexDirection="column">
      <Text bold>Percentiles</Text>
      <Box>
        <Text color="gray">p50: </Text>
        <Text color="cyan">{p50.toFixed(0)}ms</Text>
      </Box>
      <Box>
        <Text color="gray">p75: </Text>
        <Text color="cyan">{p75.toFixed(0)}ms</Text>
      </Box>
      <Box>
        <Text color="gray">p90: </Text>
        <Text color="yellow">{p90.toFixed(0)}ms</Text>
      </Box>
      <Box>
        <Text color="gray">p99: </Text>
        <Text color="red">{p99.toFixed(0)}ms</Text>
      </Box>
    </Box>
  )
}
