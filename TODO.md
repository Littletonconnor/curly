# TODO

## Easy (1-2 hours each)

### ~~Verbose mode (`-v`)~~ ✓
~~Show request details (method, headers, body) before showing response. Similar to existing `--debug` but user-facing and cleaner.~~

### ~~Basic auth (`-u user:pass`)~~ ✓
~~Support basic authentication with automatic base64 encoding.~~
```sh
curly -u admin:secret https://api.example.com/protected
```

### ~~Fail on HTTP errors (`-f` / `--fail`)~~ ✓
~~Exit with non-zero code on 4xx/5xx responses. Useful for scripts and CI.~~
```sh
curly -f https://api.example.com/health || echo "Health check failed"
```

### ~~Response time display~~ ✓
~~Show request duration without full debug output.~~
*Now shown by default in status line. Use `--quiet` to suppress.*

### ~~Setup linting~~ ✓
~~Add eslint or oxlint for code quality.~~

---

## Medium (half day - 1 day each)

### Request body from file (`@file.json`)
Support reading request body from a file using `@` syntax.
```sh
curly -X POST -d @payload.json https://api.example.com
```

### Retry logic with backoff
Automatic retry on failure with configurable attempts and delay.
```sh
curly --retry 3 --retry-delay 1000 https://flaky-api.example.com
```

### Environment variable interpolation
Replace `{{VAR}}` placeholders with environment variables in URLs, headers, and bodies.
```sh
curly -H "Authorization: Bearer {{API_KEY}}" https://api.example.com
```

### Config file support (`~/.curlyrc`)
Load default options from a config file.
```json
{
  "timeout": 5000,
  "headers": ["User-Agent: curly/1.0"]
}
```

---

## Hard (2+ days each)

### Multipart file uploads (`-F`)
Support file uploads with multipart/form-data.
```sh
curly -X POST -F "file=@photo.jpg" -F "name=vacation" https://api.example.com/upload
```

### Saved request aliases
Save and reuse named requests.
```sh
curly --save "get-users" -X GET https://api.example.com/users
curly --use "get-users"
```

### Shell completions
Generate completions for bash, zsh, and fish.

### Proxy support
HTTP/HTTPS/SOCKS proxy support.
```sh
curly --proxy http://proxy.example.com:8080 https://api.example.com
```

### Interactive TUI for load testing
Explore adding a real-time terminal UI dashboard for load testing that displays live metrics, charts, and statistics during test execution.

**Inspiration:**
- [ali](https://github.com/nakabonne/ali) - HTTP load testing with embedded terminal UI, real-time latency charts, percentiles, and zoomable graphs
- [vegeta + jplot](https://github.com/tsenart/vegeta) - Vegeta integrates with jplot/jaggr for real-time terminal charts
- [blessed-contrib](https://github.com/yaronn/blessed-contrib) - Node.js terminal dashboards with charts, maps, and gauges

**Potential features:**
- Live request rate and latency charts
- Response code distribution histogram
- P50/P95/P99 percentile tracking
- Error rate visualization
- Interactive controls (pause/resume, adjust rate)

**Libraries to evaluate:**
- [blessed](https://github.com/chjj/blessed) / [blessed-contrib](https://github.com/yaronn/blessed-contrib) - Terminal UI for Node.js
- [ink](https://github.com/vadimdemedes/ink) - React for CLI apps
- [terminal-kit](https://github.com/cronvel/terminal-kit) - Terminal utilities with drawing capabilities

---

## Housekeeping

- [ ] Publish to NPM

---

## Website (curly.dev or similar)

A marketing and documentation site inspired by [JSONPlaceholder](https://jsonplaceholder.typicode.com/), built with Next.js for easy deployment.

### Core Features

- **Landing page** - Clear value prop, installation instructions, comparison with curl
- **Interactive playground** - Live curly command builder with real-time response preview
- **Documentation** - Usage examples, all flags/options, common recipes

### Fake API for Testing

Similar to JSONPlaceholder, provide a public API that users can hit for testing:

```
GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id

GET    /api/posts
GET    /api/posts/:id
POST   /api/posts
...etc
```

Endpoints should return realistic fake data and support:
- Simulated latency (`?delay=1000`)
- Forced error responses (`?status=500`)
- Different response sizes for load testing

### Interactive Playground

- Command builder UI that generates curly commands
- Execute commands from browser and display formatted responses
- Shareable links to pre-configured requests
- Syntax highlighted output with JSON formatting

### Tech Stack

- **Framework**: Next.js (App Router)
- **Deployment**: Vercel
- **Styling**: TBD (Tailwind CSS likely)
- **API**: Next.js API routes with mock data

---

## Parked (Low Priority)

These features have limited value or can be achieved other ways:

- **Syntax highlighting** - High effort, users can pipe to `jq` or `bat`
- **JSON filtering (`--jq`)** - Users can pipe to `jq`
- **Load test enhancements** - Core functionality complete, diminishing returns
- **Bearer token shorthand** - Already works with `-H "Authorization: Bearer ..."`
- **Client certificates** - Niche use case
