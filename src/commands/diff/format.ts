import { styleText } from 'node:util'

type DiffLine = { type: 'keep' | 'add' | 'remove'; text: string }

/**
 * Computes a line-level diff between two string arrays using LCS.
 * Returns a sequence of keep/add/remove operations.
 */
function diffLines(oldLines: string[], newLines: string[]): DiffLine[] {
  const m = oldLines.length
  const n = newLines.length

  const table: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        table[i][j] = table[i - 1][j - 1] + 1
      } else {
        table[i][j] = Math.max(table[i - 1][j], table[i][j - 1])
      }
    }
  }

  const result: DiffLine[] = []
  let i = m
  let j = n

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      result.push({ type: 'keep', text: oldLines[i - 1] })
      i--
      j--
    } else if (j > 0 && (i === 0 || table[i][j - 1] >= table[i - 1][j])) {
      result.push({ type: 'add', text: newLines[j - 1] })
      j--
    } else {
      result.push({ type: 'remove', text: oldLines[i - 1] })
      i--
    }
  }

  return result.reverse()
}

/**
 * Formats a unified diff between two JSON values with colored output.
 * Returns a string ready to print to stdout.
 */
export function formatDiff(baseline: unknown, current: unknown): string {
  const oldStr = JSON.stringify(baseline, null, 2)
  const newStr = JSON.stringify(current, null, 2)

  const lines = diffLines(oldStr.split('\n'), newStr.split('\n'))

  const formatted = lines.map((line) => {
    switch (line.type) {
      case 'remove':
        return styleText('red', `- ${line.text}`)
      case 'add':
        return styleText('green', `+ ${line.text}`)
      case 'keep':
        return styleText('gray', `  ${line.text}`)
    }
  })

  const adds = lines.filter((l) => l.type === 'add').length
  const removes = lines.filter((l) => l.type === 'remove').length
  const keeps = lines.filter((l) => l.type === 'keep').length

  formatted.push('')
  formatted.push(`${adds} additions, ${removes} removals, ${keeps} unchanged`)

  return formatted.join('\n')
}
