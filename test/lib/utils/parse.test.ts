import { describe, expect, it } from 'vitest'
import { parseIntOption, formatBytes, formatDuration } from '../../../src/lib/utils/parse'

describe('parse utilities', () => {
  describe('parseIntOption', () => {
    it('returns the default value when input is undefined', () => {
      expect(parseIntOption(undefined, 10)).toBe(10)
    })

    it('parses a valid integer string', () => {
      expect(parseIntOption('42', 10)).toBe(42)
    })

    it('parses zero correctly', () => {
      expect(parseIntOption('0', 10)).toBe(0)
    })

    it('parses negative numbers', () => {
      expect(parseIntOption('-5', 10)).toBe(-5)
    })

    it('returns the default value for non-numeric strings', () => {
      expect(parseIntOption('abc', 10)).toBe(10)
    })

    it('returns the default value for empty string', () => {
      expect(parseIntOption('', 10)).toBe(10)
    })

    it('truncates floating point numbers to integers', () => {
      expect(parseIntOption('3.14', 10)).toBe(3)
    })

    it('parses strings with leading zeros', () => {
      expect(parseIntOption('007', 10)).toBe(7)
    })

    it('returns the default for strings starting with non-digits', () => {
      expect(parseIntOption('abc123', 10)).toBe(10)
    })

    it('parses strings with trailing non-digits', () => {
      // parseInt stops at first non-digit
      expect(parseIntOption('123abc', 10)).toBe(123)
    })
  })

  describe('formatBytes', () => {
    it('formats bytes under 1KB', () => {
      expect(formatBytes(0)).toBe('0 B')
      expect(formatBytes(1)).toBe('1 B')
      expect(formatBytes(512)).toBe('512 B')
      expect(formatBytes(1023)).toBe('1023 B')
    })

    it('formats kilobytes', () => {
      expect(formatBytes(1024)).toBe('1.00 KB')
      expect(formatBytes(1536)).toBe('1.50 KB')
      expect(formatBytes(10240)).toBe('10.00 KB')
    })

    it('formats megabytes', () => {
      expect(formatBytes(1024 * 1024)).toBe('1.00 MB')
      expect(formatBytes(1.5 * 1024 * 1024)).toBe('1.50 MB')
      expect(formatBytes(100 * 1024 * 1024)).toBe('100.00 MB')
    })

    it('formats gigabytes', () => {
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1.00 GB')
      expect(formatBytes(2.5 * 1024 * 1024 * 1024)).toBe('2.50 GB')
    })

    it('handles edge cases at boundaries', () => {
      // Just under 1KB
      expect(formatBytes(1023)).toBe('1023 B')
      // Exactly 1KB
      expect(formatBytes(1024)).toBe('1.00 KB')
      // Just under 1MB
      expect(formatBytes(1024 * 1024 - 1)).toMatch(/KB$/)
      // Exactly 1MB
      expect(formatBytes(1024 * 1024)).toBe('1.00 MB')
    })
  })

  describe('formatDuration', () => {
    it('formats duration with default 4 decimal places', () => {
      expect(formatDuration(1.23456789)).toBe('1.2346')
    })

    it('formats duration with custom decimal places', () => {
      expect(formatDuration(1.23456789, 2)).toBe('1.23')
      expect(formatDuration(1.23456789, 0)).toBe('1')
      expect(formatDuration(1.23456789, 6)).toBe('1.234568')
    })

    it('handles zero duration', () => {
      expect(formatDuration(0)).toBe('0.0000')
      expect(formatDuration(0, 2)).toBe('0.00')
    })

    it('handles very small durations', () => {
      expect(formatDuration(0.0001)).toBe('0.0001')
      expect(formatDuration(0.00001, 5)).toBe('0.00001')
    })

    it('handles large durations', () => {
      expect(formatDuration(3600)).toBe('3600.0000')
      expect(formatDuration(86400, 0)).toBe('86400')
    })
  })
})
