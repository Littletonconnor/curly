import { logger } from '../../lib/utils/logger'
import { getErrorMessage } from '../../types'

/**
 * Parses cookie file data and returns a formatted cookie header string.
 * Supports JSON format (array of {name, value} objects or key-value object).
 *
 * @param fileData - Raw contents of the cookie file
 * @returns Formatted cookie string for the Cookie header (e.g., "name1=value1; name2=value2")
 */
export function applyCookieHeader(fileData: string): string {
  try {
    return parseJsonCookies(fileData)
  } catch (error: unknown) {
    return logger().error(`Failed parsing cookie file as JSON: ${getErrorMessage(error)}`)
  }
}

/**
 * Parses a JSON-formatted cookie file and returns a cookie string.
 *
 * The function supports two JSON formats:
 * 1. An array of cookie objects, each containing `name` and `value` properties.
 *    Example:
 *    [
 *      { "name": "sessionId", "value": "abc123" },
 *      { "name": "user", "value": "john_doe" }
 *    ]
 *
 * 2. A single object with key-value pairs representing cookie names and their values.
 *    Example:
 *    {
 *      "sessionId": "abc123",
 *      "user": "john_doe"
 *    }
 */
function parseJsonCookies(fileData: string) {
  const parsedFileData = JSON.parse(fileData)
  const cookies: string[] = []

  if (Array.isArray(parsedFileData)) {
    for (const object of parsedFileData) {
      if (object.name && object.value) {
        cookies.push(`${object.name}=${object.value}`)
      }
    }
  } else {
    for (const [name, value] of Object.entries(parsedFileData)) {
      cookies.push(`${name}=${value}`)
    }
  }

  return cookies.join('; ').trim()
}

/**
 * Parses Set-Cookie headers from a response into a key-value object.
 * Used for saving cookies to a cookie jar file.
 *
 * @param headers - The response Headers object
 * @returns Object mapping cookie names to their values
 */
export function parseSetCookieHeaders(headers: Headers) {
  const setCookieHeaders = headers.getSetCookie()
  const cookieJar: Record<string, string> = {}

  for (const cookie of setCookieHeaders) {
    const [nameAndValue] = cookie.split(';')
    const eqIdx = nameAndValue.indexOf('=')
    if (eqIdx === -1) continue

    const name = nameAndValue.slice(0, eqIdx).trim()
    const value = nameAndValue.slice(eqIdx + 1).trim()
    cookieJar[name] = value
  }

  return cookieJar
}
