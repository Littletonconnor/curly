import { styleText } from 'node:util';
import { cli } from './cli';
import { printHelpMessage, stout } from './utils';


async function main() {
  const { values, positionals } = cli()

  if (values.help) {
    printHelpMessage()
    process.exit(0);
  };

  if (positionals.length !== 1) {
    console.error(styleText('red', 'curly must be used with a single positional argument (e.g., curly [arguments] google.com)'))
    process.exit(1)
  }

  const url = positionals[0]
  const response = await fetch(url)
  const data = await response.json();

  stout(data)
}

try {
  await main()
} catch (e: unknown) {
  console.error(e)
  process.exit(1)
}
