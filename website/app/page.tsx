import { CodeBlock } from '../components/CodeBlock'
import { Playground } from '../components/Playground'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="px-6 py-24 text-center border-b border-[var(--border)]">
        <h1 className="text-5xl font-bold mb-4">curly</h1>
        <p className="text-xl text-[var(--muted)] mb-8 max-w-2xl mx-auto">
          HTTP requests made simple. A modern CLI tool with curl-like syntax, smart defaults, and
          built-in load testing.
        </p>
        <div className="flex items-center justify-center gap-4 mb-8">
          <code className="px-4 py-2 bg-[var(--code-bg)] border border-[var(--border)] rounded-lg font-mono">
            npm install -g @cwl/curly
          </code>
        </div>
        <div className="flex items-center justify-center gap-4">
          <a
            href="#playground"
            className="px-6 py-2 bg-[var(--accent)] hover:bg-[var(--accent-dim)] text-black font-medium rounded-lg transition-colors"
          >
            Try It
          </a>
          <a
            href="https://github.com/Littletonconnor/curly"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2 bg-[var(--border)] hover:bg-[var(--muted)] rounded-lg transition-colors"
          >
            GitHub
          </a>
        </div>
      </section>

      {/* Interactive Playground */}
      <section id="playground" className="px-6 py-16 border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">Try It</h2>
          <p className="text-[var(--muted)] mb-8">
            Select an example and click Run to see curly in action.
          </p>
          <Playground />
        </div>
      </section>

      {/* Resources */}
      <section className="px-6 py-16 border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">Resources</h2>
          <p className="text-[var(--muted)] mb-8">
            Use these endpoints for testing. All routes support GET, POST, PUT, PATCH, and DELETE.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { path: '/api/users', count: 5 },
              { path: '/api/posts', count: 10 },
              { path: '/api/todos', count: 15 },
              { path: '/api/comments', count: 10 },
            ].map((resource) => (
              <div
                key={resource.path}
                className="p-4 bg-[var(--code-bg)] border border-[var(--border)] rounded-lg"
              >
                <code className="text-[var(--accent)] font-mono">{resource.path}</code>
                <p className="text-sm text-[var(--muted)] mt-1">{resource.count} items</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Basic Requests */}
      <section className="px-6 py-16 border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">Basic Requests</h2>
          <p className="text-[var(--muted)] mb-8">Simple, intuitive syntax for all HTTP methods.</p>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">GET request</h3>
              <CodeBlock code="curly https://curly.dev/api/users/1" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">POST with JSON data</h3>
              <CodeBlock code='curly -X POST -d title="Hello" -d body="World" https://curly.dev/api/posts' />
              <p className="text-sm text-[var(--muted)] mt-2">
                Data is automatically converted to JSON. No need to set Content-Type.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">PUT / PATCH / DELETE</h3>
              <CodeBlock
                code={`curly -X PUT -d title="Updated" https://curly.dev/api/posts/1
curly -X PATCH -d completed=true https://curly.dev/api/todos/1
curly -X DELETE https://curly.dev/api/posts/1`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Headers & Query Params */}
      <section className="px-6 py-16 border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">Headers & Query Parameters</h2>
          <p className="text-[var(--muted)] mb-8">
            Add headers and query params with simple flags.
          </p>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Custom headers</h3>
              <CodeBlock code='curly -H "Authorization: Bearer token123" -H "Accept: application/json" https://curly.dev/api/users' />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Include response headers</h3>
              <CodeBlock code="curly -i https://curly.dev/api/users/1" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Query parameters</h3>
              <CodeBlock code="curly -q userId=1 -q completed=true https://curly.dev/api/todos" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">HEAD request (headers only)</h3>
              <CodeBlock code="curly -I https://curly.dev/api/posts/1" />
            </div>
          </div>
        </div>
      </section>

      {/* Data & File Uploads */}
      <section className="px-6 py-16 border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">Data & File Uploads</h2>
          <p className="text-[var(--muted)] mb-8">
            Multiple ways to send data, from simple key-value pairs to file uploads.
          </p>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Key-value pairs (auto-JSON)</h3>
              <CodeBlock code='curly -X POST -d title="My Post" -d body="Content here" -d userId=1 https://curly.dev/api/posts' />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Raw JSON data</h3>
              <CodeBlock
                code={`curly -X POST --data-raw '{"title": "My Post", "body": "Content"}' https://curly.dev/api/posts`}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Data from file</h3>
              <CodeBlock code="curly -X POST -d @payload.json https://curly.dev/api/posts" />
              <p className="text-sm text-[var(--muted)] mt-2">
                Content-Type is auto-detected from file extension.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Multipart file upload</h3>
              <CodeBlock code='curly -F "file=@photo.jpg" -F "title=My Photo" https://api.example.com/upload' />
            </div>
          </div>
        </div>
      </section>

      {/* Authentication */}
      <section className="px-6 py-16 border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">Authentication</h2>
          <p className="text-[var(--muted)] mb-8">Built-in support for common auth patterns.</p>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Basic auth</h3>
              <CodeBlock code="curly -u admin:secret https://api.example.com/protected" />
              <p className="text-sm text-[var(--muted)] mt-2">
                Credentials are automatically base64 encoded.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Bearer token</h3>
              <CodeBlock code='curly -H "Authorization: Bearer {{API_KEY}}" https://api.example.com/users' />
            </div>
          </div>
        </div>
      </section>

      {/* Resilience */}
      <section className="px-6 py-16 border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">Resilience</h2>
          <p className="text-[var(--muted)] mb-8">
            Handle flaky networks and slow endpoints gracefully.
          </p>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Retry with exponential backoff</h3>
              <CodeBlock code="curly --retry 3 --retry-delay 500 https://api.example.com/unstable" />
              <p className="text-sm text-[var(--muted)] mt-2">
                Retries on network errors with delays of 500ms, 1s, 2s...
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Timeout</h3>
              <CodeBlock code="curly -t 5000 https://api.example.com/slow-endpoint" />
              <p className="text-sm text-[var(--muted)] mt-2">
                Abort request if it takes longer than 5 seconds.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Fail on HTTP errors</h3>
              <CodeBlock code='curly -f https://api.example.com/health || echo "Health check failed"' />
              <p className="text-sm text-[var(--muted)] mt-2">
                Exit with code 22 on 4xx/5xx responses. Great for CI/CD.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Follow redirects</h3>
              <CodeBlock code="curly -L --max-redirects 5 https://example.com/redirect" />
            </div>
          </div>
        </div>
      </section>

      {/* Environment Variables */}
      <section className="px-6 py-16 border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">Environment Variables</h2>
          <p className="text-[var(--muted)] mb-8">
            Keep secrets out of your shell history with{' '}
            <code className="text-[var(--accent)]">{'{{VAR}}'}</code> syntax.
          </p>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">In headers</h3>
              <CodeBlock code='curly -H "Authorization: Bearer {{API_KEY}}" https://api.example.com/users' />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">In URLs</h3>
              <CodeBlock code='curly "{{BASE_URL}}/api/users"' />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">In request body</h3>
              <CodeBlock
                code={`curly -X POST --data-raw '{"userId": "{{USER_ID}}"}' https://api.example.com/action`}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">In basic auth</h3>
              <CodeBlock code='curly -u "{{API_USER}}:{{API_PASS}}" https://api.example.com/protected' />
            </div>
          </div>
        </div>
      </section>

      {/* Configuration Profiles */}
      <section className="px-6 py-16 border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">Configuration Profiles</h2>
          <p className="text-[var(--muted)] mb-8">
            Define named profiles in{' '}
            <code className="text-[var(--accent)]">~/.config/curly/config.json</code> to avoid
            repeating common options.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Config file</h3>
              <CodeBlock
                title="~/.config/curly/config.json"
                code={`{
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
}`}
              />
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Use default profile</h3>
                <CodeBlock code="curly /users" />
                <p className="text-sm text-[var(--muted)] mt-2">
                  Uses "dev" profile (set as default)
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Use specific profile</h3>
                <CodeBlock code="curly --profile prod /users" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Override profile settings</h3>
                <CodeBlock code="curly --profile prod --timeout 30000 /users" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Saved Aliases */}
      <section className="px-6 py-16 border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">Saved Aliases</h2>
          <p className="text-[var(--muted)] mb-8">
            Save frequently used requests and execute them with a single command.
          </p>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Save a request</h3>
              <CodeBlock code='curly --save "get-users" https://api.example.com/users' />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Save a complex request</h3>
              <CodeBlock
                code={`curly --save "create-post" \\
  -X POST \\
  -H "Authorization: Bearer {{API_KEY}}" \\
  -d title="New Post" \\
  https://api.example.com/posts`}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Execute an alias</h3>
              <CodeBlock code='curly --use "get-users"' />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">List & delete aliases</h3>
              <CodeBlock
                code={`curly --aliases            # List all saved aliases
curly --delete-alias "get-users"   # Delete an alias`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Load Testing */}
      <section className="px-6 py-16 border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">Load Testing</h2>
          <p className="text-[var(--muted)] mb-8">
            Built-in load testing with detailed performance statistics. Auto-detected when using{' '}
            <code className="text-[var(--accent)]">-n</code> or{' '}
            <code className="text-[var(--accent)]">-c</code> flags.
          </p>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Run a load test</h3>
              <CodeBlock code="curly -n 1000 -c 50 https://curly.dev/api/posts" />
              <p className="text-sm text-[var(--muted)] mt-2">
                Send 1000 requests with 50 concurrent connections.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Sample output</h3>
              <CodeBlock
                code={`Summary:
  Total:         10.5208 secs
  Slowest:       0.3903 secs
  Fastest:       0.0964 secs
  Average:       0.1631 secs
  Requests/sec:  475.2479

Response time histogram:
  0.096 [ 605]  |■■■■■■■■■■■■■■
  0.126 [1741]  |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
  0.155 [1278]  |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
  0.185 [1200]  |■■■■■■■■■■■■■■■■■■■■■■■■■■■■
  0.214 [  76]  |■■
  0.243 [  22]  |■
  0.273 [   5]  |
  0.302 [  29]  |■
  0.332 [   8]  |
  0.361 [  36]  |■

Latency distribution:
  10% in 0.1238 secs
  25% in 0.1352 secs
  50% in 0.1647 secs
  75% in 0.1888 secs
  90% in 0.2010 secs
  99% in 0.3278 secs

Status code distribution:
  [200] 5000 responses`}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Load test with POST data</h3>
              <CodeBlock
                code={`curly -n 100 -c 10 \\
  -X POST \\
  -d title="Load Test" \\
  -d body="Testing performance" \\
  https://curly.dev/api/posts`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Proxy Support */}
      <section className="px-6 py-16 border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">Proxy Support</h2>
          <p className="text-[var(--muted)] mb-8">
            Route requests through HTTP/HTTPS proxies. Useful for debugging with tools like
            mitmproxy, Charles, or Fiddler.
          </p>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Basic proxy usage</h3>
              <CodeBlock code="curly --proxy http://localhost:8080 https://api.example.com/users" />
              <p className="text-sm text-[var(--muted)] mt-2">
                Or use the short form: <code className="text-[var(--accent)]">-x</code>
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Proxy with verbose mode</h3>
              <CodeBlock code="curly -v -x http://localhost:8080 https://httpbin.org/get" />
            </div>
          </div>
        </div>
      </section>

      {/* Utilities */}
      <section className="px-6 py-16 border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">Utilities</h2>
          <p className="text-[var(--muted)] mb-8">Helpful features for everyday use.</p>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Verbose mode</h3>
              <CodeBlock code="curly -v https://curly.dev/api/users/1" />
              <p className="text-sm text-[var(--muted)] mt-2">
                See detailed request/response information.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Save to file</h3>
              <CodeBlock code="curly -o response.json https://curly.dev/api/users" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Quiet mode (for piping)</h3>
              <CodeBlock code="curly --quiet https://curly.dev/api/users/1 | jq .name" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Cookie handling</h3>
              <CodeBlock
                code={`curly -b sessionId=abc123 https://example.com/api
curly -b ./cookies.txt https://example.com/api
curly --cookie-jar ./cookies.json https://example.com/login`}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Command history</h3>
              <CodeBlock code="curly --history" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Shell completions</h3>
              <CodeBlock code="curly --completions install" />
              <p className="text-sm text-[var(--muted)] mt-2">
                Supports bash and zsh tab completions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="px-6 py-16 border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">curl vs curly</h2>
          <p className="text-[var(--muted)] mb-8">Same power, simpler syntax.</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-[var(--muted)]">curl</h3>
              <CodeBlock
                code={`curl -X POST \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Hello","body":"World"}' \\
  https://api.example.com/posts`}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-[var(--accent)]">curly</h3>
              <CodeBlock
                code={`curly -X POST \\
  -d title=Hello \\
  -d body=World \\
  https://api.example.com/posts`}
              />
            </div>
          </div>
          <p className="text-center text-[var(--muted)] mt-6">
            Content-Type is set automatically. JSON is built from key-value pairs.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 text-center text-[var(--muted)]">
        <div className="flex items-center justify-center gap-6 mb-4">
          <a
            href="https://github.com/Littletonconnor/curly"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--foreground)] transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://www.npmjs.com/package/@cwl/curly"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--foreground)] transition-colors"
          >
            npm
          </a>
        </div>
        <p className="text-sm">
          Built by{' '}
          <a
            href="https://github.com/Littletonconnor"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            Connor Littleton
          </a>
        </p>
      </footer>
    </main>
  )
}
