import { parseArgs } from 'node:util'

export function cli() {
  return parseArgs({
    options: {
      help: { type: 'boolean', short: 'h', default: false },
      method: {
        type: 'string',
        short: 'X',
        default: 'GET',
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
      },
      'cookie-jar': {
        type: 'string',
        short: 'c',
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
      query: { type: 'string', short: 'q', multiple: true },
      'data-raw': { type: 'string' },
      debug: { type: 'boolean', default: false },
    },
    allowPositionals: true,
  })
}
