# TODO

## Load Testing Implementation (Next Priority)

### Overview

Simple but effective load testing functionality inspired by `hey`, allowing users to fire off multiple concurrent requests and collect performance statistics.

### Status: Partially Implemented

- ✅ Basic load test structure (`src/commands/load-test/index.ts`)
- ✅ Statistics collector (`src/commands/load-test/stats.ts`)
- ✅ CLI options (`-n, --requests`, `-c, --concurrency`, `--duration`, `--load-test`)
- ✅ Formatted summary report with proper output (`printSummary()` and `printStatusCodeDistribution()`)
- ✅ Requests per second calculation
- ⏳ Progress indicator during execution
- ⏳ Data transfer tracking
- ⏳ Auto-detect load test mode (remove need for `--load-test` flag)

### CLI Options

- `-n, --requests`: Number of requests to run (default: 200)
- `-c, --concurrency`: Number of concurrent workers (default: 50)
- `--duration`: Time-based testing in seconds (alternative to -n)
- `--load-test`: Flag to enable load testing mode

**TODO: Make `--load-test` flag unnecessary**

- Currently requires `--load-test` flag to avoid conflicts with other flags
- **Proposed solution**: Auto-detect load test mode when any load-test-specific flags are present (`-n`, `-c`, or `--duration`)
- This would allow: `curly -n 1000 -c 10 https://api.example.com` instead of `curly --load-test -n 1000 -c 10 https://api.example.com`
- Need to ensure no conflicts with existing flags

### Implementation Components

#### 1. Load Testing Module (`src/commands/load-test/index.ts`)

- ✅ Request worker pool with concurrency control
- ✅ Parallel request execution using `Promise.all` with batching
- ✅ Timing metrics collection (latency)
- ✅ Response status code and error tracking
- ✅ Total duration tracking for requests/sec calculation
- ⏳ DNS and connect time tracking
- ⏳ Remove duration flag

#### 2. Statistics Collector (`src/commands/load-test/stats.ts`)

- ✅ Percentile calculations (50th, 95th, 99th)
- ✅ Min/max/average response times
- ✅ Success/failure rates by status code
- ✅ Requests per second calculation
- ✅ Summary output formatting (`printSummary()`)
- ✅ Status code distribution output (`printStatusCodeDistribution()`)

#### 3. Load Test Output

- ✅ Summary report with:
  - Slowest/Fastest/Average response times
  - Requests per second
  - Status code breakdown
- ⏳ Progress indicator during execution
- ⏳ Response time distribution (percentiles in summary)
- ⏳ Optional table format using existing table utility
- ⏳ Error breakdown and sample errors display

### Example Usage

```bash
# Basic load test - 1000 requests with 10 concurrent
curly --load-test -n 1000 -c 10 https://api.example.com

# Time-based test - run for 30 seconds
curly --load-test --duration 30 -c 20 https://api.example.com

# With authentication and custom headers
curly --load-test -n 500 -c 5 -H "Authorization: Bearer token" https://api.example.com

# POST requests with body
curly --load-test -n 100 -c 10 -X POST -d name=test https://api.example.com/users
```

### Example Output

```
Summary:
  Slowest:      523.45
  Fastest:      45.12
  Average:      125.33
  Requests/sec: 80.00


Status code distribution:
  [200] 950 responses
  [500] 30 responses
```

### Implementation Notes

- ✅ Reuse existing fetch logic from `src/core/http/client.ts`
- ✅ Maintain compatibility with all existing options
- ✅ Keep load testing code modular and separate
- ⏳ Consider Node.js worker threads for high concurrency
- ✅ Memory-efficient statistics collection
- ⏳ Auto-detect load test mode to remove need for explicit `--load-test` flag

---

## Authentication & Security

- Basic/Bearer authentication (--auth user:pass or --auth-type bearer)
- API key authentication (header-based)
- SSL/TLS options (ignore certificates, client certs, etc.)
- Proxy support (HTTP/HTTPS/SOCKS)

## Request Features

- ✅ Basic HTTP methods (GET, POST, PUT, etc.)
- ✅ Headers support (-H)
- ✅ Query parameters (-q)
- ✅ Request body/data (-d, --data-raw)
- ✅ Cookie support (-b) with file and key-value pairs
- ✅ Cookie jar support (--cookie-jar)
- Form data submission (-f flag for application/x-www-form-urlencoded)
- Multipart file uploads (-F file@/path/to/file)
- Request body from file (@file.json)
- Follow redirects (--follow with max redirects)
- Timeout settings (--timeout)
- Retry logic with backoff
- Session support (persistent cookies/headers across requests)

## Response Handling

- ✅ Response formatting (JSON parsing, content-type detection)
- ✅ Response timing (duration tracking)
- ✅ Output to file (-o)
- ✅ Include headers in output (-i)
- ✅ Head request (-I)
- ✅ Summary mode (-S)
- ✅ Table output format (-T)
- Download progress bars for large files
- Streaming responses (don't buffer entire response)
- Response timing info (DNS, connect, transfer times)
- Save response headers separately (--dump-header)
- Conditional requests (If-Modified-Since, ETags)

## Output & Formatting

- ✅ Basic response output
- ✅ JSON response parsing
- ✅ Table formatting for headers/summary
- Syntax highlighting for JSON/HTML/XML
- Custom output formatting (jq-like JSON filtering)
- Quiet mode (-q suppress non-essential output)
- Verbose mode (-v show request details)
- Raw output mode (no formatting)
- Response metadata in structured format

## Developer Experience

- ✅ Debug mode (--debug)
- ✅ History file (~/curly_history.txt)
- Config file support (~/.curlyrc for defaults)
- Environment variable support for common settings
- Shell completions (bash, zsh, fish)
- Better error messages with suggestions
- Request collections (save/load named requests)
- Interactive mode for exploring APIs

## Testing & Debugging

- Mock server mode for testing
- Request/response recording for replay
- Diff mode to compare responses
- Benchmark mode (multiple requests with stats)

## Other

- Setup eslint (or oxlint)
- Publish this as an actual NPM package
