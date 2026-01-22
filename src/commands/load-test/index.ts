import { curl, buildResponse, type FetchOptions } from '../../core/http/client'
import { logger } from '../../lib/utils/logger'
import { parseIntOption } from '../../lib/utils/parse'
import { getErrorMessage } from '../../types'
import { ProgressIndicator } from './progress'
import { StatsCollector, type RequestResult } from './stats'
import { TuiController, shouldEnableTui, isTTY, isCompactMode } from './tui'
import { exportResults, isValidExportFormat } from './export'

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

/**
 * Reporter interface for abstracting progress reporting
 */
interface LoadReporter {
  /** Called before each batch to check if we should continue */
  shouldContinue(): boolean | Promise<boolean>
  /** Get current concurrency (may change dynamically in TUI) */
  getConcurrency(): number
  /** Get abort signal for request cancellation (optional) */
  getAbortSignal?(): AbortSignal
  /** Called for each completed request */
  onResult(result: RequestResult): void
  /** Called after each batch completes */
  onBatchComplete(results: RequestResult[]): void
  /** Called when all requests complete. Returns 'repeat' to run again, 'quit' to exit */
  onComplete(stats: StatsCollector, duration: number): Promise<'quit' | 'repeat'>
  /** Cleanup resources */
  cleanup(): void
}

/**
 * Simple progress bar reporter
 */
function createProgressReporter(
  totalRequests: number,
  concurrency: number,
  options: LoadOptions,
): LoadReporter {
  const progress = new ProgressIndicator(totalRequests)

  return {
    shouldContinue: () => true,
    getConcurrency: () => concurrency,
    onResult: () => {},
    onBatchComplete: (results) => {
      const successes = results.filter(({ status }) => status >= 200 && status < 400).length
      const errors = results.length - successes
      progress.update(successes, errors)
    },
    onComplete: async (stats, duration) => {
      progress.finish()

      // Handle export if specified
      if (options.export && isValidExportFormat(options.export)) {
        await exportResults(stats, duration, options.export, options.output)
      } else {
        stats.print(duration)
      }
      return 'quit'
    },
    cleanup: () => progress.finish(),
  }
}

/**
 * TUI dashboard reporter
 */
function createTuiReporter(
  url: string,
  totalRequests: number,
  initialConcurrency: number,
  options: LoadOptions,
): LoadReporter {
  let concurrency = initialConcurrency

  const controller = new TuiController({
    url,
    totalRequests,
    concurrency,
    compact: isCompactMode(options['tui-compact']),
    profileName: options.profileName,
  })

  controller.on('concurrency', (newConcurrency: number) => {
    concurrency = newConcurrency
  })

  controller.start()

  return {
    shouldContinue: async () => {
      if (!controller.shouldContinue()) return false
      const shouldProceed = await controller.waitForResume()
      if (!shouldProceed) return false
      return controller.getState().status !== 'stopped'
    },
    getConcurrency: () => concurrency,
    getAbortSignal: () => controller.getAbortSignal(),
    onResult: (result) => {
      controller.recordResult({
        duration: result.duration,
        status: result.status,
        error: result.error,
      })
    },
    onBatchComplete: () => {},
    onComplete: async () => {
      const state = controller.getState()
      if (state.status === 'stopped') {
        return 'quit'
      }

      controller.complete()

      // Wait for user to press 'q' (quit) or 'r' (repeat)
      return new Promise<'quit' | 'repeat'>((resolve) => {
        const onStop = () => {
          controller.off('stop', onStop)
          controller.off('repeat', onRepeat)
          resolve('quit')
        }
        const onRepeat = () => {
          controller.off('stop', onStop)
          controller.off('repeat', onRepeat)
          resolve('repeat')
        }
        controller.on('stop', onStop)
        controller.on('repeat', onRepeat)
      })
    },
    cleanup: () => controller.unmount(),
  }
}

export async function load(url: string, options: LoadOptions): Promise<void> {
  const totalRequests = parseIntOption(options.requests, DEFAULT_REQUESTS)
  const concurrency = parseIntOption(options.concurrency, DEFAULT_CONCURRENCY)
  const useTui = shouldEnableTui(options, options.profileTui) && isTTY()

  logger().verbose(
    'load-test',
    `Starting: ${totalRequests} requests with concurrency ${concurrency}`,
  )
  logger().verbose('load-test', `Target: ${url}`)

  const reporter = useTui
    ? createTuiReporter(url, totalRequests, concurrency, options)
    : createProgressReporter(totalRequests, concurrency, options)

  let shouldRepeat = true

  try {
    while (shouldRepeat) {
      const stats = new StatsCollector()
      const startTime = performance.now()
      let completed = 0

      while (completed < totalRequests && (await reporter.shouldContinue())) {
        const currentConcurrency = reporter.getConcurrency()
        const batchSize = Math.min(currentConcurrency, totalRequests - completed)
        const abortSignal = reporter.getAbortSignal?.()

        const batch = Array(batchSize)
          .fill(null)
          .map(() =>
            curl(url, options, abortSignal)
              .then(buildResponse)
              .then((result) => {
                reporter.onResult(result)
                return result
              })
              .catch((error: unknown) => {
                // Don't count aborted requests (from pause/quit)
                if (error instanceof Error && error.name === 'AbortError') {
                  return null
                }
                const result = createErrorResult(error)
                reporter.onResult(result)
                return result
              }),
          )

        const batchResults = await Promise.all(batch)
        const validResults = batchResults.filter((r): r is RequestResult => r !== null)

        stats.addResults(validResults)
        reporter.onBatchComplete(validResults)
        completed += validResults.length
      }

      const totalDuration = (performance.now() - startTime) / 1000
      logger().verbose('load-test', `Completed in ${totalDuration.toFixed(2)}s`)

      const action = await reporter.onComplete(stats, totalDuration)
      shouldRepeat = action === 'repeat'
    }
  } finally {
    reporter.cleanup()
  }
}
