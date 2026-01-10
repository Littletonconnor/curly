import { parseArgs } from 'node:util'

export function cli() {
  return parseArgs({
    options: {
      help: { type: 'boolean', short: 'h', default: false },
      history: { type: 'boolean', default: false },
      method: {
        type: 'string',
        short: 'X',
      },
      headers: {
        type: 'string',
        short: 'H',
        multiple: true,
      },
      include: {
        type: 'boolean',
        short: 'i',
      },
      output: {
        type: 'string',
        short: 'o',
      },
      cookie: {
        type: 'string',
        short: 'b',
        multiple: true,
      },
      'cookie-jar': {
        type: 'string',
      },
      head: {
        type: 'boolean',
        short: 'I',
      },
      data: { type: 'string', short: 'd', multiple: true },
      'data-raw': { type: 'string' },
      query: { type: 'string', short: 'q', multiple: true },
      verbose: { type: 'boolean', short: 'v', default: false },
      quiet: { type: 'boolean', default: false },
      requests: { type: 'string', short: 'n' },
      concurrency: { type: 'string', short: 'c' },
      timeout: { type: 'string', short: 't' },
      follow: { type: 'boolean', short: 'L', default: false },
      'max-redirects': { type: 'string' },
      fail: { type: 'boolean', short: 'f', default: false },
      user: { type: 'string', short: 'u' },
    },
    allowPositionals: true,
  })
}
