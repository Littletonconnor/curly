import { cli } from './cli'
import { curl, buildResponse } from './fetch'
import { logger } from './logger'
import { printHelpMessage, printHistoryFile, stdout, writeHistoryFile } from './utils'

export async function main() {
  try {
    await writeHistoryFile()
    const { values, positionals } = cli()

    if (values.debug) {
      process.env.DEBUG = 'true'
    }

    if (values.help) {
      printHelpMessage()
      process.exit(0)
    }

    if (values.history) {
      await printHistoryFile()
      process.exit(0)
    }

    const url = positionals[positionals.length - 1]
    const response = await curl(url, values)

    const data = await buildResponse(response)

    await stdout(data, values)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}
