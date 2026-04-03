import { isNodeError } from '../../types'

/**
 * Maps common Node.js / network error codes to user-friendly messages.
 * These replace cryptic system errors with actionable guidance.
 */
const FRIENDLY_ERRORS: Record<string, string> = {
  ECONNREFUSED: 'Connection refused — is the server running?',
  ECONNRESET: 'Connection was reset by the server',
  ECONNABORTED: 'Connection was aborted',
  ETIMEDOUT: 'Connection timed out — the server took too long to respond',
  ENOTFOUND: 'DNS lookup failed — check the hostname for typos',
  EHOSTUNREACH: 'Host is unreachable — check your network connection',
  ENETUNREACH: 'Network is unreachable — check your internet connection',
  CERT_HAS_EXPIRED: 'SSL certificate has expired',
  DEPTH_ZERO_SELF_SIGNED_CERT:
    'Self-signed SSL certificate — the server uses an untrusted certificate',
  UNABLE_TO_VERIFY_LEAF_SIGNATURE: 'Unable to verify SSL certificate chain',
  ERR_TLS_CERT_ALTNAME_INVALID: 'SSL certificate does not match the hostname',
}

/**
 * Returns a user-friendly error message for known Node.js error codes,
 * or null if the error is not recognized.
 */
export function getFriendlyErrorMessage(error: unknown): string | null {
  if (!isNodeError(error) || !error.code) return null
  return FRIENDLY_ERRORS[error.code] ?? null
}
