/**
 * Global test setup for Curly
 *
 * This file runs before all tests and sets up:
 * - Common mocks (logger, fetch, fs)
 * - Environment variable helpers
 * - Shared test utilities
 */

import { vi, beforeEach, afterEach } from 'vitest'

// Store original environment
const originalEnv = { ...process.env }

/**
 * Reset environment variables before each test
 */
beforeEach(() => {
  process.env = { ...originalEnv }
})

afterEach(() => {
  process.env = originalEnv
})

/**
 * Mock the logger module to prevent console output during tests
 * and avoid process.exit calls
 */
vi.mock('../src/lib/utils/logger', () => ({
  logger: () => ({
    verbose: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn((msg: string) => {
      // Don't call process.exit in tests, just throw
      throw new Error(msg)
    }),
  }),
  setVerbose: vi.fn(),
}))

/**
 * Helper to set environment variables for a test
 */
export function setEnv(vars: Record<string, string>): void {
  Object.assign(process.env, vars)
}

/**
 * Helper to create a mock Response object
 */
export function createMockResponse(options: {
  status?: number
  statusText?: string
  headers?: Record<string, string>
  body?: string | object
  ok?: boolean
}): Response {
  const {
    status = 200,
    statusText = 'OK',
    headers = {},
    body = '',
    ok = status >= 200 && status < 300,
  } = options

  const bodyText = typeof body === 'object' ? JSON.stringify(body) : body

  return {
    ok,
    status,
    statusText,
    headers: new Headers(headers),
    text: vi.fn().mockResolvedValue(bodyText),
    json: vi.fn().mockResolvedValue(typeof body === 'object' ? body : JSON.parse(bodyText)),
    arrayBuffer: vi.fn().mockResolvedValue(new TextEncoder().encode(bodyText).buffer),
    clone: vi.fn().mockReturnThis(),
    body: null,
    bodyUsed: false,
    redirected: false,
    type: 'basic',
    url: '',
  } as unknown as Response
}

/**
 * Helper to create mock fetch that returns specified responses
 */
export function mockFetch(responses: Response | Response[]): void {
  const responseArray = Array.isArray(responses) ? responses : [responses]
  let callIndex = 0

  global.fetch = vi.fn().mockImplementation(() => {
    const response = responseArray[Math.min(callIndex, responseArray.length - 1)]
    callIndex++
    return Promise.resolve(response)
  })
}

/**
 * Helper to create a mock file system for testing file operations
 */
export function createMockFs(files: Record<string, string>) {
  return {
    readFileSync: vi.fn((path: string) => {
      if (path in files) {
        return files[path]
      }
      const error = new Error(`ENOENT: no such file or directory, open '${path}'`)
      ;(error as NodeJS.ErrnoException).code = 'ENOENT'
      throw error
    }),
    writeFileSync: vi.fn(),
    existsSync: vi.fn((path: string) => path in files),
  }
}
