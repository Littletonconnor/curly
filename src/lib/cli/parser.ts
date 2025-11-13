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
      summary: {
        type: 'boolean',
        short: 'S',
      },
      data: { type: 'string', short: 'd', multiple: true },
      'data-raw': { type: 'string' },
      query: { type: 'string', short: 'q', multiple: true },
      table: { type: 'boolean', short: 'T' },
      debug: { type: 'boolean', default: false },
      requests: { type: 'string', short: 'n' },
      concurrency: { type: 'string', short: 'c' },
    },
    allowPositionals: true,
  })
}
