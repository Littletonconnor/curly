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
