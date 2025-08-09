import { cli } from './cli'
import { curl, buildResponse } from './fetch'
import { load } from './load'
import { logger } from './logger'
import { printHelpMessage, printHistoryFile, stdout, writeHistoryFile } from './utils'

export async function main() {
  try {
    await writeHistoryFile()
    const { values: cliFlags, positionals } = cli()

    if (cliFlags.debug) {
      process.env.DEBUG = 'true'
    }

    if (cliFlags.help) {
      printHelpMessage()
      process.exit(0)
    }

    if (cliFlags.history) {
      await printHistoryFile()
      process.exit(0)
    }

    const url = positionals[positionals.length - 1]

    if (cliFlags['load-test']) {
      await load(url, cliFlags)
    } else {
      const response = await curl(url, cliFlags)
      const data = await buildResponse(response)
      await stdout(data, cliFlags)
    }
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}
