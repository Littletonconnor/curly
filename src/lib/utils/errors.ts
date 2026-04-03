import { isNodeError } from '../../types'

/**
 * Maps common Node.js / network error codes to user-friendly messages.
 * These replace cryptic system errors with actionable guidance.
 */
const FRIENDLY_ERRORS: Record<string, string> = {
  ECONNREFUSED:
    'Connection refused — is the server running?\n  Hint: Check that the server is running and the port is correct.',
  ECONNRESET: 'Connection was reset by the server',
  ECONNABORTED: 'Connection was aborted',
  ETIMEDOUT:
    'Connection timed out — the server took too long to respond.\n  Hint: Try increasing the timeout with --timeout <ms>.',
  ENOTFOUND:
    'DNS lookup failed — check the hostname for typos.\n  Hint: Verify the domain is correct and your network connection is active.',
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

/**
 * Maps HTTP status codes to actionable hints for --fail mode.
 */
const HTTP_STATUS_HINTS: Record<number, string> = {
  400: 'The request was malformed. Check your data format and required fields.',
  401: 'Authentication required. Try -u user:pass or -H "Authorization: Bearer <token>".',
  403: 'Access forbidden. You may lack permission or need different credentials.',
  404: 'Resource not found. Check the URL path for typos.',
  405: 'HTTP method not allowed. Try a different method with -X (GET, POST, PUT, DELETE).',
  408: 'The server timed out waiting for the request.',
  409: 'Conflict with the current state of the resource.',
  413: 'Request body too large. Try sending less data.',
  415: 'Unsupported media type. Try setting Content-Type with -H "Content-Type: application/json".',
  422: 'Unprocessable entity. The server understood the request but the data is invalid.',
  429: 'Too many requests. Try again later or add a delay between requests.',
  500: 'Internal server error. This is a problem on the server side.',
  502: 'Bad gateway. The upstream server may be down.',
  503: 'Service unavailable. The server may be overloaded or under maintenance.',
  504: 'Gateway timeout. The upstream server did not respond in time.',
}

/**
 * Returns a hint for a given HTTP status code, or null if not recognized.
 */
export function getHttpStatusHint(status: number): string | null {
  return HTTP_STATUS_HINTS[status] ?? null
}

/**
 * Returns the closest matching flag name using Levenshtein distance,
 * or null if no close match is found.
 */
export function suggestFlag(unknown: string, knownFlags: string[]): string | null {
  const flag = unknown.replace(/^-+/, '')
  let bestMatch: string | null = null
  let bestDistance = Infinity

  for (const known of knownFlags) {
    const d = levenshtein(flag, known)
    if (d < bestDistance) {
      bestDistance = d
      bestMatch = known
    }
  }

  // Only suggest if the distance is reasonable (at most ~40% of the flag length)
  const maxDistance = Math.max(2, Math.floor(flag.length * 0.4))
  if (bestMatch && bestDistance <= maxDistance) {
    return `--${bestMatch}`
  }
  return null
}

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0) as number[])

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }

  return dp[m][n]
}
