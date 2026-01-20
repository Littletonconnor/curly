import { promises } from 'fs'
import { styleText } from 'node:util'
import { logger } from './logger'
import { ensureConfigDir, CONFIG_DIR } from './fs'
import { isNodeError, getErrorMessage } from '../../types'

const HISTORY_PATH = `${CONFIG_DIR}/history`

/**
 * Appends the current command to the history file.
 * Creates the config directory if it doesn't exist.
 */
export async function writeHistoryFile(): Promise<void> {
  await ensureConfigDir()
  const args = process.argv.slice(2)
  const command = `curly ${args.join(' ')}\n`

  try {
    await promises.appendFile(HISTORY_PATH, command, 'utf8')
  } catch (error: unknown) {
    logger().error(`There was an error writing to the history file: ${getErrorMessage(error)}`)
  }
}

/**
 * Reads and prints the command history file to stdout.
 */
export async function printHistoryFile(): Promise<void> {
  try {
    console.log(styleText('yellowBright', '\n---- [CURLY] HISTORY ----'))
    const fileContentBlog = await promises.readFile(HISTORY_PATH, { encoding: 'utf8' })
    const content = fileContentBlog.split('\n')
    for (const line of content) {
      console.log(line)
    }
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      logger().error('history file does not yet exist. Run at least one curly command!')
    } else {
      logger().error(`There was an error reading the history file: ${getErrorMessage(error)}`)
    }
  }
}
