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
        short: 'I',
      },
      debug: { type: 'boolean', default: false },
    },
    allowPositionals: true,
  })
}
