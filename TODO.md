# TODO

## Priority: Quick Wins

### Verbose mode (`-v`)

Show request details (method, headers, body) before showing response. Similar to existing `--debug` but user-facing.

---

## Priority: Medium Effort

### Authentication

- Basic auth: `--auth user:pass` or `-u user:pass`
- Bearer token: `--auth-type bearer -H "Authorization: Bearer token"`
- API key header support

### Request body from file

Support `@file.json` syntax to read request body from file.

```sh
curly -X POST -d @payload.json https://api.example.com
```

### Multipart file uploads

Support `-F` flag for file uploads.

```sh
curly -X POST -F file@/path/to/file https://api.example.com/upload
```

### Retry logic with backoff

Automatic retry on failure with configurable attempts and backoff.

```sh
curly --retry 3 --retry-delay 1000 https://flaky-api.example.com
```

---

## Priority: Nice to Have

### Load Testing Enhancements

The core load testing is complete. Remaining enhancements:

- Data transfer tracking (bytes sent/received)
- DNS and connect time tracking
- Error breakdown with sample error messages
- Worker threads for very high concurrency

### Output Enhancements

- Syntax highlighting for JSON/HTML/XML responses
- Custom JSON filtering (jq-like): `--jq '.data.items[]'`
- Raw output mode (`--raw`) to skip formatting
- Quiet mode (`-q`) to suppress non-essential output

### Developer Experience

- Config file support (`~/.curlyrc` for defaults)
- Shell completions (bash, zsh, fish)
- Request collections (save/load named requests)

### SSL/TLS & Proxy

- Ignore SSL certificates (`--insecure` or `-k`)
- Client certificate support
- Proxy support (HTTP/HTTPS/SOCKS)

---

## Housekeeping

- [ ] Setup eslint or oxlint
- [ ] Publish to NPM
