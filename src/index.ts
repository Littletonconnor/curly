import { styleText } from "node:util"
import { cli } from './cli';
import { buildFetchOptions, printDebug, printHelpMessage, stout } from './utils';


async function main() {
  const { values, positionals } = cli()

  if (values.help) {
    printHelpMessage()
    process.exit(0);
  };

  if (positionals.length !== 1) {
    console.error(styleText('red', '[curly] You must provide only one positional argument (e.g., curly [arguments] google.com)'))
    process.exit(1)
  }

  const url = positionals[0]
  const response = await fetch(url, buildFetchOptions(values))
  const data = values.headers?.includes('application/json') ? await response.json() : await response.text()

  if (values.debug) {
    console.log(response.headers)
    printDebug(url, buildFetchOptions(values), response.status)
  }

  stout(data)
}

try {
  await main()
} catch (e: unknown) {
  console.error(e)
  process.exit(1)
}
