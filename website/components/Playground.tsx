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
    label: 'JSON Output',
    command: 'curly -j https://curly.dev/api/users/1',
    description: 'Structured JSON output with timing and metadata',
  },
  {
    label: 'Cookies',
    command: 'curly -b "session=demo123" https://curly.dev/api/users/1',
    description: 'Send cookies with your request',
  },
  {
    label: 'Write-Out',
    command: "curly -w '%{http_code} %{time_total}s' --quiet https://curly.dev/api/users/1",
    description: 'Custom output format with status code and timing',
  },
]

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
  'JSON Output': {
    status: '200 OK',
    time: '38ms',
    body: `{
  "request": {
    "method": "GET",
    "url": "https://curly.dev/api/users/1"
  },
  "response": {
    "status": 200,
    "statusText": "OK",
    "headers": {
      "content-type": "application/json"
    }
  },
  "timing": {
    "total": 38
  },
  "body": {
    "id": 1,
    "name": "Alice Johnson",
    "email": "alice@example.com"
  }
}`,
  },
  'Cookies': {
    status: '200 OK',
    time: '42ms',
    body: `{
  "id": 1,
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "session": "active"
}`,
  },
  'Write-Out': {
    status: '200 OK',
    time: '35ms',
    body: `200 0.035s`,
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
            className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
              selectedExample.label === example.label
                ? 'bg-emerald-500 font-medium text-black'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            {example.label}
          </button>
        ))}
      </div>

      {/* Command display */}
      <div className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900">
        <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2">
          <span className="text-sm text-neutral-400">{selectedExample.description}</span>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="rounded-md bg-neutral-800 px-3 py-1 text-sm text-neutral-300 transition-colors hover:bg-neutral-700"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleRun}
              disabled={isLoading}
              className="rounded-md bg-emerald-500 px-4 py-1 text-sm font-medium text-black transition-colors hover:bg-emerald-400 disabled:opacity-50"
            >
              {isLoading ? 'Running...' : 'Run'}
            </button>
          </div>
        </div>
        <pre className="overflow-x-auto p-4 font-mono text-sm">
          <span className="text-neutral-500">$ </span>
          <span className="text-neutral-200">{selectedExample.command}</span>
        </pre>
      </div>

      {/* Response display */}
      {(response || isLoading) && (
        <div className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900">
          <div className="flex items-center gap-4 border-b border-neutral-800 px-4 py-2">
            <span className="text-sm font-medium text-neutral-200">Response</span>
            {response && (
              <>
                <span
                  className={`text-sm font-medium ${
                    response.status.startsWith('2') ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {response.status}
                </span>
                <span className="text-sm text-neutral-500">{response.time}</span>
              </>
            )}
          </div>
          <pre className="overflow-x-auto p-4 font-mono text-sm text-neutral-300">
            {isLoading ? (
              <span className="text-neutral-500">Loading...</span>
            ) : (
              response?.body
            )}
          </pre>
        </div>
      )}
    </div>
  )
}
