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
- Fix bytes since I think it's not accurate.

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
