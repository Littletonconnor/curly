import { describe, expect, it } from 'vitest'
import { getProfile, resolveUrl } from '../../../src/lib/utils/config'

describe('config', () => {
  describe('getProfile', () => {
    it('returns null when config is null', () => {
      expect(getProfile(null, 'dev')).toBeNull()
    })

    it('returns null when profiles is undefined', () => {
      expect(getProfile({}, 'dev')).toBeNull()
    })

    it('returns null when no profile name and no default', () => {
      expect(getProfile({ profiles: { dev: { baseUrl: 'http://localhost' } } })).toBeNull()
    })

    it('returns profile by explicit name', () => {
      const config = {
        profiles: {
          dev: { baseUrl: 'http://localhost:3000' },
          prod: { baseUrl: 'https://api.example.com' },
        },
      }
      expect(getProfile(config, 'prod')).toEqual({ baseUrl: 'https://api.example.com' })
    })

    it('returns default profile when no name specified', () => {
      const config = {
        default: 'dev',
        profiles: {
          dev: { baseUrl: 'http://localhost:3000' },
          prod: { baseUrl: 'https://api.example.com' },
        },
      }
      expect(getProfile(config)).toEqual({ baseUrl: 'http://localhost:3000' })
    })

    it('returns null for non-existent profile', () => {
      const config = {
        profiles: {
          dev: { baseUrl: 'http://localhost:3000' },
        },
      }
      expect(getProfile(config, 'staging')).toBeNull()
    })
  })

  describe('resolveUrl', () => {
    it('returns url unchanged when no baseUrl', () => {
      expect(resolveUrl('/users', undefined)).toBe('/users')
    })

    it('prepends baseUrl to path starting with /', () => {
      expect(resolveUrl('/users', 'http://localhost:3000')).toBe('http://localhost:3000/users')
    })

    it('handles baseUrl with trailing slash', () => {
      expect(resolveUrl('/users', 'http://localhost:3000/')).toBe('http://localhost:3000/users')
    })

    it('does not prepend baseUrl to http:// URLs', () => {
      expect(resolveUrl('http://other.com/api', 'http://localhost:3000')).toBe(
        'http://other.com/api'
      )
    })

    it('does not prepend baseUrl to https:// URLs', () => {
      expect(resolveUrl('https://other.com/api', 'http://localhost:3000')).toBe(
        'https://other.com/api'
      )
    })

    it('does not modify URLs without leading slash', () => {
      expect(resolveUrl('users', 'http://localhost:3000')).toBe('users')
    })
  })
})
