import { cli, printHelpMessage } from './lib/cli'
import { printHistoryFile, writeHistoryFile } from './lib/utils'
import { executeRequest } from './commands/request'
import { load } from './commands/load-test'

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

    const isLoadTest = cliFlags.concurrency || cliFlags.requests
    if (isLoadTest) {
      await load(url, cliFlags)
    } else {
      await executeRequest(url, cliFlags)
    }
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}
