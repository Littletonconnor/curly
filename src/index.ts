import { cli } from './cli.ts'
import { curl, resolveData } from './fetch.ts'
import { logger } from './logger.ts'
import { printHelpMessage, stdout } from './utils.ts'

export async function main() {
  try {
    const { values, positionals } = cli()

    if (values.help) {
      printHelpMessage()
      process.exit(0)
    }

    if (values.debug) {
      process.env.DEBUG = 'true'
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

    stdout(url, values, response, data)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}
