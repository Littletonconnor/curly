import { styleText } from 'node:util'

export type VerboseLabel =
  | 'request'
  | 'response'
  | 'redirect'
  | 'timeout'
  | 'cookies'
  | 'output'
  | 'load-test'
  | 'auth'
  | 'retry'
  | 'form'
  | 'proxy'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'
type StyleColor = Parameters<typeof styleText>[0]

const LOG_LEVEL_COLORS: Record<LogLevel, StyleColor> = {
  debug: 'greenBright',
  info: 'greenBright',
  warn: 'yellowBright',
  error: 'redBright',
}

const VERBOSE_LABEL_COLORS: Record<VerboseLabel, StyleColor> = {
  request: 'cyanBright',
  response: 'greenBright',
  redirect: 'yellowBright',
  timeout: 'magentaBright',
  cookies: 'blueBright',
  output: 'whiteBright',
  'load-test': 'magentaBright',
  auth: 'yellowBright',
  retry: 'yellowBright',
  form: 'blueBright',
  proxy: 'magentaBright',
}

let verboseEnabled = false

/**
 * Enables or disables verbose logging mode.
 * When enabled, detailed request/response information is printed to the console.
 */
export function setVerbose(enabled: boolean): void {
  verboseEnabled = enabled
}

/**
 * Returns whether verbose logging is currently enabled.
 */
export function isVerbose(): boolean {
  return verboseEnabled
}

function formatLogMessage(level: LogLevel, args: string[]): string {
  const now = new Date().toISOString()
  const coloredLevel = styleText(LOG_LEVEL_COLORS[level], level)
  const time = styleText('gray', now)
  const message = styleText('white', `[${coloredLevel}] ${args.join(' ')}`)
  return `${time} ${message}`
}

/**
 * Returns a logger instance with methods for different log levels.
 *
 * - `verbose(label, message)` - Logs detailed info when verbose mode is enabled
 * - `debug(...args)` - Logs debug info when DEBUG=true environment variable is set
 * - `info(...args)` - Logs informational messages
 * - `warn(...args)` - Logs warning messages
 * - `error(...args)` - Logs error messages and exits the process with code 1
 */
export function logger() {
  return {
    verbose(label: VerboseLabel, message: string): void {
      if (!verboseEnabled) return

      const color = VERBOSE_LABEL_COLORS[label]
      const formattedLabel = styleText(color, `[${label}]`)
      const formattedMessage = styleText('gray', message)
      console.log(`${formattedLabel} ${formattedMessage}`)
    },

    debug(...args: string[]): void {
      if (process.env.DEBUG !== 'true') return
      console.log(formatLogMessage('debug', args))
    },

    info(...args: string[]): void {
      console.log(formatLogMessage('info', args))
    },

    warn(...args: string[]): void {
      console.log(formatLogMessage('warn', args))
    },

    error(...args: string[]): never {
      console.log(formatLogMessage('error', args))
      process.exit(1)
    },
  }
}
