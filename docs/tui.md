# TUI System Explained

## Overview

The TUI (Terminal User Interface) is a live, interactive dashboard for curly's load testing mode. Instead of a simple progress bar, it renders a full-screen display with real-time charts, histograms, percentile breakdowns, and keyboard controls — all inside the terminal.

It is built with **React** and **Ink** (a library that renders React components to the terminal instead of a browser). This means the dashboard is composed of declarative React components, uses `useState`/`useEffect` hooks, and re-renders on state changes — just like a web app, but outputting ANSI text.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  load() function                     │
│              src/commands/load-test/index.ts          │
│                                                      │
│  Dispatches HTTP requests in batches using           │
│  Promise.all, reports results through a              │
│  LoadReporter interface                              │
└──────────────┬───────────────────────────────────────┘
               │ calls reporter.onResult(),
               │ reporter.shouldContinue(), etc.
               ▼
┌─────────────────────────────────────────────────────┐
│              TuiController (EventEmitter)             │
│              src/commands/load-test/tui/index.tsx     │
│                                                      │
│  - Owns the TuiState object (single source of truth)│
│  - Mutates state directly on each event              │
│  - Emits 'update' events after every mutation        │
│  - Handles pause/resume/stop/repeat lifecycle        │
│  - Runs a 500ms interval to update chart history     │
└──────────────┬───────────────────────────────────────┘
               │ emits 'update' with new state
               ▼
┌─────────────────────────────────────────────────────┐
│              TuiApp (React component)                │
│                                                      │
│  - Listens for 'update' events on the controller    │
│  - Copies state into React via setState()            │
│  - Passes state + callbacks down to Dashboard        │
└──────────────┬───────────────────────────────────────┘
               │ props
               ▼
┌─────────────────────────────────────────────────────┐
│              Dashboard (React component)             │
│              src/commands/load-test/tui/Dashboard.tsx │
│                                                      │
│  - Renders all sub-components                        │
│  - Handles keyboard input via useInput()             │
│  - Chooses full or compact layout                    │
└──────────────┬───────────────────────────────────────┘
               │ renders
               ▼
┌─────────────────────────────────────────────────────┐
│              UI Components                           │
│              tui/components/                          │
│                                                      │
│  ProgressBar, StatsPanel, Chart, Histogram,          │
│  StatusCodes, Percentiles, Controls                  │
└─────────────────────────────────────────────────────┘
```

## How It Gets Activated

The TUI doesn't always run. The decision happens in `load()`:

```typescript
const useTui = shouldEnableTui(options, options.profileTui) && isTTY()
```

Three ways to enable it:
1. **CLI flag**: `--tui` on the command line
2. **Environment variable**: `CURLY_TUI=1`
3. **Profile setting**: `tui: true` in a saved profile

It also requires a TTY (interactive terminal). If you pipe output or run in CI, `isTTY()` returns false and the simple progress bar is used instead.

## The Reporter Abstraction

The load test runner doesn't know or care whether it's talking to a progress bar or a full TUI. Both implement the same `LoadReporter` interface:

```typescript
interface LoadReporter {
  shouldContinue(): boolean | Promise<boolean>
  getConcurrency(): number
  getAbortSignal?(): AbortSignal
  onResult(result: RequestResult): void
  onBatchComplete(results: RequestResult[]): void
  onComplete(stats: StatsCollector, duration: number): Promise<'quit' | 'repeat'>
  cleanup(): void
}
```

The simple reporter (`createProgressReporter`) prints a text progress bar. The TUI reporter (`createTuiReporter`) delegates everything to `TuiController`. This separation means the HTTP batching logic in `load()` is identical regardless of which UI is active.

## TuiController: The State Machine

`TuiController` extends `EventEmitter` and owns all mutable state. It acts as the bridge between the load test engine (imperative, async) and the React UI (declarative, reactive).

### State

All dashboard data lives in a single `TuiState` object:

```typescript
interface TuiState {
  status: 'running' | 'paused' | 'completed' | 'stopped'
  url: string
  totalRequests: number
  concurrency: number
  completed: number
  successCount: number
  errorCount: number
  startTime: number
  latencyHistory: number[]    // rolling window for charts
  rpsHistory: number[]        // rolling window for charts
  statusCodes: Record<number, number>
  durations: number[]         // all durations for percentiles
  // ...
}
```

### Lifecycle

The controller has four states:

```
running ──pause()──► paused
  ▲                    │
  │                 resume()
  │                    │
  └────────────────────┘

running ──complete()──► completed ──repeat()──► running
                           │
                         stop()
                           │
                           ▼
running ──stop()──────► stopped
```

- **running**: Requests are being dispatched. The 500ms history timer is active.
- **paused**: The abort controller cancels in-flight requests. `waitForResume()` blocks the load loop with a Promise until the user presses space or quits.
- **completed**: All requests finished. The dashboard stays on screen. The user can press `r` to repeat or `q` to quit.
- **stopped**: Terminal state. Resources are cleaned up.

### Event Flow

When a request completes, the flow is:

1. `load()` calls `reporter.onResult(result)`
2. The TUI reporter calls `controller.recordResult()`
3. `recordResult()` mutates `this.state` (increments counters, pushes duration)
4. `recordResult()` emits `'update'` with the new state
5. `TuiApp`'s `useEffect` listener receives the event
6. `setState({ ...newState })` triggers a React re-render
7. Ink diffs the terminal output and repaints only what changed

### Chart History Updates

A separate `setInterval` runs every 500ms to compute rolling metrics:

```typescript
this.updateInterval = setInterval(() => {
  this.updateHistory()
}, 500)
```

`updateHistory()` calculates the current RPS (requests completed since last tick divided by elapsed time) and the max latency in that interval, then pushes both onto rolling arrays capped at 120 entries. This gives the charts ~60 seconds of history at 500ms resolution.

## The React Layer

### TuiApp

A thin wrapper that converts EventEmitter events into React state:

```typescript
function TuiApp({ controller, initialState }) {
  const [state, setState] = useState(initialState)

  useEffect(() => {
    const handleUpdate = (newState) => setState({ ...newState })
    controller.on('update', handleUpdate)
    return () => controller.off('update', handleUpdate)
  }, [controller])

  return <Dashboard state={state} onPause={...} onResume={...} ... />
}
```

The spread `{ ...newState }` creates a new object reference so React detects the change and re-renders.

### Dashboard

The main layout component. It reads `state.compact` to choose between two layouts:

- **Full layout** (terminal >= 80 columns): Header, progress bar, stats panel, two side-by-side charts (RPS + latency), histogram, status codes + percentiles side by side, controls bar.
- **Compact layout** (terminal < 80 columns): Condensed single-column view with inline stats.

Keyboard handling uses Ink's `useInput` hook:

| Key | Action |
|-----|--------|
| `q` / `Ctrl+C` | Quit (stop the test) |
| `Space` | Toggle pause/resume |
| `+` / `=` | Increase concurrency by 10% |
| `-` / `_` | Decrease concurrency by 10% |
| `r` | Reset stats (while running) or repeat test (when completed) |

When the user presses `+`, the Dashboard calls `onAdjustConcurrency(delta)`, which calls `controller.adjustConcurrency()`, which updates `state.concurrency` and emits a `'concurrency'` event. The load loop picks up the new value on its next batch via `reporter.getConcurrency()`.

## UI Components

Each component receives data through props and renders terminal output using Ink primitives (`<Box>`, `<Text>`).

### ProgressBar

Renders a filled/empty bar using Unicode block characters:

```
████████████████████░░░░░░░░░░░░░░░░░░░░ 150/200 (75.0%)
```

The fill count is `Math.round((completed / total) * width)`.

### StatsPanel

Displays computed metrics inline: elapsed time, ETA, current RPS, average latency, and error count. ETA is calculated as `(total - completed) / rps`.

### Chart

Uses the `asciichart` library to render ASCII line charts. Takes the last 60 data points from the rolling history arrays. Two instances are rendered side by side — one for request rate, one for max latency.

### Histogram

Groups all durations into 10 equal-width buckets and renders horizontal bars. See `docs/histogram.md` for a detailed walkthrough of the bucketing algorithm.

### StatusCodes

Groups HTTP status codes by category (2xx, 3xx, 4xx, 5xx) and shows counts with color coding (green for 2xx, yellow for 3xx, red for 4xx/5xx).

### Percentiles

Sorts all durations and displays p50, p75, p90, and p99 latency values.

### Controls

Shows available keyboard shortcuts, adapting to the current state (different hints for running vs. paused vs. completed).

## Pause/Resume: How It Blocks the Load Loop

The most interesting coordination is pause. When the user presses space:

1. `controller.pause()` sets `status = 'paused'` and calls `this.abortController.abort()` — cancelling all in-flight fetch requests immediately.
2. A fresh `AbortController` is created for after resume.
3. The load loop calls `reporter.shouldContinue()`, which calls `controller.waitForResume()`.
4. `waitForResume()` returns a Promise that only resolves when `'resume'` or `'stop'` is emitted:

```typescript
async waitForResume(): Promise<boolean> {
  if (this.state.status !== 'paused') return true
  return new Promise((resolve) => {
    this.on('resume', () => resolve(true))
    this.on('stop', () => resolve(false))
  })
}
```

This suspends the load loop without polling — it simply awaits the Promise. When the user presses space again, `controller.resume()` emits `'resume'`, the Promise resolves with `true`, and the loop continues dispatching batches.

## Repeat Mode

When all requests finish, `controller.complete()` is called and the dashboard shows a "Complete" status. The load loop awaits `reporter.onComplete()`, which itself returns a Promise waiting for either `'stop'` or `'repeat'`.

If the user presses `r`, `controller.repeat()` resets all stats, sets status back to `'running'`, restarts the history timer, and emits `'repeat'`. The Promise resolves with `'repeat'`, and the outer `while (shouldRepeat)` loop in `load()` starts a fresh test run.

## Key Design Decisions

1. **Mutable state + events** rather than Redux-style reducers. The `TuiAction` type exists in `types.ts` but the controller mutates state directly and emits events. This is simpler for the event-driven nature of the system where mutations come from both the load loop (request results) and the UI (keyboard input).

2. **500ms tick interval** for chart history rather than per-request updates. Charting every single request would be too noisy and expensive. The interval smooths the data and keeps rendering cheap.

3. **AbortController for pause**. Rather than letting in-flight requests complete during pause, they're actively cancelled. This gives immediate feedback and prevents stale results from trickling in after the user paused.

4. **Reporter interface** decouples the load engine from the UI entirely. The `load()` function is testable with a mock reporter and doesn't import any React/Ink code directly.
