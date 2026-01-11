/**
 * Shared type definitions for curly CLI
 */

// HTTP Methods supported by curly
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

// CLI option types - explicitly defined for type safety
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
}

// Response data structure
export interface ResponseData {
  response: unknown
  duration: number
  headers: Headers
  status: number
  size: string
}

// Load test request result
export interface RequestResult {
  duration: number
  status: number
  size: string
  headers?: Headers
  error?: string
}

// Node.js error with code property (for ENOENT, ECONNRESET, etc.)
export interface NodeError extends Error {
  code?: string
}

// Type guard for NodeError
export function isNodeError(error: unknown): error is NodeError {
  return error instanceof Error && 'code' in error
}

// Type guard for Error with message
export function isError(error: unknown): error is Error {
  return error instanceof Error
}

// Get error message safely from unknown error
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message
  }
  return String(error)
}

// Fetch options for the native fetch API
export interface CurlyRequestInit extends RequestInit {
  method: string
  headers: Record<string, string>
  body?: string | FormData
  redirect: 'manual'
  signal?: AbortSignal
}

// Status color type
export type StatusColor = 'green' | 'yellow' | 'red' | 'white'
