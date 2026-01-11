/**
 * Filesystem utilities
 */

import { promises as fs } from 'fs'
import os from 'os'
import path from 'path'
import { inspect } from 'node:util'
import { logger } from './logger'

export const CONFIG_DIR = path.join(os.homedir(), '.config', 'curly')

/**
 * Ensures the curly config directory exists.
 * Creates it recursively if it doesn't exist.
 */
export async function ensureConfigDir(): Promise<void> {
  await fs.mkdir(CONFIG_DIR, { recursive: true })
}

export interface WriteOutputOptions {
  colors?: boolean
}

/**
 * Writes data to a file using Node's inspect for formatting.
 * Handles errors gracefully with a warning log.
 */
export async function writeOutputToFile(
  data: unknown,
  outputPath: string,
  options: WriteOutputOptions = {},
): Promise<void> {
  const { colors = false } = options
  const buffer = inspect(data, { depth: null, maxArrayLength: null, colors })

  try {
    await fs.writeFile(outputPath, buffer, 'utf8')
  } catch {
    logger().warn(`Failed to write to output path ${outputPath}`)
  }
}
