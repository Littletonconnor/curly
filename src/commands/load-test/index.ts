import { curl, buildResponse, type FetchOptions } from '../../core/http/client'
import { logger } from '../../lib/utils/logger'
import { parseIntOption } from '../../lib/utils/parse'
import { getErrorMessage } from '../../types'
import { ProgressIndicator } from './progress'
import { StatsCollector, type RequestResult } from './stats'
import { TuiController, shouldEnableTui, isTTY, isCompactMode } from './tui'

const DEFAULT_REQUESTS = 200
const DEFAULT_CONCURRENCY = 50

function createErrorResult(error: unknown): RequestResult {
  return {
    status: 500,
    duration: 0,
    size: '0',
    error: getErrorMessage(error),
  }
}

export interface LoadOptions extends FetchOptions {
  profileTui?: boolean
  profileName?: string
}

export async function load(url: string, options: LoadOptions): Promise<void> {
  const useTui = shouldEnableTui(options, options.profileTui) && isTTY()

  if (useTui) {
    await loadWithTui(url, options)
  } else {
    await loadWithProgress(url, options)
  }
}

/**
 * Standard load test with simple progress bar (existing behavior)
 */
async function loadWithProgress(url: string, options: FetchOptions): Promise<void> {
  const requests = parseIntOption(options.requests, DEFAULT_REQUESTS)
  const concurrency = parseIntOption(options.concurrency, DEFAULT_CONCURRENCY)

  logger().verbose('load-test', `Starting: ${requests} requests with concurrency ${concurrency}`)
  logger().verbose('load-test', `Target: ${url}`)

  const stats = new StatsCollector()
  const progress = new ProgressIndicator(requests)

  const startTime = performance.now()

  for (let i = 0; i < requests; i += concurrency) {
    const batchSize = Math.min(concurrency, requests - i)
    const batch = Array(batchSize)
      .fill(null)
      .map(() =>
        curl(url, options)
          .then(buildResponse)
          .catch((error: unknown) => createErrorResult(error)),
      )

    const batchResults = await Promise.all(batch)
    const successes = batchResults.filter(({ status }) => status >= 200 && status < 400).length
    const errors = batchResults.length - successes
    progress.update(successes, errors)
    stats.addResults(batchResults)
  }

  const endTime = performance.now()
  const totalDuration = (endTime - startTime) / 1000
  progress.finish()

  logger().verbose('load-test', `Completed in ${totalDuration.toFixed(2)}s`)

  stats.print(totalDuration)
}

/**
 * Load test with interactive TUI dashboard
 */
async function loadWithTui(url: string, options: LoadOptions): Promise<void> {
  const totalRequests = parseIntOption(options.requests, DEFAULT_REQUESTS)
  let concurrency = parseIntOption(options.concurrency, DEFAULT_CONCURRENCY)

  const controller = new TuiController({
    url,
    totalRequests,
    concurrency,
    compact: isCompactMode(options['tui-compact']),
    profileName: options.profileName,
  })

  // Listen for concurrency changes from keyboard
  controller.on('concurrency', (newConcurrency: number) => {
    concurrency = newConcurrency
  })

  // Start the TUI
  controller.start()

  const stats = new StatsCollector()
  let completed = 0

  try {
    while (controller.shouldContinue() && completed < totalRequests) {
      // Check if paused and wait for resume
      const shouldProceed = await controller.waitForResume()
      if (!shouldProceed) break

      const state = controller.getState()
      if (state.status === 'stopped') break

      const remaining = totalRequests - completed
      const batchSize = Math.min(concurrency, remaining)

      const batch = Array(batchSize)
        .fill(null)
        .map(() =>
          curl(url, options, controller.getAbortSignal())
            .then(buildResponse)
            .then((result) => {
              controller.recordResult({
                duration: result.duration,
                status: result.status,
              })
              return result
            })
            .catch((error: unknown) => {
              // Don't count aborted requests as errors
              if (error instanceof Error && error.name === 'AbortError') {
                return null
              }
              const result = createErrorResult(error)
              controller.recordResult({
                duration: result.duration,
                status: result.status,
                error: result.error,
              })
              return result
            }),
        )

      const batchResults = await Promise.all(batch)
      const validResults = batchResults.filter((r): r is RequestResult => r !== null)
      stats.addResults(validResults)
      completed += validResults.length
    }

    const state = controller.getState()
    if (state.status !== 'stopped') {
      controller.complete()
    }

    // Wait a moment for user to see the final state
    await new Promise((resolve) => setTimeout(resolve, 500))
  } finally {
    controller.unmount()
  }

  // Print final summary (same as non-TUI mode)
  const finalState = controller.getState()
  const totalDuration = (performance.now() - finalState.startTime) / 1000
  stats.print(totalDuration)
}
