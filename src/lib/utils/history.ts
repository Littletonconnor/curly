import { promises } from 'fs'
import { styleText } from 'node:util'
import { logger } from './logger'
import { ensureConfigDir, CONFIG_DIR } from './fs'
import { isNodeError, getErrorMessage } from '../../types'

const HISTORY_PATH = `${CONFIG_DIR}/history`
const MAX_HISTORY_ENTRIES = 1000

/**
 * Appends the current command to the history file.
 * Creates the config directory if it doesn't exist.
 * Automatically caps the file at MAX_HISTORY_ENTRIES lines.
 */
export async function writeHistoryFile(): Promise<void> {
  await ensureConfigDir()
  const args = process.argv.slice(2)
  const command = `curly ${args.join(' ')}`

  try {
    let lines: string[] = []
    try {
      const content = await promises.readFile(HISTORY_PATH, 'utf8')
      lines = content.split('\n').filter((l) => l.length > 0)
    } catch {
      // File doesn't exist yet — start fresh
    }

    lines.push(command)

    // Keep only the most recent entries
    if (lines.length > MAX_HISTORY_ENTRIES) {
      lines = lines.slice(lines.length - MAX_HISTORY_ENTRIES)
    }

    await promises.writeFile(HISTORY_PATH, lines.join('\n') + '\n', 'utf8')
  } catch (error: unknown) {
    logger().error(`There was an error writing to the history file: ${getErrorMessage(error)}`)
  }
}

/**
 * Reads and prints the command history file to stdout.
 */
export async function printHistoryFile(): Promise<void> {
  const lines = await readHistoryLines()
  console.log(styleText('yellowBright', '\n---- [CURLY] HISTORY ----'))
  for (const line of lines) {
    console.log(line)
  }
}

/**
 * Deletes the history file, clearing all saved history.
 */
export async function clearHistoryFile(): Promise<void> {
  try {
    await promises.unlink(HISTORY_PATH)
    console.log('History cleared.')
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      console.log('History is already empty.')
    } else {
      logger().error(`Failed to clear history: ${getErrorMessage(error)}`)
    }
  }
}

/**
 * Searches the history file for entries matching the given term
 * and prints matching lines to stdout.
 */
export async function searchHistoryFile(term: string): Promise<void> {
  const lines = await readHistoryLines()
  const matches = lines.filter((line) => line.toLowerCase().includes(term.toLowerCase()))

  if (matches.length === 0) {
    console.log(`No history entries matching "${term}".`)
    return
  }

  console.log(
    styleText(
      'yellowBright',
      `\n---- [CURLY] HISTORY: "${term}" (${matches.length} match${matches.length === 1 ? '' : 'es'}) ----`,
    ),
  )
  for (const match of matches) {
    console.log(match)
  }
}

/**
 * Reads history lines from the file. Returns an empty array if the file doesn't exist.
 */
async function readHistoryLines(): Promise<string[]> {
  try {
    const content = await promises.readFile(HISTORY_PATH, 'utf8')
    return content.split('\n').filter((l) => l.length > 0)
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      logger().error('History file does not yet exist. Run at least one curly command!')
    } else {
      logger().error(`There was an error reading the history file: ${getErrorMessage(error)}`)
    }
    return []
  }
}
