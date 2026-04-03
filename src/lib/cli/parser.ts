import { parseArgs } from 'node:util'
import { suggestFlag } from '../utils/errors'

const CLI_OPTIONS = {
  help: { type: 'boolean' as const, short: 'h', default: false },
  version: { type: 'boolean' as const, short: 'V', default: false },
  history: { type: 'boolean' as const, default: false },
  'history-clear': { type: 'boolean' as const, default: false },
  'history-search': { type: 'string' as const },
  method: {
    type: 'string' as const,
    short: 'X',
  },
  headers: {
    type: 'string' as const,
    short: 'H',
    multiple: true,
  },
  include: {
    type: 'boolean' as const,
    short: 'i',
  },
  output: {
    type: 'string' as const,
    short: 'o',
  },
  cookie: {
    type: 'string' as const,
    short: 'b',
    multiple: true,
  },
  'cookie-jar': {
    type: 'string' as const,
  },
  head: {
    type: 'boolean' as const,
    short: 'I',
  },
  data: { type: 'string' as const, short: 'd', multiple: true },
  'data-raw': { type: 'string' as const },
  query: { type: 'string' as const, short: 'q', multiple: true },
  verbose: { type: 'boolean' as const, short: 'v', default: false },
  quiet: { type: 'boolean' as const, default: false },
  requests: { type: 'string' as const, short: 'n' },
  concurrency: { type: 'string' as const, short: 'c' },
  timeout: { type: 'string' as const, short: 't' },
  follow: { type: 'boolean' as const, short: 'L', default: false },
  'max-redirects': { type: 'string' as const },
  fail: { type: 'boolean' as const, short: 'f', default: false },
  user: { type: 'string' as const, short: 'u' },
  retry: { type: 'string' as const, default: '0' },
  'retry-delay': { type: 'string' as const, default: '1000' },
  profile: { type: 'string' as const, short: 'p' },
  completions: { type: 'string' as const },
  save: { type: 'string' as const },
  use: { type: 'string' as const },
  aliases: { type: 'boolean' as const, default: false },
  'delete-alias': { type: 'string' as const },
  form: { type: 'string' as const, short: 'F', multiple: true },
  proxy: { type: 'string' as const, short: 'x' },
  'write-out': { type: 'string' as const, short: 'w' },
  tui: { type: 'boolean' as const, short: 'T' },
  'tui-compact': { type: 'boolean' as const, default: false },
  'dry-run': { type: 'boolean' as const, default: false },
  json: { type: 'boolean' as const, short: 'j', default: false },
  export: { type: 'string' as const, short: 'e' },
  init: { type: 'boolean' as const, default: false },
}

const KNOWN_FLAGS = Object.keys(CLI_OPTIONS)

export function cli() {
  try {
    return parseArgs({
      options: CLI_OPTIONS,
      allowPositionals: true,
    })
  } catch (error: unknown) {
    if (error instanceof Error) {
      const unknownMatch = error.message.match(/Unknown option '(--.+?)'/)
      if (unknownMatch) {
        const unknownFlag = unknownMatch[1]
        const suggestion = suggestFlag(unknownFlag, KNOWN_FLAGS)
        if (suggestion) {
          console.error(`Unknown option '${unknownFlag}'. Did you mean ${suggestion}?`)
          process.exit(1)
        }
      }
    }
    throw error
  }
}
