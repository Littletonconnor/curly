const PADDING = 4
const MAX_VALUE_WIDTH = 80 // Maximum width for values to prevent wrapping

const BOX_CHARS = {
  topLeft: '┌',
  topRight: '┐',
  topMiddle: '┬',
  middleLeft: '├',
  middleRight: '┤',
  middleMiddle: '┼',
  bottomLeft: '└',
  bottomRight: '┘',
  bottomMiddle: '┴',
  horizontal: '─',
  vertical: '│',
}

function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.substring(0, maxLength - 3) + '...'
}

export function drawTable(rows: Array<{ label: string; value: string }>) {
  const [labelWidth, valueWidth] = calculateColumnWidths(rows)

  console.log()
  console.log(drawTopBorder(labelWidth, valueWidth))
  for (let i = 0; i < rows.length; i++) {
    console.log(drawDataRow(rows[i].label, rows[i].value, labelWidth, valueWidth))
    if (i < rows.length - 1) {
      console.log(drawMiddleBorder(labelWidth, valueWidth))
    }
  }
  console.log(drawBottomBorder(labelWidth, valueWidth))
}

export function drawDataRow(label: string, value: string, leftWidth: number, rightWidth: number) {
  let row = BOX_CHARS.vertical
  row += ' ' + label.padEnd(leftWidth) + '   '
  row += BOX_CHARS.vertical
  const truncatedValue = truncateString(value, MAX_VALUE_WIDTH)
  row += '   ' + truncatedValue.padStart(rightWidth) + ' '
  row += BOX_CHARS.vertical
  return row
}

export function calculateColumnWidths(rows: Array<{ label: string; value: string }>) {
  let longestLabel = 0
  let longestValue = 0

  for (const row of rows) {
    longestLabel = Math.max(longestLabel, row.label.length)
    const valueLength = Math.min(row.value.length, MAX_VALUE_WIDTH)
    longestValue = Math.max(longestValue, valueLength)
  }

  return [longestLabel, longestValue]
}

export function drawTopBorder(leftWidth: number, rightWidth: number) {
  let border = BOX_CHARS.topLeft
  for (let i = 0; i < leftWidth + PADDING; i++) {
    border += BOX_CHARS.horizontal
  }
  border += BOX_CHARS.topMiddle
  for (let i = 0; i < rightWidth + PADDING; i++) {
    border += BOX_CHARS.horizontal
  }
  border += BOX_CHARS.topRight

  return border
}

export function drawMiddleBorder(leftWidth: number, rightWidth: number) {
  let border = BOX_CHARS.middleLeft
  for (let i = 0; i < leftWidth + PADDING; i++) {
    border += BOX_CHARS.horizontal
  }
  border += BOX_CHARS.middleMiddle
  for (let i = 0; i < rightWidth + PADDING; i++) {
    border += BOX_CHARS.horizontal
  }
  border += BOX_CHARS.middleRight

  return border
}

export function drawBottomBorder(leftWidth: number, rightWidth: number) {
  let border = BOX_CHARS.bottomLeft
  for (let i = 0; i < leftWidth + PADDING; i++) {
    border += BOX_CHARS.horizontal
  }
  border += BOX_CHARS.bottomMiddle
  for (let i = 0; i < rightWidth + PADDING; i++) {
    border += BOX_CHARS.horizontal
  }
  border += BOX_CHARS.bottomRight

  return border
}
