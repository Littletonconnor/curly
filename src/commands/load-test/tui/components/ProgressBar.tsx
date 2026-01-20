import React from 'react'
import { Box, Text } from 'ink'

interface ProgressBarProps {
  completed: number
  total: number
  width?: number
}

export function ProgressBar({ completed, total, width = 40 }: ProgressBarProps) {
  const progress = total > 0 ? completed / total : 0
  const filledCount = Math.round(progress * width)
  const emptyCount = width - filledCount
  const percentage = (progress * 100).toFixed(1)

  return (
    <Box>
      <Text color="green">{'█'.repeat(filledCount)}</Text>
      <Text color="gray">{'░'.repeat(emptyCount)}</Text>
      <Text> {completed}/{total} ({percentage}%)</Text>
    </Box>
  )
}
