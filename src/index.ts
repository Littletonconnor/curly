import { cli } from './cli.ts'
import { curl, printHelpMessage, stout, resolveData, asyncCompute, logger } from './utils.ts'

async function main() {
  const { values, positionals } = cli()

  if (values.help) {
    printHelpMessage()
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

  const data = await asyncCompute(async () => {
    return await resolveData(response)
  })

  stout(url, values, response, data)
}

try {
  await main()
} catch (e: unknown) {
  console.error(e)
  process.exit(1)
}
