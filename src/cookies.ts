import { logger } from './utils'

export function applyCookieHeader(fileData: string) {
  try {
    // heuristic here will be to try and parse as JSON first
    const cookie = parseJsonCookies(fileData)
    return cookie
  } catch (error) {
    return ''
  }
}

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
    logger().error('Error parsing cookie file: ', error)
    return ''
  }
}
