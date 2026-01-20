import React from 'react'
import { Box, Text } from 'ink'

interface ControlsProps {
  status: 'running' | 'paused' | 'completed' | 'stopped'
  compact?: boolean
}

export function Controls({ status, compact = false }: ControlsProps) {
  if (compact) {
    return (
      <Box>
        <Text color="gray">[Space] </Text>
        <Text>{status === 'paused' ? 'Resume' : 'Pause'}</Text>
        <Text color="gray">  [q] </Text>
        <Text>Quit</Text>
      </Box>
    )
  }

  return (
    <Box>
      <Text color="gray">[Space] </Text>
      <Text>{status === 'paused' ? 'Resume' : 'Pause'}</Text>
      <Text color="gray">  [+/-] </Text>
      <Text>Adjust RPS</Text>
      <Text color="gray">  [r] </Text>
      <Text>Reset Stats</Text>
      <Text color="gray">  [q] </Text>
      <Text>Quit</Text>
    </Box>
  )
}
