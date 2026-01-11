import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { interpolate, interpolateArray } from '../../../src/lib/utils/interpolate'

describe('interpolate', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('replaces a single variable', () => {
    process.env.API_KEY = 'sk-12345'
    expect(interpolate('Bearer {{API_KEY}}')).toBe('Bearer sk-12345')
  })

  it('replaces multiple variables', () => {
    process.env.HOST = 'api.example.com'
    process.env.VERSION = 'v2'
    expect(interpolate('https://{{HOST}}/{{VERSION}}/users')).toBe(
      'https://api.example.com/v2/users',
    )
  })

  it('returns string unchanged when no placeholders', () => {
    expect(interpolate('https://api.example.com')).toBe('https://api.example.com')
  })

  it('throws error for undefined variable', () => {
    delete process.env.UNDEFINED_VAR
    expect(() => interpolate('{{UNDEFINED_VAR}}')).toThrow(
      'Environment variable "UNDEFINED_VAR" is not defined',
    )
  })

  it('handles empty string value', () => {
    process.env.EMPTY = ''
    expect(interpolate('prefix{{EMPTY}}suffix')).toBe('prefixsuffix')
  })

  it('handles variable with underscores and numbers', () => {
    process.env.MY_VAR_123 = 'value'
    expect(interpolate('{{MY_VAR_123}}')).toBe('value')
  })
})

describe('interpolateArray', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('returns undefined for undefined input', () => {
    expect(interpolateArray(undefined)).toBeUndefined()
  })

  it('interpolates all elements in array', () => {
    process.env.TOKEN = 'abc123'
    process.env.HOST = 'example.com'
    const result = interpolateArray(['Authorization: {{TOKEN}}', 'Host: {{HOST}}'])
    expect(result).toEqual(['Authorization: abc123', 'Host: example.com'])
  })

  it('returns empty array for empty input', () => {
    expect(interpolateArray([])).toEqual([])
  })
})
