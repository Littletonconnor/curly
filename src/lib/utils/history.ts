import { promises } from 'fs'
import { styleText } from 'node:util'
import os from 'os'
import path from 'path'
import { logger } from './logger'

const CONFIG_DIR = path.join(os.homedir(), '.config', 'curly')
const HISTORY_PATH = path.join(CONFIG_DIR, 'history')

async function ensureConfigDir() {
  try {
    await promises.mkdir(CONFIG_DIR, { recursive: true })
  } catch {
    // Directory likely already exists
  }
}

// TODO: build some removal system in here.
// Example: We get to 1000 lines of history so we start to remove old entries.
export async function writeHistoryFile() {
  await ensureConfigDir()
  const args = process.argv.slice(2)
  const command = `curly ${args.join(' ')}\n`

  try {
    await promises.appendFile(HISTORY_PATH, command, 'utf8')
  } catch (e) {
    logger().error(`There was an error writing to the history file ${e}`)
  }
}

export async function printHistoryFile() {
  try {
    console.log(styleText('yellowBright', '\n📄 ---- [CURLY] HISTORY ----'))
    const fileContentBlog = await promises.readFile(HISTORY_PATH, { encoding: 'utf8' })
    const content = fileContentBlog.split('\n')
    for (const line of content) {
      console.log(line)
    }
  } catch (e: any) {
    if (e.code === 'ENOENT') {
      logger().error('history file does not yet exist. Run at least one curly command!')
    } else {
      logger().error(`There was an error reading to the history file ${e}`)
    }
  }
}
