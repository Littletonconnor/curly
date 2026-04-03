# Curly Roadmap

A phased plan for making curly a polished, impressive, and feature-complete modern HTTP client CLI.

---

## Phase 1: Polish & Reliability

Core quality improvements that make the tool feel solid and production-ready.

### Input Validation & Error Messages
- [ ] Validate URL format before making requests (catch typos early)
- [ ] Validate header format (`Key: Value`) with helpful error on malformed input
- [ ] Validate `--timeout` is a positive number
- [ ] Validate `--max-redirects` is a non-negative integer
- [ ] Validate `--retry` and `--retry-delay` values
- [ ] Improve error messages with actionable suggestions (e.g., "Did you mean --follow?")
- [ ] Add `--retry-all-errors` flag to retry on HTTP errors (not just network errors)

### Redirect Handling
- [ ] Preserve request method on 307/308 redirects (currently always follows as GET)
- [ ] Show redirect chain in verbose mode (from → to for each hop)

### History Management
- [ ] Cap history file size (e.g., last 1000 entries)
- [ ] Add `--history clear` to reset history
- [ ] Add `--history search <term>` to search past commands

### Cookie Handling
- [ ] Validate Netscape cookie file format with clear error on malformed lines
- [ ] Support cookie expiration checking
- [ ] Warn when sending cookies over non-HTTPS connections

### Write-Out Enhancements
- [ ] Add `%{url_effective}` (final URL after redirects)
- [ ] Add `%{redirect_url}` (redirect destination)
- [ ] Add `%{num_redirects}` (redirect count)
- [ ] Add `%{content_type}` (response content type)
- [ ] Add `%{time_namelookup}`, `%{time_connect}`, `%{time_starttransfer}` for timing breakdown
- [ ] Add `%{header_json}` for response headers as JSON
- [ ] Support `%output{filename}` to send write-out to a file

---

## Phase 2: curl Feature Parity

Important curl features that users expect from a curl-like tool.

### Request Body Improvements
- [ ] `--data-urlencode` flag for URL-encoded form data
- [ ] `--data-binary @file` to send file contents as-is (no stripping)
- [ ] `--json` flag as shortcut (sets Content-Type + Accept to application/json, like curl 7.82+)
- [ ] Support reading request body from stdin (`-d @-`)

### Compression
- [ ] `--compressed` flag to send `Accept-Encoding: gzip, deflate, br` and auto-decompress
- [ ] Show compressed vs uncompressed size in verbose mode

### Connection Control
- [ ] `--connect-timeout` separate from `--timeout` (connection phase only)
- [ ] `--max-time` as alias for `--timeout` (curl compatibility)
- [ ] `--keepalive-time` for connection reuse
- [ ] `--dns-servers` to specify custom DNS resolvers
- [ ] `--resolve host:port:address` to pin DNS resolution

### TLS & Security
- [ ] `--cacert` to specify CA certificate bundle
- [ ] `--cert` / `--key` for client certificate authentication
- [ ] `-k` / `--insecure` to skip TLS verification
- [ ] Show TLS/certificate info in verbose mode (issuer, expiry, protocol version)

### Request Features
- [ ] `--rate` flag to limit requests per second (useful with load testing)
- [ ] `--expect100-timeout` for 100-continue handling
- [ ] `--range` for byte range requests (partial downloads)
- [ ] Support for `If-Modified-Since` / `If-None-Match` conditional requests
- [ ] `--netrc` / `--netrc-file` for credential lookup

### Output & Formatting
- [ ] `--no-buffer` flag for streaming output (real-time response body)
- [ ] `--raw` flag to output response body without any processing
- [ ] `--trace` flag for full request/response wire-level dump
- [ ] `--stderr` flag to redirect error output to a file
- [ ] Progress bar for uploads (not just downloads)
- [ ] `--silent` / `-s` flag (curl-compatible alias for `--quiet`)

---

## Phase 3: Modern Differentiators

Features that go beyond curl and make curly uniquely valuable as a modern tool.

### JSON Superpowers
- [ ] `--json-path` / `--jq` flag to filter JSON responses (e.g., `--jq '.data[0].name'`)
- [ ] JSON syntax highlighting with colors (not just Node inspect)
- [ ] Auto-detect JSON responses and pretty-print by default (with `--no-pretty` to disable)
- [ ] JSON diff between two responses (`curly --diff url1 url2`)

### Request Collections & Workflows
- [ ] `.curly.json` project file for storing request collections (like Postman/Insomnia)
- [ ] `curly run <collection-name>` to execute saved request sequences
- [ ] Variable interpolation within collections (e.g., use response from step 1 in step 2)
- [ ] Import from Postman/Insomnia collection formats

### API Testing Features
- [ ] `--assert` flag for response validation (e.g., `--assert 'status == 200'`, `--assert 'json.id exists'`)
- [ ] `--assert-header` to validate response headers
- [ ] `--assert-time` to validate response time (e.g., `--assert-time '<500ms'`)
- [ ] Exit code based on assertions (for CI/CD pipelines)
- [ ] `--repeat` flag to run the same request N times and show timing stats

### Response Caching & Comparison
- [ ] `--cache` flag to cache responses locally (honor Cache-Control or custom TTL)
- [ ] `--if-cached` to return cached response if available, else fetch
- [ ] Response diffing between cached and live responses

### Interactive Mode
- [ ] `curly -` or `curly --interactive` for a REPL-style mode
- [ ] Tab completion for URLs, headers, and methods within REPL
- [ ] History navigation within interactive mode
- [ ] Auto-suggest based on past commands

### Developer Experience
- [ ] `--curl` flag to output the equivalent curl command
- [ ] `--copy` flag to copy response body to clipboard
- [ ] `--open` flag to open response in browser (for HTML responses)
- [ ] `curly import <curl-command>` to convert curl commands to curly syntax
- [ ] `--color` / `--no-color` flags for explicit color control
- [ ] `--time` flag to show detailed timing breakdown (DNS, TCP, TLS, TTFB, total)

---

## Phase 4: Load Testing Excellence

Elevate the built-in load testing from basic to professional-grade.

### Execution Improvements
- [ ] Warmup phase (`--warmup <n>`) to exclude initial requests from stats
- [ ] Ramp-up mode (`--ramp-up <duration>`) to gradually increase concurrency
- [ ] Duration-based testing (`--duration <time>`) instead of fixed request count
- [ ] Rate limiting (`--rate <rps>`) to control requests per second
- [ ] Connection pooling optimization for sustained load

### Statistics & Reporting
- [ ] Standard deviation and variance in latency stats
- [ ] Error categorization (timeout, connection refused, HTTP errors) with counts
- [ ] Throughput graph (requests/sec over time) in TUI
- [ ] Apdex score calculation based on configurable threshold
- [ ] Comparison mode: run two tests and show side-by-side stats diff

### Output Formats
- [ ] HTML report generation (`--export html`) with embedded charts
- [ ] Markdown report generation (`--export md`) for documentation
- [ ] JUnit XML output (`--export junit`) for CI integration
- [ ] InfluxDB line protocol output for Grafana dashboards

### Advanced Load Patterns
- [ ] URL list file (`--urls-file`) to cycle through multiple endpoints
- [ ] Request body variation from file (one body per line)
- [ ] Custom success criteria (`--success-status 200,201,204`)
- [ ] Think time between requests (`--think-time <ms>`)
- [ ] Scenario mode: chain multiple requests as a user flow

---

## Phase 5: Ecosystem & Distribution

Make curly easy to install, extend, and integrate.

### Distribution
- [ ] Publish to npm registry with proper scoping
- [ ] Homebrew formula for macOS installation
- [ ] Release binaries via GitHub Releases (using pkg or similar)
- [ ] Docker image for containerized usage
- [ ] Man page generation from help text

### Shell Integration
- [ ] Fish shell completion support
- [ ] PowerShell completion support
- [ ] Oh My Zsh plugin
- [ ] Starship prompt integration (show last request status)

### Configuration
- [ ] Support `.curlyrc` file in project root for per-project defaults
- [ ] XDG Base Directory compliance for config file locations
- [ ] `--config` flag to specify alternate config file
- [ ] Environment variable support for all flags (e.g., `CURLY_TIMEOUT=5000`)

### Plugin System
- [ ] Plugin architecture for custom output formatters
- [ ] Plugin for OpenAPI/Swagger spec integration (auto-complete endpoints)
- [ ] Plugin for HAR (HTTP Archive) file export
- [ ] Plugin for GraphQL query support (with introspection)

### Documentation
- [ ] Comprehensive README with feature comparison table (curly vs curl vs httpie)
- [ ] Dedicated docs site with searchable flag reference
- [ ] Animated terminal demos (using asciinema or VHS)
- [ ] Cookbook with common recipes and patterns

---

## Phase 6: Code Quality & Testing

Strengthen the foundation for long-term maintainability.

### Testing
- [ ] Unit test suite (vitest) for core modules: parser, HTTP client, cookie handling, interpolation
- [ ] Integration tests with local mock server (avoid external API dependency)
- [ ] Snapshot tests for help text and output formatting
- [ ] CI/CD pipeline with automated test runs on PR

### Code Quality
- [ ] ESLint configuration with TypeScript rules
- [ ] Strict TypeScript (`strict: true` in tsconfig)
- [ ] Bundle size tracking and optimization
- [ ] Dependency audit and minimal dependency policy

### Performance
- [ ] Startup time benchmarking and optimization
- [ ] Lazy loading of heavy modules (ink, react, asciichart) only when needed
- [ ] Connection pooling for sequential requests
- [ ] Memory usage profiling for large file downloads

---

## Quick Wins (Can be done anytime)

Small improvements that punch above their weight.

- [ ] `--version` / `-V` flag to show version number
- [ ] Colorize HTTP methods in verbose output (GET=green, POST=blue, DELETE=red)
- [ ] Show request size in verbose mode (headers + body)
- [ ] Auto-detect and warn about mixed HTTP/HTTPS redirect chains
- [ ] Detect and pretty-print XML responses
- [ ] Support `NO_COLOR` environment variable (https://no-color.org/)
- [ ] Add `--max-filesize` to abort downloads over a size limit
- [ ] Short error summaries for common issues (ECONNREFUSED → "Connection refused - is the server running?")
- [ ] `--location-trusted` to send auth headers on redirects (like curl)
- [ ] Sort headers alphabetically in `-i` output for readability
