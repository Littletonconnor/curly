import { readFile } from 'node:fs/promises'
import { logger } from '../../lib/utils/logger'
import { diff } from './diff'
import { formatDiff } from './format'

/**
 * Loads a saved baseline and compares it against the current response body.
 * Prints a colored unified diff to stdout.
 * Returns true if differences were found (caller can use for exit code).
 */
export async function handleDiff(responseBody: unknown, baselinePath: string): Promise<boolean> {
  let raw: string
  try {
    raw = await readFile(baselinePath, 'utf-8')
  } catch {
    logger().error(`Could not read baseline file: ${baselinePath}`)
    return false
  }

  let baseline: unknown
  try {
    baseline = JSON.parse(raw)
  } catch {
    logger().error(`Baseline file is not valid JSON: ${baselinePath}`)
    return false
  }

  const entries = diff(baseline, responseBody)

  if (entries.length === 0) {
    console.log('No differences found.')
    return false
  }

  console.log(formatDiff(baseline, responseBody))
  return true
}
