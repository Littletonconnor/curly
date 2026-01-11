import { promises as fs } from 'fs'
import os from 'os'
import path from 'path'
import { logger } from './logger'

export interface Profile {
  baseUrl?: string
  timeout?: number
  headers?: string[]
  retry?: number
  retryDelay?: number
}

export interface Config {
  default?: string
  profiles?: Record<string, Profile>
}

const CONFIG_PATH = path.join(os.homedir(), '.config', 'curly', 'config.json')

export async function loadConfig(): Promise<Config | null> {
  try {
    const content = await fs.readFile(CONFIG_PATH, 'utf8')
    const config = JSON.parse(content) as Config
    logger().debug(`Loaded config from ${CONFIG_PATH}`)
    return config
  } catch (e: any) {
    if (e.code === 'ENOENT') {
      logger().debug('No config file found')
      return null
    }
    logger().error(`Error loading config: ${e.message}`)
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

  const profile = config.profiles[name]
  if (!profile) {
    if (profileName) {
      // Only warn if user explicitly requested a profile that doesn't exist
      logger().warn(`Profile "${profileName}" not found in config`)
    }
    return null
  }

  logger().debug(`Using profile: ${name}`)
  return profile
}

export function resolveUrl(url: string, baseUrl?: string): string {
  if (!baseUrl) {
    return url
  }

  // If URL is already absolute (starts with http:// or https://), don't prepend baseUrl
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  // If URL starts with /, prepend baseUrl
  if (url.startsWith('/')) {
    // Remove trailing slash from baseUrl if present
    const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
    return `${base}${url}`
  }

  return url
}
