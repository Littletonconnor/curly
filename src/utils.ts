import { styleText } from "node:util"
import { cli } from "./cli"

export function printHelpMessage() {
  const message = `Usage: curly [--method <METHOD>] <url>
  Options:
    -h --help             Show help menu
    -X --method <METHOD>  HTTP method to use (default: GET)
    -d <key=value,...>         Comma-separated key=value pairs
    --d-raw <data>             Raw data input
    -H, --header <header>      Custom header to include (can be used multiple times)
    --debug                    Print debug information
`
  console.log(message)
}

export function buildFetchOptions(options: ReturnType<typeof cli>['values']) {
  return {
    method: buildMethod(options.method),
    headers: buildHeaders(options.headers),
  }

}

function buildHeaders(headers: string[] | undefined) {
  if (!headers) return {}

  return headers.reduce((obj, h) => {
    if (!h.includes(':')) {
      console.error(styleText('red', '[curly]: Headers are improperly formatted.'))
      process.exit(1)
    }
    const [left, right] = h.split(':')
    return { ...obj, [left.trim()]: right.trim() }
  }, {})
}

function buildMethod(method: string) {
  return method
}

export function stout<T>(data: T) {
  console.log(data)
}

export function printDebug(url: string, options: RequestInit, status: number) {
  const { method, headers, body } = options;
  console.log(`[curly] Debug mode:`);
  console.log(`  URL      : ${url}`);
  console.log(`  Method   : ${method}`);
  console.log(`  Status   : ${status}`);
  if (headers && typeof headers === 'object' && Object.keys(headers).length) {
    console.log(`  Headers:`);
    for (const [key, value] of Object.entries(headers)) {
      console.log(`    ${key}: ${value}`);
    }
  } else {
    console.log(`  Headers  : None`);
  }
  console.log(`  Body     : ${body || 'None'}`);
}
