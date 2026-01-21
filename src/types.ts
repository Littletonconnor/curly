/**
 * Shared type definitions for curly CLI
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

export interface FetchOptions {
  help?: boolean
  history?: boolean
  method?: string
  headers?: string[]
  include?: boolean
  output?: string
  cookie?: string[]
  'cookie-jar'?: string
  head?: boolean
  data?: string[]
  'data-raw'?: string
  query?: string[]
  verbose?: boolean
  quiet?: boolean
  requests?: string
  concurrency?: string
  timeout?: string
  follow?: boolean
  'max-redirects'?: string
  fail?: boolean
  user?: string
  retry?: string
  'retry-delay'?: string
  profile?: string
  completions?: string
  save?: string
  use?: string
  aliases?: boolean
  'delete-alias'?: string
  form?: string[]
  proxy?: string
  'write-out'?: string
  tui?: boolean
  'tui-compact'?: boolean
  'dry-run'?: boolean
  json?: boolean
}

export interface ResponseData {
  response: unknown
  duration: number
  headers: Headers
  status: number
  size: string
}

export interface RequestResult {
  duration: number
  status: number
  size: string
  headers?: Headers
  error?: string
}

export interface NodeError extends Error {
  code?: string
}

export function isNodeError(error: unknown): error is NodeError {
  return error instanceof Error && 'code' in error
}

export function isError(error: unknown): error is Error {
  return error instanceof Error
}

export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message
  }
  return String(error)
}

export interface CurlyRequestInit extends RequestInit {
  method: string
  headers: Record<string, string>
  body?: string | FormData
  redirect: 'manual'
  signal?: AbortSignal
}

export type StatusColor = 'green' | 'yellow' | 'red' | 'white'
