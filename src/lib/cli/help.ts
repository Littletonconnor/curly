export function printHelpMessage() {
  const message = `Usage: curly [OPTIONS] <url>

Options:
  -h, --help                   Show help menu

  --history                    Show history logs (defaults to ~/curly_history.txt)

  -X, --method <METHOD>        HTTP method to use (default: GET)

  -d <key=value,...>           Key=value pairs for request body
                               Example: curly -X POST -d name=Connor -d age=28 https://example.com/api

  --data-raw <data>            Raw data input
                               Example: curly --data-raw '{"name": "Connor"}' https://example.com/api

  -F, --form <name=value>      Multipart form data (use @file for uploads)
                               Example: curly -F "file=@photo.jpg" -F "name=vacation" https://example.com/upload
                               Cannot be used with -d or --data-raw

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

  --cookie-jar                 Specify to which file you want curl to write all cookies after a completed operation.
                               Example: curly --cookie-jar saved_cookies.txt https://example.com

  -i, --include                Include HTTP headers in the output
                               Example: curly -i https://example.com

  -v, --verbose                Show detailed request/response information
                               Example: curly -v https://example.com

  --dry-run                    Show request details without sending the request
                               Useful for debugging complex requests
                               Example: curly --dry-run -X POST -d name=test https://example.com

  -f, --fail                   Exit with code 22 on HTTP errors (4xx/5xx)
                               Example: curly -f https://example.com/health || echo "Failed"

  -u, --user <user:pass>       Basic authentication credentials
                               Example: curly -u admin:secret https://example.com/protected

  --quiet                      Suppress status line (for piping output)
                               Example: curly --quiet https://example.com | jq .

  -j, --json                   Output response as structured JSON
                               Includes request info, response headers, timing, and body
                               Example: curly --json https://example.com
                               Example: curly --json https://example.com | jq '.timing.total'

  -w, --write-out <format>     Extract specific info from response (like curl -w)
                               Supported variables: http_code (or status_code), time_total, size_download
                               Example: curly -w status_code https://example.com
                               Example: curly -w "%{http_code}" https://example.com

  -t, --timeout <ms>           Request timeout in milliseconds
                               Example: curly -t 5000 https://example.com

  -L, --follow                 Follow HTTP redirects (disabled by default)
                               Example: curly -L https://example.com/redirect

  --max-redirects <num>        Maximum number of redirects to follow (default: 20)
                               Example: curly -L --max-redirects 5 https://example.com

  -n, --requests <num>         Number of requests for load testing
                               Example: curly -n 100 https://example.com

  -c, --concurrency <num>      Concurrency level for load testing
                               Example: curly -n 100 -c 10 https://example.com

  -T, --tui                    Enable interactive TUI dashboard for load testing
                               Shows live charts, histograms, and percentiles
                               Example: curly -n 1000 -c 50 --tui https://example.com

  --tui-compact                Force compact TUI layout (for smaller terminals)
                               Example: curly -n 1000 --tui --tui-compact https://example.com

  -e, --export <format>        Export load test results to file (json, csv)
                               Use with -o to specify output file
                               Example: curly -n 100 -c 10 --export json https://example.com
                               Example: curly -n 100 -c 10 --export csv -o results.csv https://example.com

  --retry <num>                Retry failed requests (default: 0)
                               Example: curly --retry 3 https://flaky-api.example.com

  --retry-delay <ms>           Initial delay between retries in ms (default: 1000)
                               Uses exponential backoff (1s, 2s, 4s, ...)
                               Example: curly --retry 3 --retry-delay 500 https://example.com

  -p, --profile <name>         Use a named profile from ~/.config/curly/config.json
                               Example: curly --profile prod /users

  --init                       Interactive wizard to set up configuration
                               Creates ~/.config/curly/config.json with profiles
                               Example: curly --init

  --completions <shell>        Generate shell completions (bash, zsh)
                               Example: curly --completions bash
                               Example: curly --completions install

  --save <name>                Save the request as a named alias
                               Example: curly --save "get-users" https://api.example.com/users

  --use <name>                 Execute a saved alias
                               Example: curly --use "get-users"
                               CLI flags override alias values

  --aliases                    List all saved aliases
                               Example: curly --aliases

  --delete-alias <name>        Delete a saved alias
                               Example: curly --delete-alias "get-users"

  -x, --proxy <url>            Route requests through a proxy server
                               Supports HTTP and HTTPS proxies
                               Example: curly --proxy http://localhost:8080 https://example.com
                               Example: curly -x http://proxy.corp.com:3128 https://api.example.com

`
  console.log(message)
}
