# Curly

![Curly Banner](./banner.svg)

A modern, developer-friendly HTTP client for the command line. Curly wraps Node.js `fetch` with curl-like syntax, adding built-in load testing, configuration profiles, and intelligent defaults.

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Usage](#usage)
  - [Basic Requests](#basic-requests)
  - [Headers & Authentication](#headers--authentication)
  - [Request Body](#request-body)
  - [Query Parameters](#query-parameters)
  - [Cookies](#cookies)
  - [Output Options](#output-options)
  - [Timeouts & Retries](#timeouts--retries)
  - [Redirects](#redirects)
  - [Proxy Support](#proxy-support)
- [Load Testing](#load-testing)
- [Configuration](#configuration)
  - [Profiles](#profiles)
  - [Aliases](#aliases)
  - [Environment Variables](#environment-variables)
- [Shell Completions](#shell-completions)
- [Command Reference](#command-reference)
- [Requirements](#requirements)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Familiar Syntax** - Curl-compatible flags (`-X`, `-H`, `-d`, `-I`) for easy migration
- **Smart Defaults** - Auto-sets `Content-Type: application/json` for POST requests with data
- **Response Parsing** - Automatically detects and pretty-prints JSON responses
- **Load Testing** - Built-in performance testing with histograms and percentile statistics
- **Configuration Profiles** - Define environments (dev/staging/prod) with base URLs and headers
- **Request Aliases** - Save and replay complex requests with a single command
- **Environment Interpolation** - Inject `{{ENV_VARS}}` into URLs, headers, and bodies
- **Cookie Management** - Full support for cookie files and cookie jars
- **File Uploads** - Multipart form data with automatic MIME type detection
- **Shell Completions** - Tab completion for bash and zsh

## Quick Start

```sh
# Simple GET request
curly https://api.example.com/users/1

# POST with JSON data
curly -X POST -d name=John -d email=john@example.com https://api.example.com/users

# Load test with 1000 requests at 50 concurrency
curly -n 1000 -c 50 https://api.example.com/health
```

## Installation

### npm (Recommended)

```sh
npm install -g @cwl/curly
```

### From Source

```sh
git clone https://github.com/Littletonconnor/curly.git
cd curly
npm install
npm run build
npm link
```

Verify installation:

```sh
curly --help
```

## Usage

```
curly [OPTIONS] <url>
```

### Basic Requests

```sh
# GET request (default)
curly https://api.example.com/posts/1

# Specify HTTP method
curly -X POST https://api.example.com/posts
curly -X PUT https://api.example.com/posts/1
curly -X PATCH https://api.example.com/posts/1
curly -X DELETE https://api.example.com/posts/1

# HEAD request (headers only)
curly -I https://api.example.com/posts/1
```

### Headers & Authentication

```sh
# Custom headers
curly -H "Accept: application/json" -H "X-API-Key: secret" https://api.example.com

# Basic authentication
curly -u username:password https://api.example.com/protected

# Bearer token
curly -H "Authorization: Bearer {{TOKEN}}" https://api.example.com/secure
```

### Request Body

**Key-value pairs** (automatically converted to JSON):

```sh
curly -X POST -d title="Hello" -d body="World" https://api.example.com/posts
# Sends: {"title": "Hello", "body": "World"}
```

**Raw JSON data**:

```sh
curly -X POST --data-raw '{"title": "Hello", "body": "World"}' https://api.example.com/posts
```

**From file**:

```sh
curly -X POST -d @payload.json https://api.example.com/posts
```

**Multipart form data** (file uploads):

```sh
curly -F "file=@document.pdf" -F "description=My file" https://api.example.com/upload
```

### Query Parameters

```sh
# Using flags
curly -q page=1 -q limit=10 https://api.example.com/posts

# In URL (also works)
curly "https://api.example.com/posts?page=1&limit=10"
```

### Cookies

```sh
# Send cookies
curly -b "session=abc123" -b "user=john" https://api.example.com

# Send cookies from file
curly -b ./cookies.json https://api.example.com

# Save received cookies
curly --cookie-jar ./cookies.json https://api.example.com/login
```

### Output Options

```sh
# Include response headers
curly -i https://api.example.com/posts/1

# Save response to file
curly -o response.json https://api.example.com/posts/1

# Quiet mode (suppress status line)
curly --quiet https://api.example.com/posts/1 | jq .title

# Structured JSON output
curly --json https://api.example.com/posts/1

# Extract specific values
curly -w http_code https://api.example.com/health
# Output: 200

# Verbose mode
curly -v https://api.example.com/posts/1

# Dry run (preview request without sending)
curly --dry-run -X POST -d name=test https://api.example.com
```

### Timeouts & Retries

```sh
# Set timeout (milliseconds)
curly -t 5000 https://api.example.com/slow-endpoint

# Retry with exponential backoff
curly --retry 3 https://api.example.com/flaky-endpoint

# Custom retry delay
curly --retry 3 --retry-delay 500 https://api.example.com/flaky-endpoint

# Exit with code 22 on HTTP errors
curly -f https://api.example.com/health || echo "Health check failed"
```

### Redirects

```sh
# Follow redirects
curly -L https://example.com/redirect

# Limit redirect count
curly -L --max-redirects 5 https://example.com/redirect
```

### Proxy Support

```sh
curly --proxy http://localhost:8080 https://api.example.com
curly -x http://proxy.company.com:3128 https://api.example.com
```

## Load Testing

Load testing mode activates automatically when `-n` (requests) or `-c` (concurrency) flags are present.

```sh
# Basic load test: 100 requests with 10 concurrent connections
curly -n 100 -c 10 https://api.example.com/posts/1
```

**Sample output**:

```
Summary:
  Total:         2.5208 secs
  Slowest:       0.3903 secs
  Fastest:       0.0964 secs
  Average:       0.1631 secs
  Requests/sec:  475.25

Response time histogram:
  0.096 [605]   |■■■■■■■■■■■■■■
  0.126 [1741]  |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
  0.155 [1278]  |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■

Latency distribution:
  50% in 0.1647 secs
  90% in 0.2010 secs
  99% in 0.3278 secs

Status code distribution:
  [200] 5000 responses
```

### Interactive TUI Dashboard

```sh
curly -n 1000 -c 50 --tui https://api.example.com/posts
```

The TUI provides real-time statistics, live histograms, and controls to pause/resume or adjust concurrency during the test.

### Export Results

```sh
# Export to JSON
curly -n 100 -c 10 --export json https://api.example.com/posts

# Export to CSV file
curly -n 100 -c 10 --export csv -o results.csv https://api.example.com/posts
```

## Configuration

### Interactive Setup

Run the configuration wizard to create profiles:

```sh
curly --init
```

This creates `~/.config/curly/config.json` with your settings.

### Profiles

Define named profiles with base URLs, headers, and default settings:

```json
{
  "default": "dev",
  "profiles": {
    "dev": {
      "baseUrl": "http://localhost:3000",
      "timeout": 5000,
      "headers": ["X-Debug: true"]
    },
    "prod": {
      "baseUrl": "https://api.example.com",
      "timeout": 10000,
      "headers": ["Authorization: Bearer {{API_KEY}}"],
      "retry": 3
    }
  }
}
```

Use profiles:

```sh
# Uses default profile
curly /users

# Specify profile
curly --profile prod /users

# CLI flags override profile settings
curly --profile prod --timeout 30000 /users
```

**Profile options**:

| Property | Type | Description |
|----------|------|-------------|
| `baseUrl` | string | Prepended to paths starting with `/` |
| `timeout` | number | Request timeout in milliseconds |
| `headers` | string[] | Headers in `"Name: value"` format |
| `retry` | number | Number of retry attempts |
| `retryDelay` | number | Initial retry delay in milliseconds |

### Aliases

Save complex requests for reuse:

```sh
# Save a request
curly --save "create-user" -X POST \
  -H "Authorization: Bearer {{TOKEN}}" \
  -d name=John -d email=john@example.com \
  https://api.example.com/users

# Execute saved alias
curly --use "create-user"

# List all aliases
curly --aliases

# Delete an alias
curly --delete-alias "create-user"
```

Aliases support environment variable interpolation - variables are resolved when the alias is executed.

### Environment Variables

Use `{{VAR}}` syntax to inject environment variables:

```sh
export API_KEY="sk-12345"
export BASE_URL="https://api.example.com"

curly -H "Authorization: Bearer {{API_KEY}}" "{{BASE_URL}}/users"
```

Works in URLs, headers, data, query parameters, cookies, and authentication credentials.

## Shell Completions

Install tab completions:

```sh
curly --completions install
```

Then restart your shell or source your config:

```sh
source ~/.bashrc   # bash
source ~/.zshrc    # zsh
```

## Command Reference

| Option | Short | Description |
|--------|-------|-------------|
| `--help` | `-h` | Display help information |
| `--method` | `-X` | HTTP method (GET, POST, PUT, DELETE, etc.) |
| `--headers` | `-H` | Add custom headers (repeatable) |
| `--data` | `-d` | Key=value pairs or @filename (repeatable) |
| `--data-raw` | | Send raw data |
| `--form` | `-F` | Multipart form data (repeatable) |
| `--query` | `-q` | Query parameters (repeatable) |
| `--cookie` | `-b` | Cookies (key=value or file path, repeatable) |
| `--cookie-jar` | | Save cookies to file |
| `--output` | `-o` | Write response to file |
| `--include` | `-i` | Include response headers |
| `--head` | `-I` | Fetch headers only |
| `--verbose` | `-v` | Show detailed request/response |
| `--dry-run` | | Preview request without sending |
| `--quiet` | | Suppress status line |
| `--json` | `-j` | Output as structured JSON |
| `--write-out` | `-w` | Extract response info (http_code, time_total, size_download) |
| `--timeout` | `-t` | Request timeout in milliseconds |
| `--follow` | `-L` | Follow HTTP redirects |
| `--max-redirects` | | Maximum redirects (default: 20) |
| `--fail` | `-f` | Exit with code 22 on HTTP errors |
| `--retry` | | Retry attempts with exponential backoff |
| `--retry-delay` | | Initial retry delay in milliseconds |
| `--user` | `-u` | Basic authentication (user:password) |
| `--proxy` | `-x` | HTTP/HTTPS proxy URL |
| `--requests` | `-n` | Number of requests (load testing) |
| `--concurrency` | `-c` | Concurrency level (load testing) |
| `--tui` | `-T` | Interactive TUI dashboard |
| `--export` | `-e` | Export results (json, csv) |
| `--profile` | `-p` | Use named profile |
| `--init` | | Interactive configuration wizard |
| `--save` | | Save request as alias |
| `--use` | | Execute saved alias |
| `--aliases` | | List saved aliases |
| `--delete-alias` | | Delete an alias |
| `--completions` | | Shell completion (bash, zsh, install) |
| `--history` | | View command history |

## Requirements

- Node.js >= 20

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests: `./examples/run-all-examples.sh`
5. Run checks: `npm run types && npm run format:check`
6. Commit your changes
7. Push to your branch
8. Open a Pull Request

## License

MIT
