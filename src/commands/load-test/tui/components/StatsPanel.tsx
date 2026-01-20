import React from 'react'
import { Box, Text } from 'ink'

interface StatsPanelProps {
  elapsed: number
  rps: number
  avgLatency: number
  errorCount: number
  completed: number
  total: number
}

function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`
  }
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs.toFixed(0)}s`
}

function calculateEta(completed: number, total: number, elapsed: number): string {
  if (completed === 0 || completed >= total) return '-'
  const rate = completed / elapsed
  const remaining = (total - completed) / rate
  return formatTime(remaining)
}

export function StatsPanel({ elapsed, rps, avgLatency, errorCount, completed, total }: StatsPanelProps) {
  const eta = calculateEta(completed, total, elapsed)

  return (
    <Box flexDirection="column">
      <Box>
        <Text>Elapsed: </Text>
        <Text color="cyan">{formatTime(elapsed)}</Text>
        <Text> | ETA: </Text>
        <Text color="cyan">{eta}</Text>
        <Text> | RPS: </Text>
        <Text color="yellow">{rps.toFixed(1)}</Text>
        <Text> | Avg: </Text>
        <Text color="magenta">{avgLatency.toFixed(0)}ms</Text>
        {errorCount > 0 && (
          <>
            <Text> | Errors: </Text>
            <Text color="red">{errorCount}</Text>
          </>
        )}
      </Box>
    </Box>
  )
}
