import { promises as fs } from 'fs'
import os from 'os'
import path from 'path'
import { logger } from './logger'
import { ensureConfigDir } from './fs'
import { isNodeError, getErrorMessage } from '../../types'

export interface SavedAlias {
  url: string
  method?: string
  headers?: string[]
  data?: string[]
  query?: string[]
  cookie?: string[]
  form?: string[]
  user?: string
  timeout?: string
  retry?: string
  retryDelay?: string
}

export type AliasesStore = Record<string, SavedAlias>

const ALIASES_PATH = path.join(os.homedir(), '.config', 'curly', 'aliases.json')

export async function loadAliases(): Promise<AliasesStore> {
  try {
    const content = await fs.readFile(ALIASES_PATH, 'utf8')
    const aliases = JSON.parse(content) as AliasesStore
    logger().debug(`Loaded aliases from ${ALIASES_PATH}`)
    return aliases
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      logger().debug('No aliases file found')
      return {}
    }
    logger().error(`Error loading aliases: ${getErrorMessage(error)}`)
    return {}
  }
}

async function writeAliases(aliases: AliasesStore): Promise<void> {
  await ensureConfigDir()
  await fs.writeFile(ALIASES_PATH, JSON.stringify(aliases, null, 2), 'utf8')
}

export async function saveAlias(name: string, alias: SavedAlias): Promise<void> {
  const aliases = await loadAliases()
  aliases[name] = alias
  await writeAliases(aliases)
  logger().debug(`Saved alias "${name}"`)
}

export async function getAlias(name: string): Promise<SavedAlias | null> {
  const aliases = await loadAliases()
  const alias = aliases[name]
  if (!alias) {
    return null
  }
  logger().debug(`Using alias: ${name}`)
  return alias
}

export async function deleteAlias(name: string): Promise<boolean> {
  const aliases = await loadAliases()
  if (!aliases[name]) {
    return false
  }
  delete aliases[name]
  await writeAliases(aliases)
  logger().debug(`Deleted alias "${name}"`)
  return true
}

export async function listAliases(): Promise<void> {
  const aliases = await loadAliases()
  const names = Object.keys(aliases)

  if (names.length === 0) {
    console.log('No saved aliases.')
    console.log('Save one with: curly --save "name" [options] <url>')
    return
  }

  console.log('Saved aliases:\n')
  for (const name of names) {
    const alias = aliases[name]
    const method = alias.method || 'GET'
    console.log(`  ${name}`)
    console.log(`    ${method} ${alias.url}`)
    if (alias.headers?.length) {
      console.log(`    Headers: ${alias.headers.length}`)
    }
    console.log()
  }
}
