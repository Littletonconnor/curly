/**
 * Types for the TUI load testing dashboard
 */

export interface TuiState {
  /** Current status of the load test */
  status: 'running' | 'paused' | 'completed' | 'stopped'
  /** Target URL being tested */
  url: string
  /** Total number of requests to make */
  totalRequests: number
  /** Number of concurrent requests */
  concurrency: number
  /** Number of completed requests */
  completed: number
  /** Number of successful requests (2xx-3xx) */
  successCount: number
  /** Number of failed requests (4xx-5xx or errors) */
  errorCount: number
  /** Time when the test started */
  startTime: number
  /** Rolling window of recent request durations (last 60s) */
  latencyHistory: number[]
  /** Rolling window of requests per second (last 60s) */
  rpsHistory: number[]
  /** Timestamp of last RPS calculation */
  lastRpsTime: number
  /** Requests completed since last RPS calculation */
  requestsSinceLastRps: number
  /** Status code counts */
  statusCodes: Record<number, number>
  /** All response durations for percentile calculation */
  durations: number[]
  /** Profile name if using one */
  profileName?: string
  /** Whether to use compact layout */
  compact: boolean
}

export interface TuiConfig {
  url: string
  totalRequests: number
  concurrency: number
  compact: boolean
  profileName?: string
}

export interface RequestResultEvent {
  duration: number
  status: number
  error?: string
}

export type TuiAction =
  | { type: 'REQUEST_COMPLETE'; result: RequestResultEvent }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'STOP' }
  | { type: 'COMPLETE' }
  | { type: 'ADJUST_CONCURRENCY'; delta: number }
  | { type: 'RESET_STATS' }
  | { type: 'TICK' }
