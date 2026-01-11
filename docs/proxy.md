# Proxy Support in Curly

## What is a Proxy?

A proxy server acts as an intermediary between your computer and the internet. When you make an HTTP request through a proxy, the request goes to the proxy first, which then forwards it to the destination server. The response follows the same path in reverse.

```
Without proxy:
┌─────────────┐                           ┌─────────────┐
│   curly     │ ────────────────────────→ │   server    │
└─────────────┘                           └─────────────┘

With proxy:
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   curly     │ ──────→ │   proxy     │ ──────→ │   server    │
└─────────────┘         └─────────────┘         └─────────────┘
```

## Why Use a Proxy?

### Corporate Networks

Many companies require all outbound traffic to pass through a proxy for:
- Security monitoring and logging
- Policy enforcement (blocking certain sites)
- Caching to reduce bandwidth

In these environments, direct connections to external servers are blocked at the firewall level. Without proxy support, curly simply cannot reach external URLs.

### Debugging & Traffic Inspection

Tools like **mitmproxy**, **Charles Proxy**, and **Fiddler** let you intercept and inspect HTTP traffic. This is invaluable for:
- Debugging API requests and responses
- Viewing exact headers and payloads
- Modifying requests to test edge cases

### Security Testing

Penetration testers use intercepting proxies like **Burp Suite** to:
- Analyze API behavior
- Test how servers handle malformed requests
- Identify security vulnerabilities

## Basic Usage

```sh
curly --proxy http://localhost:8080 https://api.example.com
curly -x http://proxy.corp.com:3128 https://api.example.com
```

The `-x` flag is the short form, matching curl's convention.

## How It Works Internally

### The Problem with Native Fetch

Node.js's native `fetch()` doesn't support proxies directly. The `RequestInit` type doesn't include a proxy option:

```typescript
// This doesn't work with native fetch
fetch(url, { proxy: 'http://localhost:8080' }) // ❌ No proxy option
```

### The Solution: Undici's ProxyAgent

Node's `fetch` is built on [undici](https://github.com/nodejs/undici), which provides a `ProxyAgent` class. We can pass this as a `dispatcher` option:

```typescript
import { ProxyAgent } from 'undici'

const proxyAgent = new ProxyAgent('http://localhost:8080')

fetch(url, {
  dispatcher: proxyAgent  // Routes through proxy
})
```

### What Happens When You Use --proxy

1. **Parse the proxy URL** - The `--proxy` flag value is validated and stored
2. **Create a ProxyAgent** - Before making the request, we instantiate a `ProxyAgent` with the proxy URL
3. **Pass as dispatcher** - The agent is passed to `fetch()` as the `dispatcher` option
4. **Tunnel the request** - The ProxyAgent handles the connection to the proxy, including CONNECT tunneling for HTTPS

```typescript
// Simplified flow in client.ts
function createProxyAgent(proxyUrl: string | undefined): ProxyAgent | undefined {
  if (!proxyUrl) return undefined
  return new ProxyAgent(proxyUrl)
}

// In executeFetch
const requestOptions = proxyAgent
  ? { ...fetchOptions, dispatcher: proxyAgent }
  : fetchOptions

const response = await fetch(url, requestOptions)
```

## Testing with mitmproxy

[mitmproxy](https://mitmproxy.org/) is a free, open-source interactive HTTPS proxy. It's perfect for testing and debugging HTTP traffic.

### Installation

```sh
# macOS
brew install mitmproxy

# Ubuntu/Debian
sudo apt install mitmproxy

# pip (cross-platform)
pip install mitmproxy
```

### Step-by-Step Testing

**Terminal 1: Start mitmproxy**

```sh
mitmproxy --listen-port 8080
```

This starts an interactive terminal UI showing all intercepted traffic.

**Terminal 2: Make a request through the proxy**

```sh
curly --proxy http://localhost:8080 https://httpbin.org/get
```

**What you'll see in mitmproxy:**

```
 >> GET https://httpbin.org/get
    ← 200 OK application/json 364b 245ms
```

Press Enter on the request to see full details:
- Request headers
- Response headers
- Response body

### HTTPS and Certificate Trust

When proxying HTTPS traffic, mitmproxy performs TLS interception. For this to work, your system needs to trust mitmproxy's CA certificate.

**Quick workaround for testing:**

Set the `NODE_TLS_REJECT_UNAUTHORIZED` environment variable:

```sh
NODE_TLS_REJECT_UNAUTHORIZED=0 curly --proxy http://localhost:8080 https://httpbin.org/get
```

**Proper solution:**

Install mitmproxy's CA certificate system-wide:

```sh
# Start mitmproxy
mitmproxy

# In another terminal, download the cert
curl --proxy http://localhost:8080 http://mitm.it/cert/pem -o mitmproxy-ca.pem

# Install (varies by OS)
# macOS: Open Keychain Access, import cert, mark as trusted
# Linux: Copy to /usr/local/share/ca-certificates/ and run update-ca-certificates
```

### Alternative: mitmweb

For a browser-based UI instead of terminal:

```sh
mitmweb --listen-port 8080
```

This opens a web interface at `http://localhost:8081` where you can inspect traffic.

## Verbose Mode

Use `-v` to see proxy connection details:

```sh
curly -v --proxy http://localhost:8080 https://httpbin.org/get
```

Output:
```
[proxy] Using proxy: http://localhost:8080
[request] GET https://httpbin.org/get
[response] 200 OK (245ms)
```

## Common Proxy Types

| Type | URL Format | Use Case |
|------|-----------|----------|
| HTTP | `http://host:port` | General purpose, corporate proxies |
| HTTPS | `https://host:port` | Encrypted connection to proxy |

## Error Handling

**Connection refused:**
```
Error: connect ECONNREFUSED 127.0.0.1:8080
```
The proxy server isn't running or isn't listening on that port.

**Proxy authentication required:**
```
Error: 407 Proxy Authentication Required
```
The proxy requires credentials. Support for authenticated proxies (`http://user:pass@proxy:port`) can be added in a future version.

## Comparison with curl

| curl | curly | Description |
|------|-------|-------------|
| `-x http://proxy:8080` | `-x http://proxy:8080` | HTTP proxy |
| `--proxy http://proxy:8080` | `--proxy http://proxy:8080` | Long form |
| `-x socks5://proxy:1080` | Not yet supported | SOCKS proxy |

## Limitations

- **SOCKS proxies** are not currently supported (HTTP/HTTPS only)
- **Proxy authentication** via URL (`http://user:pass@proxy:port`) is not yet implemented
- **PAC files** (Proxy Auto-Configuration) are not supported
