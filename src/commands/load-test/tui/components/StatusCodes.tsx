import React from 'react'
import { Box, Text } from 'ink'

interface StatusCodesProps {
  statusCodes: Record<number, number>
  maxBarWidth?: number
}

type StatusGroup = '2xx' | '3xx' | '4xx' | '5xx'

function groupStatusCodes(statusCodes: Record<number, number>): Record<StatusGroup, number> {
  const groups: Record<StatusGroup, number> = {
    '2xx': 0,
    '3xx': 0,
    '4xx': 0,
    '5xx': 0,
  }

  for (const [code, count] of Object.entries(statusCodes)) {
    const codeNum = parseInt(code, 10)
    if (codeNum >= 200 && codeNum < 300) groups['2xx'] += count
    else if (codeNum >= 300 && codeNum < 400) groups['3xx'] += count
    else if (codeNum >= 400 && codeNum < 500) groups['4xx'] += count
    else if (codeNum >= 500) groups['5xx'] += count
  }

  return groups
}

function getStatusColor(group: StatusGroup): string {
  switch (group) {
    case '2xx':
      return 'green'
    case '3xx':
      return 'yellow'
    case '4xx':
      return 'red'
    case '5xx':
      return 'redBright'
  }
}

export function StatusCodes({ statusCodes, maxBarWidth = 20 }: StatusCodesProps) {
  const groups = groupStatusCodes(statusCodes)
  const total = Object.values(groups).reduce((a, b) => a + b, 0)
  const maxCount = Math.max(...Object.values(groups))

  if (total === 0) {
    return (
      <Box flexDirection="column">
        <Text bold>Status Codes</Text>
        <Text color="gray">  No data yet...</Text>
      </Box>
    )
  }

  return (
    <Box flexDirection="column">
      <Text bold>Status Codes</Text>
      {(Object.entries(groups) as [StatusGroup, number][])
        .filter(([, count]) => count > 0)
        .map(([group, count]) => {
          const barLen = maxCount > 0 ? Math.round((count / maxCount) * maxBarWidth) : 0
          const color = getStatusColor(group)
          return (
            <Box key={group}>
              <Text color={color}>{group} </Text>
              <Text color={color}>{'█'.repeat(barLen)}</Text>
              <Text color="gray">{'░'.repeat(maxBarWidth - barLen)}</Text>
              <Text> {count}</Text>
            </Box>
          )
        })}
    </Box>
  )
}
