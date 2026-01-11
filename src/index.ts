import { cli, printHelpMessage } from './lib/cli'
import { printHistoryFile, writeHistoryFile, interpolate, interpolateArray } from './lib/utils'
import { executeRequest } from './commands/request'
import { load } from './commands/load-test'
import { setVerbose } from './lib/utils/logger'

export async function main() {
  try {
    await writeHistoryFile()
    const { values: cliFlags, positionals } = cli()

    if (cliFlags.verbose) {
      setVerbose(true)
    }

    if (cliFlags.help) {
      printHelpMessage()
      process.exit(0)
    }

    if (cliFlags.history) {
      await printHistoryFile()
      process.exit(0)
    }

    const rawUrl = positionals[positionals.length - 1]

    // Interpolate environment variables in URL and options
    const url = interpolate(rawUrl)
    const options = {
      ...cliFlags,
      headers: interpolateArray(cliFlags.headers),
      data: interpolateArray(cliFlags.data),
      'data-raw': cliFlags['data-raw'] ? interpolate(cliFlags['data-raw']) : undefined,
      cookie: interpolateArray(cliFlags.cookie),
      query: interpolateArray(cliFlags.query),
      user: cliFlags.user ? interpolate(cliFlags.user) : undefined,
    }

    const isLoadTest = options.concurrency || options.requests
    if (isLoadTest) {
      await load(url, options)
    } else {
      await executeRequest(url, options)
    }
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}
