import React from 'react'
import { Box, Text, useInput } from 'ink'
import { ProgressBar, StatsPanel, Chart, Histogram, StatusCodes, Percentiles, Controls } from './components'
import { calculateRps, calculateAvgLatency, getPercentile } from '../stats'
import type { TuiState } from './types'

interface DashboardProps {
  state: TuiState
  onPause: () => void
  onResume: () => void
  onQuit: () => void
  onAdjustConcurrency: (delta: number) => void
  onResetStats: () => void
}

function getStatusIndicator(status: TuiState['status']): { symbol: string; color: string; text: string } {
  switch (status) {
    case 'running':
      return { symbol: '▶', color: 'green', text: 'Running' }
    case 'paused':
      return { symbol: '⏸', color: 'yellow', text: 'Paused' }
    case 'completed':
      return { symbol: '✓', color: 'cyan', text: 'Complete' }
    case 'stopped':
      return { symbol: '⏹', color: 'red', text: 'Stopped' }
  }
}

export function Dashboard({
  state,
  onPause,
  onResume,
  onQuit,
  onAdjustConcurrency,
  onResetStats,
}: DashboardProps) {
  const statusInfo = getStatusIndicator(state.status)
  const elapsedMs = performance.now() - state.startTime
  const elapsed = elapsedMs / 1000
  const rps = calculateRps(state.completed, elapsedMs)
  const avgLatency = calculateAvgLatency(state.durations)

  useInput((input, key) => {
    if (input === 'q' || (key.ctrl && input === 'c')) {
      onQuit()
    } else if (input === ' ') {
      if (state.status === 'paused') {
        onResume()
      } else if (state.status === 'running') {
        onPause()
      }
    } else if (input === '+' || input === '=') {
      onAdjustConcurrency(Math.ceil(state.concurrency * 0.1))
    } else if (input === '-' || input === '_') {
      onAdjustConcurrency(-Math.ceil(state.concurrency * 0.1))
    } else if (input === 'r') {
      onResetStats()
    }
  })

  // Compact layout for small terminals
  if (state.compact) {
    return (
      <Box flexDirection="column" borderStyle="round" paddingX={1}>
        <Box justifyContent="space-between">
          <Text bold>Curly: </Text>
          <Text color="cyan">{truncateUrl(state.url, 35)}</Text>
        </Box>

        <Box marginY={1}>
          <ProgressBar completed={state.completed} total={state.totalRequests} width={30} />
        </Box>

        <Box>
          <Text>RPS: </Text>
          <Text color="yellow">{rps.toFixed(1)}</Text>
          <Text> | Avg: </Text>
          <Text color="magenta">{avgLatency.toFixed(0)}ms</Text>
          <Text> | Errors: </Text>
          <Text color={state.errorCount > 0 ? 'red' : 'green'}>{state.errorCount}</Text>
        </Box>

        <Box marginTop={1}>
          <CompactStatusCodes statusCodes={state.statusCodes} />
        </Box>

        <Box marginTop={1}>
          <CompactPercentiles durations={state.durations} />
        </Box>

        <Box marginTop={1} borderStyle="single" borderTop borderBottom={false} borderLeft={false} borderRight={false}>
          <Controls status={state.status} compact />
        </Box>
      </Box>
    )
  }

  // Full layout
  return (
    <Box flexDirection="column" borderStyle="round" paddingX={1}>
      {/* Header */}
      <Box justifyContent="space-between">
        <Box>
          <Text bold>Curly Load Test: </Text>
          <Text color="cyan">{truncateUrl(state.url, 50)}</Text>
        </Box>
        <Box>
          <Text color={statusInfo.color}>
            {statusInfo.symbol} {statusInfo.text}
          </Text>
        </Box>
      </Box>

      <Box>
        <Text color="gray">
          Requests: {state.totalRequests} | Concurrency: {state.concurrency}
          {state.profileName && ` | Profile: ${state.profileName}`}
        </Text>
      </Box>

      {/* Progress */}
      <Box marginY={1} flexDirection="column">
        <Text bold>Progress</Text>
        <ProgressBar completed={state.completed} total={state.totalRequests} />
        <StatsPanel
          elapsed={elapsed}
          rps={rps}
          avgLatency={avgLatency}
          errorCount={state.errorCount}
          completed={state.completed}
          total={state.totalRequests}
        />
      </Box>

      {/* Charts row */}
      <Box>
        <Box flexDirection="column" flexGrow={1} marginRight={2}>
          <Chart title="Request Rate (req/s)" data={state.rpsHistory} height={5} />
        </Box>
        <Box flexDirection="column" flexGrow={1}>
          <Chart title="Latency (ms)" data={state.latencyHistory} height={5} />
        </Box>
      </Box>

      {/* Histogram */}
      <Box marginY={1}>
        <Histogram durations={state.durations} />
      </Box>

      {/* Status codes and percentiles row */}
      <Box>
        <Box flexDirection="column" flexGrow={1} marginRight={4}>
          <StatusCodes statusCodes={state.statusCodes} />
        </Box>
        <Box flexDirection="column" flexGrow={1}>
          <Percentiles durations={state.durations} />
        </Box>
      </Box>

      {/* Controls */}
      <Box marginTop={1} borderStyle="single" borderTop borderBottom={false} borderLeft={false} borderRight={false}>
        <Controls status={state.status} />
      </Box>
    </Box>
  )
}

function truncateUrl(url: string, maxLen: number): string {
  if (url.length <= maxLen) return url
  return url.slice(0, maxLen - 3) + '...'
}

function CompactStatusCodes({ statusCodes }: { statusCodes: Record<number, number> }) {
  const groups = { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 }
  for (const [code, count] of Object.entries(statusCodes)) {
    const c = parseInt(code, 10)
    if (c >= 200 && c < 300) groups['2xx'] += count
    else if (c >= 300 && c < 400) groups['3xx'] += count
    else if (c >= 400 && c < 500) groups['4xx'] += count
    else if (c >= 500) groups['5xx'] += count
  }

  return (
    <Box>
      <Text color="green">2xx: {groups['2xx']}</Text>
      <Text>  </Text>
      <Text color="yellow">3xx: {groups['3xx']}</Text>
      <Text>  </Text>
      <Text color="red">4xx: {groups['4xx']}</Text>
      <Text>  </Text>
      <Text color="redBright">5xx: {groups['5xx']}</Text>
    </Box>
  )
}

function CompactPercentiles({ durations }: { durations: number[] }) {
  if (durations.length === 0) {
    return <Text color="gray">p50: - p95: - p99: -</Text>
  }
  const sorted = [...durations].sort((a, b) => a - b)

  return (
    <Box>
      <Text color="gray">p50: </Text>
      <Text color="cyan">{getPercentile(sorted, 50).toFixed(0)}ms</Text>
      <Text>  </Text>
      <Text color="gray">p95: </Text>
      <Text color="yellow">{getPercentile(sorted, 95).toFixed(0)}ms</Text>
      <Text>  </Text>
      <Text color="gray">p99: </Text>
      <Text color="red">{getPercentile(sorted, 99).toFixed(0)}ms</Text>
    </Box>
  )
}
