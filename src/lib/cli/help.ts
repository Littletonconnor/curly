export function printHelpMessage() {
  const message = `Usage: curly [OPTIONS] <url>

Options:
  -h, --help                   Show help menu

  -history, --history          Show hisory logs (defaults to ~./curly_history.txt)

  -X, --method <METHOD>        HTTP method to use (default: GET)

  -d <key=value,...>           Key=value pairs for request body
                               Example: curly -X POST -d name=Connor -d age=28 https://example.com/api

  --data-raw <data>            Raw data input
                               Example: curly --data-raw '{"name": "Connor"}' https://example.com/api

  -H, --header <header>        Specify request headers
                               Example: curly -H "Content-Type: application/json" https://example.com/api

  -q, --query <key=value>      Add query parameters to the URL
                               Example: curly -q "search=cli" https://example.com/api

  -o, --output                 Write output to a file instead of stdout
                               Example: curly -o ./test.txt https://example.com/api

  -I, --head                   Fetch only the headers
                               Example: curly -I https://example.com

  -b, --cookie                 Pass the data to the HTTP server in the cookie header.
                               Can be in the form of a string, or a file.
                               Example: curly -b "NAME1=VALUE1;" https://example.com

  -c, --cookie-jar             Specify to which file you want curl to write all cookies after a completed operation.
                               Example: curly -c saved_cookies.txt https://example.com


  -i, --include                Include HTTP headers in the output
                               Example: curly -i https://example.com

  -v, --verbose                Show detailed request/response information
                               Example: curly -v https://example.com

  -f, --fail                   Exit with code 22 on HTTP errors (4xx/5xx)
                               Example: curly -f https://example.com/health || echo "Failed"

  --quiet                      Suppress status line (for piping output)
                               Example: curly --quiet https://example.com | jq .
`
  console.log(message)
}
