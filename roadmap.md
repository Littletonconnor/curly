# Roadmap

## Authentication & Security

- Basic/Bearer authentication (--auth user:pass or --auth-type bearer)
- API key authentication (header-based)
- SSL/TLS options (ignore certificates, client certs, etc.)
- Proxy support (HTTP/HTTPS/SOCKS)

## Request Features

- Form data submission (-f flag for application/x-www-form-urlencoded)
- Multipart file uploads (-F file@/path/to/file)
- Request body from file (@file.json)
- Follow redirects (--follow with max redirects)
- Timeout settings (--timeout)
- Retry logic with backoff
- Session support (persistent cookies/headers across requests)
- Add some sort of multi request functionality where you can make multiple requests in parallel and grab averages like request duration, status codes, etc.

## Response Handling

- Download progress bars for large files
- Streaming responses (don't buffer entire response)
- Response timing info (DNS, connect, transfer times)
- Save response headers separately (--dump-header)
- Conditional requests (If-Modified-Since, ETags)

## Output & Formatting

- Syntax highlighting for JSON/HTML/XML
- Custom output formatting (jq-like JSON filtering)
- Quiet mode (-q suppress non-essential output)
- Verbose mode (-v show request details)
- Raw output mode (no formatting)
- Response metadata in structured format

## Developer Experience

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

Which of these categories interest you most? We could prioritize based on what would be most useful for your workflow.

## Other

- Setup eslint (or oxlint).
- Publish this as an actual NPM package.

## Load Testing Implementation

### Overview

Simple but effective load testing functionality inspired by `hey`, allowing users to fire off multiple concurrent requests and collect performance statistics.

### CLI Options

- `-n, --requests`: Number of requests to run (default: 200)
- `-c, --concurrency`: Number of concurrent workers (default: 50)
- `--duration`: Time-based testing in seconds (alternative to -n)
- `--load-test`: Flag to enable load testing mode

### Implementation Components

#### 1. Load Testing Module (`src/load-test.ts`)

- Request worker pool with concurrency control
- Parallel request execution using `Promise.all` with batching
- Timing metrics collection (latency, DNS, connect time)
- Response status code and error tracking

#### 2. Statistics Collector (`src/stats.ts`)

- Percentile calculations (50th, 95th, 99th)
- Min/max/average response times
- Success/failure rates by status code
- Requests per second calculation

#### 3. Load Test Output (`src/load-test-output.ts`)

- Progress indicator during execution
- Summary report with:
  - Total requests, duration, concurrency
  - Response time distribution
  - Status code breakdown
  - Requests per second
  - Latency percentiles
- Optional table format using existing table utility

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
Load Test Results:
==================
URL:           https://api.example.com
Requests:      1000
Concurrency:   10
Duration:      12.5s

Response Times:
  Min:         45ms
  Max:         523ms
  Mean:        125ms
  Median:      112ms
  95th:        287ms
  99th:        412ms

Status Codes:
  200:         950 (95%)
  500:         30  (3%)
  Timeout:     20  (2%)

Throughput:    80 req/s
Data Transfer: 2.5 MB
```

### Implementation Notes

- Reuse existing fetch logic from `src/fetch.ts`
- Maintain compatibility with all existing options
- Keep load testing code modular and separate
- Consider Node.js worker threads for high concurrency
- Memory-efficient statistics collection
