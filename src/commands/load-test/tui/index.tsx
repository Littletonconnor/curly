import React, { useState, useEffect, useCallback } from 'react'
import { render } from 'ink'
import { Dashboard } from './Dashboard'
import type { TuiState, TuiConfig, RequestResultEvent } from './types'
import { EventEmitter } from 'events'

export type { TuiConfig, RequestResultEvent }

/**
 * Event emitter for communication between the load test runner and TUI
 */
export class TuiController extends EventEmitter {
  private state: TuiState
  private instance: ReturnType<typeof render> | null = null
  private updateInterval: NodeJS.Timeout | null = null
  private abortController: AbortController | null = null

  constructor(config: TuiConfig) {
    super()
    this.state = {
      status: 'running',
      url: config.url,
      totalRequests: config.totalRequests,
      concurrency: config.concurrency,
      completed: 0,
      successCount: 0,
      errorCount: 0,
      startTime: performance.now(),
      latencyHistory: [],
      rpsHistory: [],
      lastRpsTime: performance.now(),
      requestsSinceLastRps: 0,
      statusCodes: {},
      durations: [],
      profileName: config.profileName,
      compact: config.compact,
    }
    this.abortController = new AbortController()
  }

  /**
   * Start the TUI rendering
   */
  start(): void {
    this.instance = render(<TuiApp controller={this} initialState={this.state} />)

    this.updateInterval = setInterval(() => {
      this.updateHistory()
    }, 500)
  }

  /**
   * Record a completed request
   */
  recordResult(result: RequestResultEvent): void {
    if (this.state.status === 'paused' || this.state.status === 'stopped') return

    this.state.completed++
    this.state.requestsSinceLastRps++

    if (result.error || result.status >= 400) {
      this.state.errorCount++
    } else {
      this.state.successCount++
    }

    if (!result.error) {
      this.state.durations.push(result.duration)
    }

    this.state.statusCodes[result.status] = (this.state.statusCodes[result.status] || 0) + 1

    this.emit('update', this.state)
  }

  /**
   * Update rolling history for charts
   */
  private updateHistory(): void {
    const now = performance.now()
    const elapsed = (now - this.state.lastRpsTime) / 1000

    if (elapsed >= 0.5) {
      const rps = this.state.requestsSinceLastRps / elapsed
      this.state.rpsHistory.push(rps)
      if (this.state.rpsHistory.length > 120) {
        this.state.rpsHistory.shift()
      }

      // Calculate max latency in this interval for the chart (shows long tail spikes)
      const recentDurations = this.state.durations.slice(-Math.ceil(rps * elapsed))
      const maxLatency = recentDurations.length > 0 ? Math.max(...recentDurations) : 0

      this.state.latencyHistory.push(maxLatency)
      if (this.state.latencyHistory.length > 120) {
        this.state.latencyHistory.shift()
      }

      this.state.lastRpsTime = now
      this.state.requestsSinceLastRps = 0

      this.emit('update', this.state)
    }
  }

  /**
   * Pause the load test - cancels in-flight requests
   */
  pause(): void {
    if (this.state.status !== 'running') return
    this.state.status = 'paused'
    this.abortController?.abort()
    this.abortController = new AbortController()
    this.emit('pause')
    this.emit('update', this.state)
  }

  /**
   * Resume the load test
   */
  resume(): void {
    if (this.state.status !== 'paused') return
    this.state.status = 'running'
    this.emit('resume')
    this.emit('update', this.state)
  }

  /**
   * Stop the load test completely
   */
  stop(): void {
    this.state.status = 'stopped'
    this.abortController?.abort()
    this.cleanup()
    this.emit('stop')
    this.emit('update', this.state)
  }

  /**
   * Mark the load test as complete
   */
  complete(): void {
    this.state.status = 'completed'
    this.cleanup()
    this.emit('update', this.state)
  }

  /**
   * Adjust concurrency
   */
  adjustConcurrency(delta: number): void {
    const newConcurrency = Math.max(1, this.state.concurrency + delta)
    this.state.concurrency = newConcurrency
    this.emit('concurrency', newConcurrency)
    this.emit('update', this.state)
  }

  /**
   * Reset statistics (keep running)
   */
  resetStats(): void {
    this.state.durations = []
    this.state.statusCodes = {}
    this.state.latencyHistory = []
    this.state.rpsHistory = []
    this.state.successCount = 0
    this.state.errorCount = 0
    this.state.completed = 0
    this.state.startTime = performance.now()
    this.state.lastRpsTime = performance.now()
    this.state.requestsSinceLastRps = 0
    this.emit('update', this.state)
  }

  /**
   * Repeat the load test (when completed)
   */
  repeat(): void {
    if (this.state.status !== 'completed') return

    this.state.status = 'running'
    this.state.durations = []
    this.state.statusCodes = {}
    this.state.latencyHistory = []
    this.state.rpsHistory = []
    this.state.successCount = 0
    this.state.errorCount = 0
    this.state.completed = 0
    this.state.startTime = performance.now()
    this.state.lastRpsTime = performance.now()
    this.state.requestsSinceLastRps = 0
    this.abortController = new AbortController()

    if (!this.updateInterval) {
      this.updateInterval = setInterval(() => {
        this.updateHistory()
      }, 500)
    }

    this.emit('repeat')
    this.emit('update', this.state)
  }

  /**
   * Get current state
   */
  getState(): TuiState {
    return this.state
  }

  /**
   * Get abort signal for request cancellation
   */
  getAbortSignal(): AbortSignal {
    return this.abortController!.signal
  }

  /**
   * Check if we should continue dispatching requests
   */
  shouldContinue(): boolean {
    return this.state.status === 'running' && this.state.completed < this.state.totalRequests
  }

  /**
   * Wait for resume if paused
   */
  async waitForResume(): Promise<boolean> {
    if (this.state.status === 'stopped') return false
    if (this.state.status !== 'paused') return true

    return new Promise((resolve) => {
      const onResume = () => {
        this.off('resume', onResume)
        this.off('stop', onStop)
        resolve(true)
      }
      const onStop = () => {
        this.off('resume', onResume)
        this.off('stop', onStop)
        resolve(false)
      }
      this.on('resume', onResume)
      this.on('stop', onStop)
    })
  }

  /**
   * Clean up resources
   */
  private cleanup(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }

  /**
   * Unmount the TUI and clean up
   */
  unmount(): void {
    this.cleanup()
    if (this.instance) {
      this.instance.unmount()
      this.instance = null
    }
  }
}

/**
 * React component that wraps the Dashboard and manages state updates
 */
function TuiApp({ controller, initialState }: { controller: TuiController; initialState: TuiState }) {
  const [state, setState] = useState<TuiState>(initialState)

  useEffect(() => {
    const handleUpdate = (newState: TuiState) => {
      setState({ ...newState })
    }
    controller.on('update', handleUpdate)
    return () => {
      controller.off('update', handleUpdate)
    }
  }, [controller])

  const handlePause = useCallback(() => controller.pause(), [controller])
  const handleResume = useCallback(() => controller.resume(), [controller])
  const handleQuit = useCallback(() => controller.stop(), [controller])
  const handleAdjustConcurrency = useCallback((delta: number) => controller.adjustConcurrency(delta), [controller])
  const handleResetStats = useCallback(() => controller.resetStats(), [controller])
  const handleRepeat = useCallback(() => controller.repeat(), [controller])

  return (
    <Dashboard
      state={state}
      onPause={handlePause}
      onResume={handleResume}
      onQuit={handleQuit}
      onAdjustConcurrency={handleAdjustConcurrency}
      onResetStats={handleResetStats}
      onRepeat={handleRepeat}
    />
  )
}

/**
 * Check if TUI should be enabled based on options and environment
 */
export function shouldEnableTui(options: { tui?: boolean }, profileTui?: boolean): boolean {
  if (options.tui !== undefined) {
    return options.tui
  }

  if (process.env.CURLY_TUI === '1' || process.env.CURLY_TUI === 'true') {
    return true
  }

  if (profileTui) {
    return true
  }

  return false
}

/**
 * Check if we're in a TTY environment suitable for TUI
 */
export function isTTY(): boolean {
  return process.stdout.isTTY ?? false
}

/**
 * Check if terminal is wide enough for full layout
 */
export function isCompactMode(forceCompact?: boolean): boolean {
  if (forceCompact) return true
  const columns = process.stdout.columns ?? 80
  return columns < 80
}
