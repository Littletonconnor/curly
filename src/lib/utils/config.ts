import { promises as fs } from 'fs'
import os from 'os'
import path from 'path'
import { logger } from './logger'
import { isNodeError, getErrorMessage } from '../../types'

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
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      logger().debug('No config file found')
      return null
    }
    logger().error(`Error loading config: ${getErrorMessage(error)}`)
    return null
  }
}

/**
 * Normalizes a value that could be either an array of strings or an object
 * into an array of "key: value" strings.
 *
 * @example
 * normalizeToArray(['a', 'b']) // ['a', 'b']
 * normalizeToArray({ 'Content-Type': 'application/json' }) // ['Content-Type: application/json']
 */
function normalizeToArray(value: string[] | Record<string, string> | undefined): string[] | undefined {
  if (!value) {
    return undefined
  }
  if (Array.isArray(value)) {
    return value
  }
  if (typeof value === 'object') {
    return Object.entries(value).map(([key, val]) => `${key}: ${val}`)
  }
  return undefined
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
      logger().warn(`Profile "${profileName}" not found in config`)
    }
    return null
  }

  logger().debug(`Using profile: ${name}`)

  return {
    ...profile,
    headers: normalizeToArray(profile.headers as string[] | Record<string, string> | undefined),
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
