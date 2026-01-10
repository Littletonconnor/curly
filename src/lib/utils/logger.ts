import { styleText } from 'node:util'

export type VerboseLabel =
  | 'request'
  | 'response'
  | 'redirect'
  | 'timeout'
  | 'cookies'
  | 'output'
  | 'load-test'

let verboseEnabled = false

export function setVerbose(enabled: boolean) {
  verboseEnabled = enabled
}

export function isVerbose() {
  return verboseEnabled
}

export function logger() {
  return {
    /**
     * User-friendly verbose logging with labeled output.
     * Only shows when --verbose flag is used.
     */
    verbose(label: VerboseLabel, message: string) {
      if (!verboseEnabled) return

      const labelColors: Record<VerboseLabel, string> = {
        request: 'cyanBright',
        response: 'greenBright',
        redirect: 'yellowBright',
        timeout: 'magentaBright',
        cookies: 'blueBright',
        output: 'whiteBright',
        'load-test': 'magentaBright',
      }

      const color = labelColors[label] as Parameters<typeof styleText>[0]
      const formattedLabel = styleText(color, `[${label}]`)
      const formattedMessage = styleText('gray', message)
      console.log(`${formattedLabel} ${formattedMessage}`)
    },

    /**
     * Internal debug logging for development.
     * Only shows when DEBUG=true environment variable is set.
     */
    debug(...args: string[]) {
      if (process.env.DEBUG !== 'true') return

      const now = new Date().toISOString()
      const level = styleText('greenBright', 'debug')
      const time = styleText('gray', `${now}`)
      const message = styleText('white', `[${level}] ${args.join(' ')}`)
      console.log(`${time} ${message}`)
    },

    info(...args: string[]) {
      const now = new Date().toISOString()
      const level = styleText('greenBright', 'info')
      const time = styleText('gray', `${now}`)
      const message = styleText('white', `[${level}] ${args.join(' ')}`)
      console.log(`${time} ${message}`)
    },

    warn(...args: string[]) {
      const now = new Date().toISOString()
      const level = styleText('yellowBright', 'warn')
      const time = styleText('gray', `${now}`)
      const message = styleText('white', `[${level}] ${args.join(' ')}`)
      console.log(`${time} ${message}`)
    },

    error(...args: string[]) {
      const now = new Date().toISOString()
      const level = styleText('redBright', 'error')
      const time = styleText('gray', `${now}`)
      const message = styleText('white', `[${level}] ${args.join(' ')}`)
      console.log(`${time} ${message}`)
      process.exit(1)
    },
  }
}
