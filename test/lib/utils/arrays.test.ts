import { describe, expect, it, beforeEach } from 'vitest'
import { mergeInterpolatedArrays, mergeArrays } from '../../../src/lib/utils/arrays'

describe('array utilities', () => {
  describe('mergeArrays', () => {
    it('returns empty array when no sources provided', () => {
      expect(mergeArrays()).toEqual([])
    })

    it('returns empty array when all sources are undefined', () => {
      expect(mergeArrays(undefined, undefined)).toEqual([])
    })

    it('merges a single array', () => {
      expect(mergeArrays(['a', 'b'])).toEqual(['a', 'b'])
    })

    it('merges multiple arrays', () => {
      expect(mergeArrays(['a', 'b'], ['c', 'd'])).toEqual(['a', 'b', 'c', 'd'])
    })

    it('skips undefined sources', () => {
      expect(mergeArrays(['a'], undefined, ['b'])).toEqual(['a', 'b'])
    })

    it('preserves order from multiple sources', () => {
      expect(mergeArrays(['1', '2'], ['3'], ['4', '5'])).toEqual(['1', '2', '3', '4', '5'])
    })

    it('handles empty arrays', () => {
      expect(mergeArrays([], ['a'], [])).toEqual(['a'])
    })

    it('works with different types', () => {
      expect(mergeArrays([1, 2], [3, 4])).toEqual([1, 2, 3, 4])
      expect(mergeArrays([{ a: 1 }], [{ b: 2 }])).toEqual([{ a: 1 }, { b: 2 }])
    })

    it('does not deduplicate values', () => {
      expect(mergeArrays(['a', 'b'], ['b', 'c'])).toEqual(['a', 'b', 'b', 'c'])
    })
  })

  describe('mergeInterpolatedArrays', () => {
    beforeEach(() => {
      // Set up test environment variables
      process.env.TEST_VAR = 'test-value'
      process.env.API_KEY = 'secret123'
      process.env.BASE_URL = 'https://api.example.com'
    })

    it('returns empty array when no sources provided', () => {
      expect(mergeInterpolatedArrays()).toEqual([])
    })

    it('returns empty array when all sources are undefined', () => {
      expect(mergeInterpolatedArrays(undefined, undefined)).toEqual([])
    })

    it('merges arrays without interpolation when no placeholders', () => {
      expect(mergeInterpolatedArrays(['a', 'b'], ['c'])).toEqual(['a', 'b', 'c'])
    })

    it('interpolates {{VAR}} placeholders with environment variables', () => {
      const result = mergeInterpolatedArrays(['value={{TEST_VAR}}'])
      expect(result).toEqual(['value=test-value'])
    })

    it('interpolates multiple placeholders in a single string', () => {
      const result = mergeInterpolatedArrays(['{{BASE_URL}}/api?key={{API_KEY}}'])
      expect(result).toEqual(['https://api.example.com/api?key=secret123'])
    })

    it('interpolates across multiple arrays', () => {
      const result = mergeInterpolatedArrays(
        ['Authorization: Bearer {{API_KEY}}'],
        ['X-Base-URL: {{BASE_URL}}']
      )
      expect(result).toEqual([
        'Authorization: Bearer secret123',
        'X-Base-URL: https://api.example.com',
      ])
    })

    it('skips undefined sources while interpolating', () => {
      const result = mergeInterpolatedArrays(['{{TEST_VAR}}'], undefined, ['plain'])
      expect(result).toEqual(['test-value', 'plain'])
    })

    it('throws an error for undefined environment variables', () => {
      expect(() => mergeInterpolatedArrays(['value={{UNDEFINED_VAR}}'])).toThrow(
        'Environment variable "UNDEFINED_VAR" is not defined'
      )
    })

    it('preserves strings without placeholders', () => {
      const result = mergeInterpolatedArrays(['no-placeholder', '{{TEST_VAR}}', 'also-plain'])
      expect(result).toEqual(['no-placeholder', 'test-value', 'also-plain'])
    })

    it('handles empty arrays', () => {
      expect(mergeInterpolatedArrays([], ['{{TEST_VAR}}'], [])).toEqual(['test-value'])
    })

    it('handles mixed interpolated and plain strings', () => {
      const result = mergeInterpolatedArrays([
        'Content-Type: application/json',
        'Authorization: {{API_KEY}}',
        'X-Request-ID: 12345',
      ])
      expect(result).toEqual([
        'Content-Type: application/json',
        'Authorization: secret123',
        'X-Request-ID: 12345',
      ])
    })
  })
})
