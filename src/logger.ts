import { styleText } from 'node:util'

export function logger() {
  return {
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
