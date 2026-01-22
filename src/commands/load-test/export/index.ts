import { writeFile } from 'node:fs/promises'
import type { StatsCollector } from '../stats'
import { formatJson } from './json'
import { formatCsv } from './csv'

export type ExportFormat = 'json' | 'csv'

export function isValidExportFormat(format: string | undefined): format is ExportFormat {
  return format === 'json' || format === 'csv'
}

export function formatExport(stats: StatsCollector, duration: number, format: ExportFormat): string {
  switch (format) {
    case 'json':
      return formatJson(stats, duration)
    case 'csv':
      return formatCsv(stats, duration)
  }
}

export async function exportResults(
  stats: StatsCollector,
  duration: number,
  format: ExportFormat,
  outputPath?: string,
): Promise<void> {
  const content = formatExport(stats, duration, format)

  if (outputPath) {
    await writeFile(outputPath, content, 'utf-8')
    console.log(`\nResults exported to ${outputPath}`)
  } else {
    console.log('\n' + content)
  }
}
