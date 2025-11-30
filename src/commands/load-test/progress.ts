/**
 * Progress indicator for load testing
 *
 * Displays a real-time progress bar and stats during load test execution.
 * Only renders in interactive TTY mode to avoid polluting piped output.
 */

export interface ProgressState {
  completed: number
  total: number
  successCount: number
  errorCount: number
}

export class ProgressIndicator {
  private state: ProgressState
  private isInteractive: boolean

  private static FILLED_BUCKET = '█'
  private static EMPTY_BUCKET = '░'

  constructor(total: number) {
    this.state = {
      completed: 0,
      total,
      successCount: 0,
      errorCount: 0,
    }
    this.isInteractive = process.stderr.isTTY ?? false
  }

  /**
   * Update progress after a batch of requests completes
   */
  update(batchSuccesses: number, batchErrors: number): void {
    this.state.completed += batchSuccesses + batchErrors
    this.state.successCount += batchSuccesses
    this.state.errorCount += batchErrors

    if (this.isInteractive) {
      this.render()
    }
  }

  /**
   * Clear the progress line when done
   */
  finish(): void {
    if (this.isInteractive) {
      process.stderr.clearLine(0)
      process.stderr.cursorTo(0)
    }
  }

  /**
   * Render the progress indicator to stderr
   *   [████████░░░░░░░░] 50/100
   */
  private render(): void {
    let progressStr = ''
    const maxBucketLength = 20

    const { total, completed } = this.state

    const progress = completed / total
    const filledCount = Math.round(progress * maxBucketLength)

    for (let i = 0; i < maxBucketLength; i++) {
      if (i < filledCount) {
        progressStr += ProgressIndicator.FILLED_BUCKET
      } else {
        progressStr += ProgressIndicator.EMPTY_BUCKET
      }
    }

    process.stderr.clearLine(0)
    process.stderr.cursorTo(0)

    const output = `[${progressStr}] ${completed}/${total}`
    process.stderr.write(output)
  }
}
