import { cli } from './cli'
import { curl, resolveData } from './fetch'
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

    if (positionals.length !== 1) {
      logger().error(
        'You must provide only one positional argument (e.g., curly [arguments] google.com)',
      )
    } else if (values.head && (values.data || values['data-raw'])) {
      logger().error('(-d, --data) and HEAD (-I, --head) arguments were both passed.')
    }

    const url = positionals[0]
    const response = await curl(url, values)

    const data = await resolveData(response)

    await stdout(values, response, data)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}
