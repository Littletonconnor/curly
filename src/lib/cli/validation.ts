import { logger } from '../utils/logger'

const VALID_EXPORT_FORMATS = ['json', 'csv'] as const

export function validateExportFlag(exportFormat: string | undefined, isLoadTest: boolean): void {
  if (exportFormat && !isLoadTest) {
    logger().error('--export is only available in load test mode (use -n or -c)')
  }
  if (
    exportFormat &&
    !VALID_EXPORT_FORMATS.includes(exportFormat as (typeof VALID_EXPORT_FORMATS)[number])
  ) {
    logger().error(`Invalid export format: "${exportFormat}". Valid formats: json, csv`)
  }
}
