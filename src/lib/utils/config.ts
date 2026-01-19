import { promises as fs } from 'fs'
import os from 'os'
import path from 'path'
import { logger } from './logger'
import { isNodeError, getErrorMessage } from '../../types'

/** Headers can be specified as array ["Key: Value"] or object {"Key": "Value"} */
type HeadersInput = string[] | Record<string, string>

/** Raw profile as stored in config file (supports both header formats) */
interface RawProfile {
  baseUrl?: string
  timeout?: number
  headers?: HeadersInput
  retry?: number
  retryDelay?: number
}

/** Normalized profile with headers as string array */
export interface Profile {
  baseUrl?: string
  timeout?: number
  headers?: string[]
  retry?: number
  retryDelay?: number
}

/**
 * Convert headers from object format {"Key": "Value"} to array format ["Key: Value"]
 */
function normalizeHeaders(headers: HeadersInput | undefined): string[] | undefined {
  if (!headers) {
    return undefined
  }
  if (Array.isArray(headers)) {
    return headers
  }
  // Convert object to array of "Key: Value" strings
  return Object.entries(headers).map(([key, value]) => `${key}: ${value}`)
}

export interface Config {
  default?: string
  profiles?: Record<string, RawProfile>
}

const CONFIG_PATH = path.join(os.homedir(), '.config', 'curly', 'config.json')

export async function loadConfig(): Promise<Config | null> {
  try {
    const content = await fs.readFile(CONFIG_PATH, 'utf8')
    const config = JSON.parse(content) as Config
    logger().debug(`Loaded config from ${CONFIG_PATH}`)
    return config
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      logger().debug('No config file found')
      return null
    }
    logger().error(`Error loading config: ${getErrorMessage(error)}`)
    return null
  }
}

export function getProfile(config: Config | null, profileName?: string): Profile | null {
  if (!config || !config.profiles) {
    return null
  }

  const name = profileName || config.default
  if (!name) {
    return null
  }

  const rawProfile = config.profiles[name]
  if (!rawProfile) {
    if (profileName) {
      logger().warn(`Profile "${profileName}" not found in config`)
    }
    return null
  }

  logger().debug(`Using profile: ${name}`)

  // Normalize headers from object to array format
  return {
    ...rawProfile,
    headers: normalizeHeaders(rawProfile.headers),
  }
}

export function resolveUrl(url: string, baseUrl?: string): string {
  if (!baseUrl) {
    return url
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  if (url.startsWith('/')) {
    const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
    return `${base}${url}`
  }

  return url
}
