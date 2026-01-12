'use client'

import { useState } from 'react'

interface Example {
  label: string
  command: string
  description: string
}

const examples: Example[] = [
  {
    label: 'GET User',
    command: 'curly https://curly.dev/api/users/1',
    description: 'Fetch a single user by ID',
  },
  {
    label: 'List Posts',
    command: 'curly https://curly.dev/api/posts',
    description: 'Get all posts',
  },
  {
    label: 'Create Post',
    command: 'curly -X POST -d title="Hello World" -d body="My first post" https://curly.dev/api/posts',
    description: 'Create a new post with JSON data',
  },
  {
    label: 'With Headers',
    command: 'curly -H "X-Custom-Header: my-value" -i https://curly.dev/api/users/1',
    description: 'Send custom headers and include response headers',
  },
  {
    label: 'Query Params',
    command: 'curly -q completed=true https://curly.dev/api/todos',
    description: 'Filter todos by completion status',
  },
  {
    label: 'Verbose Mode',
    command: 'curly -v https://curly.dev/api/users/1',
    description: 'See detailed request/response information',
  },
]

// Simulated responses for each example
const responses: Record<string, { status: string; time: string; body: string }> = {
  'GET User': {
    status: '200 OK',
    time: '42ms',
    body: `{
  "id": 1,
  "name": "Alice Johnson",
  "username": "alice",
  "email": "alice@example.com",
  "phone": "555-0101",
  "website": "alice.dev",
  "company": "TechCorp"
}`,
  },
  'List Posts': {
    status: '200 OK',
    time: '38ms',
    body: `[
  {
    "id": 1,
    "userId": 1,
    "title": "Getting Started with HTTP APIs",
    "body": "APIs are the backbone of modern web..."
  },
  {
    "id": 2,
    "userId": 1,
    "title": "Why Command Line Tools Matter",
    "body": "The terminal is where developers spend..."
  },
  ...
]`,
  },
  'Create Post': {
    status: '201 Created',
    time: '56ms',
    body: `{
  "id": 11,
  "userId": 1,
  "title": "Hello World",
  "body": "My first post"
}`,
  },
  'With Headers': {
    status: '200 OK',
    time: '45ms',
    body: `HTTP/1.1 200 OK
Content-Type: application/json
X-Request-Id: abc-123

{
  "id": 1,
  "name": "Alice Johnson",
  "email": "alice@example.com"
}`,
  },
  'Query Params': {
    status: '200 OK',
    time: '35ms',
    body: `[
  { "id": 1, "userId": 1, "title": "Review pull request #42", "completed": true },
  { "id": 3, "userId": 1, "title": "Set up CI/CD pipeline", "completed": true },
  { "id": 6, "userId": 2, "title": "Update dependencies", "completed": true },
  ...
]`,
  },
  'Verbose Mode': {
    status: '200 OK',
    time: '41ms',
    body: `> GET /api/users/1 HTTP/1.1
> Host: curly.dev
> Accept: */*
> User-Agent: curly/0.0.1

< HTTP/1.1 200 OK
< Content-Type: application/json
< X-Response-Time: 12ms

{
  "id": 1,
  "name": "Alice Johnson",
  "email": "alice@example.com"
}`,
  },
}

export function Playground() {
  const [selectedExample, setSelectedExample] = useState(examples[0])
  const [response, setResponse] = useState<{ status: string; time: string; body: string } | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleRun = async () => {
    setIsLoading(true)
    setResponse(null)

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 200))

    setResponse(responses[selectedExample.label])
    setIsLoading(false)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(selectedExample.command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Example selector */}
      <div className="flex flex-wrap gap-2">
        {examples.map((example) => (
          <button
            key={example.label}
            onClick={() => {
              setSelectedExample(example)
              setResponse(null)
            }}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              selectedExample.label === example.label
                ? 'bg-[var(--accent)] text-black font-medium'
                : 'bg-[var(--border)] hover:bg-[var(--muted)] text-[var(--foreground)]'
            }`}
          >
            {example.label}
          </button>
        ))}
      </div>

      {/* Command display */}
      <div className="code-block">
        <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)]">
          <span className="text-sm text-[var(--muted)]">{selectedExample.description}</span>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1 text-sm bg-[var(--border)] hover:bg-[var(--muted)] rounded transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleRun}
              disabled={isLoading}
              className="px-4 py-1 text-sm bg-[var(--accent)] hover:bg-[var(--accent-dim)] text-black font-medium rounded transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Running...' : 'Run'}
            </button>
          </div>
        </div>
        <pre className="p-4 font-mono text-sm">
          <span className="text-[var(--muted)]">$ </span>
          {selectedExample.command}
        </pre>
      </div>

      {/* Response display */}
      {(response || isLoading) && (
        <div className="code-block">
          <div className="flex items-center gap-4 px-4 py-2 border-b border-[var(--border)]">
            <span className="text-sm font-medium">Response</span>
            {response && (
              <>
                <span
                  className={`text-sm ${
                    response.status.startsWith('2') ? 'text-green-500' : 'text-yellow-500'
                  }`}
                >
                  {response.status}
                </span>
                <span className="text-sm text-[var(--muted)]">{response.time}</span>
              </>
            )}
          </div>
          <pre className="p-4 font-mono text-sm">
            {isLoading ? (
              <span className="text-[var(--muted)]">Loading...</span>
            ) : (
              response?.body
            )}
          </pre>
        </div>
      )}
    </div>
  )
}
