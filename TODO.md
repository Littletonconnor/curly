# TODO

## Load Testing Implementation (Next Priority)

### Overview

Simple but effective load testing functionality inspired by `hey`, allowing users to fire off multiple concurrent requests and collect performance statistics.

### Status: Partially Implemented

- ✅ Basic load test structure (`src/commands/load-test/index.ts`)
- ✅ Statistics collector (`src/commands/load-test/stats.ts`)
- ✅ CLI options (`-n, --requests`, `-c, --concurrency`)
- ✅ Formatted summary report with proper output (`printSummary()` and `printStatusCodeDistribution()`)
- ✅ Requests per second calculation
- ✅ Auto-detect load test mode (removed need for `--load-test` flag)
- ✅ Summary format matches `hey` output style (Total, Slowest, Fastest, Average, Requests/sec)
- ✅ Response time histogram
- ✅ Latency distribution (percentiles: 10%, 25%, 50%, 75%, 90%, 95%, 99%)
- ✅ Progress indicator during execution
- ⏳ Data transfer tracking

### CLI Options

- `-n, --requests`: Number of requests to run (default: 200)
- `-c, --concurrency`: Number of concurrent workers (default: 50)

**✅ Auto-detection implemented**: Load test mode is automatically detected when `-n` or `-c` flags are present, allowing: `curly -n 1000 -c 10 https://api.example.com`

### Implementation Components

#### 1. Load Testing Module (`src/commands/load-test/index.ts`)

- ✅ Request worker pool with concurrency control
- ✅ Parallel request execution using `Promise.all` with batching
- ✅ Timing metrics collection (latency)
- ✅ Response status code and error tracking
- ✅ Total duration tracking for requests/sec calculation
- ✅ Progress indicator during execution
- ⏳ DNS and connect time tracking

#### 2. Statistics Collector (`src/commands/load-test/stats.ts`)

- ✅ Percentile calculations (50th, 95th, 99th)
- ✅ Min/max/average response times
- ✅ Success/failure rates by status code
- ✅ Requests per second calculation
- ✅ Summary output formatting (`printSummary()`)
- ✅ Status code distribution output (`printStatusCodeDistribution()`)
- ✅ Response time histogram (`printHistogram()`)
- ✅ Latency distribution output (`printLatencyDistribution()`)

#### 3. Load Test Output

- ✅ Summary report with:
  - Total duration
  - Slowest/Fastest/Average response times
  - Requests per second
  - Status code breakdown
- ✅ Response time histogram (visual bar chart)
- ✅ Latency distribution (percentiles: 10%, 25%, 50%, 75%, 90%, 95%, 99%)
- ✅ Progress indicator during execution
- ⏳ Error breakdown and sample errors display

### Example Usage

```bash
# Basic load test - 1000 requests with 10 concurrent
curly -n 1000 -c 10 https://api.example.com

# With authentication and custom headers
curly -n 500 -c 5 -H "Authorization: Bearer token" https://api.example.com

# POST requests with body
curly -n 100 -c 10 -X POST -d name=test https://api.example.com/users
```

### Example Output

```
Summary:
  Total:        1.5160 secs
  Slowest:      0.3617 secs
  Fastest:      0.0541 secs
  Average:      0.1168 secs
  Requests/sec: 65.9638

Response time histogram:
  0.054 [1]     |■
  0.085 [34]    |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
  0.116 [36]    |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
  0.146 [14]    |■■■■■■■■■■■■■■■■
  0.177 [5]     |■■■■■■
  0.208 [0]     |
  0.239 [0]     |
  0.269 [0]     |
  0.300 [0]     |
  0.331 [7]     |■■■■■■■■
  0.362 [3]     |■■■

Latency distribution:
  10% in 0.0624 secs
  25% in 0.0698 secs
  50% in 0.0947 secs
  75% in 0.1210 secs
  90% in 0.3041 secs
  95% in 0.3213 secs
  99% in 0.3617 secs

Status code distribution:
  [200] 100 responses
```

### Implementation Notes

- ✅ Reuse existing fetch logic from `src/core/http/client.ts`
- ✅ Maintain compatibility with all existing options
- ✅ Keep load testing code modular and separate
- ✅ Memory-efficient statistics collection
- ✅ Auto-detect load test mode (no explicit flag needed)
- ⏳ Consider Node.js worker threads for high concurrency

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
