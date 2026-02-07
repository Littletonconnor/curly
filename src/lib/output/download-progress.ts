/**
 * Progress indicator
 *
 * Displays a real-time progress bar and stats during load test execution.
 * Only renders in interactive TTY mode to avoid polluting piped output.
 */

import { formatBytes } from '../utils'

export interface ProgressState {
  totalBytes: number | null
  chunkSize: number
  bytesWritten: number
  startTime: number
}

export class ProgressIndicator {
  private state: ProgressState
  private isInteractive: boolean

  private static FILLED_BUCKET = '█'
  private static EMPTY_BUCKET = '░'

  constructor(totalBytes: number | null) {
    this.state = {
      totalBytes,
      chunkSize: 0,
      bytesWritten: 0,
      startTime: Date.now(),
    }
    this.isInteractive = process.stderr.isTTY ?? false
  }

  getBytesWritten() {
    return this.state.bytesWritten
  }

  update(chunkSize: number): void {
    this.state.chunkSize = chunkSize
    this.state.bytesWritten += chunkSize

    if (this.isInteractive) {
      this.render()
    }
  }

  finish(): void {
    if (this.isInteractive) {
      process.stderr.clearLine(0)
      process.stderr.cursorTo(0)
    }
  }

  private render(): void {
    let progressStr = ''
    const maxBucketLength = 20

    const { totalBytes, bytesWritten, startTime } = this.state
    const speed = `${formatBytes(bytesWritten / ((Date.now() - startTime) / 1000))}/s`

    if (totalBytes) {
      const progress = bytesWritten / totalBytes
      const percentageComplete = (progress * 100).toFixed(1) + '%'
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

      const output = `[${progressStr}] ${percentageComplete}  ${formatBytes(bytesWritten)} / ${formatBytes(totalBytes)}  ${speed}`
      process.stderr.write(output)
    } else {
      process.stderr.clearLine(0)
      process.stderr.cursorTo(0)

      const output = `Downloaded: ${formatBytes(bytesWritten)}  ${speed}`
      process.stderr.write(output)
    }
  }
}
