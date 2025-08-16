import { logger } from '../../lib/utils/logger'

// TODO: this currently only support name, value
// and not other options like expiration dates, etc.
export function applyCookieHeader(fileData: string) {
  let cookie = ''
  try {
    cookie = parseJsonCookies(fileData)

    return cookie
  } catch (error) {
    try {
      cookie = parseNetscapeCookies(fileData)
    } catch (error: any) {
      logger().error('Failed parsing cookies as both JSON and Netscape: ', error)
    }
  }

  return cookie
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
 *
 * @param fileData - The raw string content of the JSON cookie file.
 * @returns A semicolon-separated string of cookies suitable for the `Cookie` header.
 * @throws Will throw an error if the JSON is invalid or if expected properties are missing.
 */
function parseJsonCookies(fileData: string) {
  try {
    const parsedFileData = JSON.parse(fileData)
    let cookies: string[] = []

    if (Array.isArray(parsedFileData)) {
      for (const object of parsedFileData) {
        if (object.name && object.value) {
          cookies.push(`${object.name}=${object.value}`)
        }
      }
    } else {
      cookies.push(`${parsedFileData.name}=${parsedFileData.value}`)
    }

    return cookies.join('; ').trim()
  } catch (error) {
    throw error
  }
}

/**
 * Parses a Netscape-formatted cookie file and returns a cookie string.
 *
 * The Netscape cookie file format is a legacy format that consists of lines with seven
 * tab-separated fields:
 *
 * domain \t flag \t path \t secure \t expiration \t name \t value
 *
 * Lines starting with `#` are considered comments and are ignored.
 *
 * @param fileData - The raw string content of the Netscape cookie file.
 * @returns A semicolon-separated string of cookies suitable for the `Cookie` header.
 * @throws Will throw an error if the parsing fails due to unexpected formats.
 *
 * @example
 *  Sample Netscape Cookie File (`cookies.txt`)
 *  # Netscape HTTP Cookie File
 *  # http://curl.haxx.se/rfc/cookie_spec.html
 *  # This is a generated file!  Do not edit.
 *
 *  .example.com	TRUE	/	FALSE	1609459200	sessionId=abc123
 *  .example.com	TRUE	/	FALSE	1609459200	user=john_doe
 */
function parseNetscapeCookies(fileData: string) {
  try {
    const lines = fileData.split('\n')
    const cookies: string[] = []

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue

      const parts = trimmed.split('\t')
      if (parts.length >= 7) {
        // only add name and value parts
        const [, , , , , name, value] = parts
        if (name && value) {
          cookies.push(`${name}=${value}`)
        }
      }
    }

    return cookies.join(';')
  } catch (error) {
    throw error
  }
}

/**
 * Writes the extracted Set-Cookie headers to a specified cookie jar file.
 *
 * Currently, supports JSON format. Future updates may include support for the Netscape cookie format.
 *
 * @param headers - The headers returned from the response.
 */
export function parseSetCookieHeaders(headers: Headers) {
  const setCookieHeaders = headers.getSetCookie()
  const cookieJar: Record<string, string> = {}

  logger().debug(`Parsing set-cookie headers: ${setCookieHeaders}`)
  for (const cookie of setCookieHeaders) {
    const [nameAndValue] = cookie.split(';')
    const [name, value] = nameAndValue.split('=')
    cookieJar[name] = value
  }

  logger().debug(`Parsing set-cookie headers complete: ${JSON.stringify(cookieJar)}`)
  return cookieJar
}
