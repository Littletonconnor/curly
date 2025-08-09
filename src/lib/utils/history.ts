import { promises } from 'fs'
import { styleText } from 'node:util'
import os from 'os'
import path from 'path'
import { logger } from './logger'

// TODO: build some removal system in here.
// Example: We get to 1000 lines of history so we start to remove old entries.
export async function writeHistoryFile() {
  const filePath = path.join(os.homedir(), 'curly_history.txt')
  const args = process.argv.slice(2)
  const command = `curly ${args.join(' ')}\n`

  try {
    logger().debug(`Attempting to write history file at ${filePath}`)
    await promises.appendFile(filePath, command, 'utf8')
    logger().debug(`Successfully wrote to history file at ${filePath}`)
  } catch (e) {
    logger().error(`There was an error writing to the history file ${e}`)
  }
}

export async function printHistoryFile() {
  const filePath = path.join(os.homedir(), 'curly_history.txt')

  try {
    logger().debug(`Attempting to read history file at ${filePath}`)

    console.log(styleText('yellowBright', '\n📄 ---- [CURLY] HISTORY ----'))
    const fileContentBlog = await promises.readFile(filePath, { encoding: 'utf8' })
    const content = fileContentBlog.split('\n')
    for (const line of content) {
      console.log(line)
    }

    logger().debug(`Successfully read history file at ${filePath}`)
  } catch (e: any) {
    if (e.code === 'ENOENT') {
      logger().error('history file does not yet exist. Run at least one curly command!')
    } else {
      logger().error(`There was an error reading to the history file ${e}`)
    }
  }
}