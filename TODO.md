# TODO

## Easy (1-2 hours each)

### ~~Verbose mode (`-v`)~~ ✓
~~Show request details (method, headers, body) before showing response. Similar to existing `--debug` but user-facing and cleaner.~~

### Basic auth (`-u user:pass`)
Support basic authentication with automatic base64 encoding.
```sh
curly -u admin:secret https://api.example.com/protected
```

### Ignore SSL certificates (`-k` / `--insecure`)
Skip SSL certificate verification for local development with self-signed certs.
```sh
curly -k https://localhost:8443/api
```

### Fail on HTTP errors (`-f` / `--fail`)
Exit with non-zero code on 4xx/5xx responses. Useful for scripts and CI.
```sh
curly -f https://api.example.com/health || echo "Health check failed"
```

### Response time display (`--time`)
Show request duration without full debug output.
```sh
curly --time https://api.example.com
# Output: 200 OK (234ms)
```

### Setup linting
Add eslint or oxlint for code quality.

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

---

## Housekeeping

- [ ] Publish to NPM

---

## Parked (Low Priority)

These features have limited value or can be achieved other ways:

- **Syntax highlighting** - High effort, users can pipe to `jq` or `bat`
- **JSON filtering (`--jq`)** - Users can pipe to `jq`
- **Load test enhancements** - Core functionality complete, diminishing returns
- **Bearer token shorthand** - Already works with `-H "Authorization: Bearer ..."`
- **Client certificates** - Niche use case
