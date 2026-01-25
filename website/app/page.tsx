import { CodeBlock } from '../components/CodeBlock'
import { Playground } from '../components/Playground'

const features = [
  {
    title: 'Smart Defaults',
    description: 'Auto-sets Content-Type for JSON, infers methods, and parses responses intelligently.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
  },
  {
    title: 'Load Testing',
    description: 'Built-in load testing with concurrency control, histograms, and percentile stats.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
  },
  {
    title: 'Environment Variables',
    description: 'Use {{VAR}} syntax to inject secrets without exposing them in shell history.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
  {
    title: 'Config Profiles',
    description: 'Define named profiles with base URLs, headers, and timeouts. Switch with --profile.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: 'Saved Aliases',
    description: 'Save complex requests with --save and replay them instantly with --use.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
      </svg>
    ),
  },
  {
    title: 'Retry & Resilience',
    description: 'Automatic retry with exponential backoff, timeouts, and redirect handling.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
  },
  {
    title: 'Output Control',
    description: 'Save to file with -o, structured JSON output with -j, or custom formats with -w.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    title: 'Cookie Handling',
    description: 'Send cookies with -b, save response cookies to a jar with --cookie-jar.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.125-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.17c0 .62-.504 1.124-1.125 1.124H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265zm-3 0a.375.375 0 11-.53 0L9 2.845l.265.265zm6 0a.375.375 0 11-.53 0L15 2.845l.265.265z" />
      </svg>
    ),
  },
  {
    title: 'Interactive TUI',
    description: 'Live dashboard for load testing with -T. See real-time charts, histograms, and stats.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
      </svg>
    ),
  },
  {
    title: 'Form & File Upload',
    description: 'Send multipart form data with -F. Upload files using @file syntax.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
  },
  {
    title: 'Proxy Support',
    description: 'Route requests through HTTP/HTTPS proxy with -x for debugging or corporate networks.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
      </svg>
    ),
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-5xl px-6 pb-24 pt-20 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
            curly
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-400">
            A modern HTTP client for the command line. Curl-like syntax with smart defaults,
            built-in load testing, and developer-friendly features.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2.5">
              <span className="text-neutral-500">$</span>
              <code className="font-mono text-sm text-neutral-200">npm install -g @cwl/curly</code>
            </div>
            <a
              href="https://github.com/Littletonconnor/curly"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-neutral-800 px-4 py-2.5 text-sm font-medium text-neutral-200 transition-colors hover:bg-neutral-700"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Playground Section */}
      <section className="border-y border-neutral-800 bg-neutral-900/50">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="text-2xl font-semibold text-white">Try it out</h2>
          <p className="mt-2 text-neutral-400">Select an example and click Run to see curly in action.</p>
          <div className="mt-8">
            <Playground />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <h2 className="text-2xl font-semibold text-white">Features</h2>
        <p className="mt-2 text-neutral-400">Everything you need for HTTP requests and API testing.</p>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="group">
              <div className="mb-4 inline-flex rounded-lg bg-emerald-500/10 p-2.5 text-emerald-400">
                {feature.icon}
              </div>
              <h3 className="text-lg font-medium text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Code Examples */}
      <section className="border-t border-neutral-800 bg-neutral-900/30">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <h2 className="text-2xl font-semibold text-white">Quick Examples</h2>
          <p className="mt-2 text-neutral-400">Common patterns to get you started.</p>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <div>
              <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-neutral-500">Basic Requests</h3>
              <div className="space-y-4">
                <CodeBlock code="curly https://api.example.com/users" />
                <CodeBlock code='curly -X POST -d name="Alice" https://api.example.com/users' />
                <CodeBlock code="curly -X DELETE https://api.example.com/users/1" />
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-neutral-500">Headers & Auth</h3>
              <div className="space-y-4">
                <CodeBlock code='curly -H "Authorization: Bearer {{TOKEN}}" https://api.example.com/me' />
                <CodeBlock code="curly -u admin:secret https://api.example.com/admin" />
                <CodeBlock code="curly -i https://api.example.com/users/1" />
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-neutral-500">Load Testing</h3>
              <div className="space-y-4">
                <CodeBlock code="curly -n 1000 -c 50 https://api.example.com/health" />
                <CodeBlock code='curly -n 100 -c 10 -X POST -d test=true https://api.example.com/benchmark' />
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-neutral-500">Resilience</h3>
              <div className="space-y-4">
                <CodeBlock code="curly --retry 3 --retry-delay 1000 https://api.example.com/unstable" />
                <CodeBlock code="curly -t 5000 https://api.example.com/slow" />
                <CodeBlock code="curly -L --max-redirects 5 https://example.com/redirect" />
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-neutral-500">Output Control</h3>
              <div className="space-y-4">
                <CodeBlock code="curly -o response.json https://api.example.com/data" />
                <CodeBlock code="curly -j https://api.example.com/users | jq ." />
                <CodeBlock code={`curly -w '%{http_code} %{time_total}s' --quiet https://api.example.com`} />
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-neutral-500">Cookies & Forms</h3>
              <div className="space-y-4">
                <CodeBlock code='curly -b "session=abc123" https://api.example.com/me' />
                <CodeBlock code='curly -F name=John -F avatar=@photo.jpg https://api.example.com/upload' />
                <CodeBlock code="curly --cookie-jar cookies.txt https://api.example.com/login" />
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-neutral-500">Advanced</h3>
              <div className="space-y-4">
                <CodeBlock code="curly -x http://proxy:8080 https://api.example.com" />
                <CodeBlock code="curly -n 1000 -T https://api.example.com/health" />
                <CodeBlock code="curly -n 100 -e json -o results.json https://api.example.com" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="border-t border-neutral-800">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <h2 className="text-2xl font-semibold text-white">curl vs curly</h2>
          <p className="mt-2 text-neutral-400">Same power, less typing.</p>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm font-medium text-neutral-500">curl</span>
                <span className="rounded bg-neutral-800 px-2 py-0.5 text-xs text-neutral-500">verbose</span>
              </div>
              <CodeBlock
                code={`curl -X POST \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Hello","body":"World"}' \\
  https://api.example.com/posts`}
              />
            </div>
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm font-medium text-emerald-400">curly</span>
                <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">simple</span>
              </div>
              <CodeBlock
                code={`curly -X POST \\
  -d title=Hello \\
  -d body=World \\
  https://api.example.com/posts`}
              />
            </div>
          </div>
          <p className="mt-6 text-center text-sm text-neutral-500">
            Content-Type is set automatically. JSON is built from key-value pairs.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-neutral-900/50">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-6">
              <a
                href="https://github.com/Littletonconnor/curly"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-neutral-400 transition-colors hover:text-white"
              >
                GitHub
              </a>
              <a
                href="https://www.npmjs.com/package/@cwl/curly"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-neutral-400 transition-colors hover:text-white"
              >
                npm
              </a>
            </div>
            <p className="text-sm text-neutral-500">
              Built by{' '}
              <a
                href="https://github.com/Littletonconnor"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 transition-colors hover:text-white"
              >
                Connor Littleton
              </a>
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
