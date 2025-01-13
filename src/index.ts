import { styleText } from 'node:util'
import { cli } from './cli.ts'
import { curl, printHelpMessage, stout, resolveData, asyncCompute } from './utils.ts'

async function main() {
  const { values, positionals } = cli()

  if (values.help) {
    printHelpMessage()
    process.exit(0)
  }

  if (positionals.length !== 1) {
    console.error(
      styleText(
        'red',
        '[curly] You must provide only one positional argument (e.g., curly [arguments] google.com)',
      ),
    )
    process.exit(1)
  }

  const url = positionals[0]
  const response = await curl(url, values)

  const data = await asyncCompute(async () => {
    if (!values.include) {
      return await resolveData(response)
    }
  })

  stout(url, values, response, data)
}

try {
  await main()
} catch (e: unknown) {
  console.error(e)
  process.exit(1)
}
