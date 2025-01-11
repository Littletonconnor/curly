
export function printHelpMessage() {
  const message = `Usage: curly [--method <METHOD>] <url>
  Options:
    -h --help             Show help menu
    -X --method <METHOD>  HTTP method to use (default: GET)
    -d <key=value,...>         Comma-separated key=value pairs
    --d-raw <data>             Raw data input
    -H, --header <header>      Custom header to include (can be used multiple times)
`
  console.log(message)
}

export function stout<T>(data: T) {
  console.log(data)
}
