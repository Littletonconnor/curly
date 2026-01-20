import React from 'react'
import { Box, Text } from 'ink'
import * as asciichart from 'asciichart'

interface ChartProps {
  title: string
  data: number[]
  height?: number
  color?: string
}

export function Chart({ title, data, height = 6 }: ChartProps) {
  // Need at least 2 points to render a chart
  const chartData = data.length < 2 ? [0, 0] : data.slice(-60)

  let chart: string
  try {
    chart = asciichart.plot(chartData, {
      height,
      padding: '      ',
      format: (x: number) => x.toFixed(0).padStart(5),
    })
  } catch {
    chart = '  No data yet...'
  }

  return (
    <Box flexDirection="column">
      <Text bold color="white">
        {title}
      </Text>
      <Text>{chart}</Text>
    </Box>
  )
}
