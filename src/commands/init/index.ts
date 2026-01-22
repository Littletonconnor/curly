import * as readline from 'readline'
import { promises as fs } from 'fs'
import { existsSync } from 'fs'
import path from 'path'
import os from 'os'
import { Config, Profile } from '../../lib/utils/config'

const CONFIG_DIR = path.join(os.homedir(), '.config', 'curly')
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json')

interface PromptResult {
  answer: string
  cancelled: boolean
}

function createInterface(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
}

async function prompt(rl: readline.Interface, question: string): Promise<PromptResult> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve({ answer: answer.trim(), cancelled: false })
    })

    rl.on('close', () => {
      resolve({ answer: '', cancelled: true })
    })
  })
}

async function confirm(
  rl: readline.Interface,
  question: string,
  defaultValue = false,
): Promise<boolean> {
  const hint = defaultValue ? '(Y/n)' : '(y/N)'
  const result = await prompt(rl, `${question} ${hint} `)
  if (result.cancelled) return false
  if (result.answer === '') return defaultValue
  return result.answer.toLowerCase().startsWith('y')
}

function validateUrl(url: string): boolean {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch {
    return url.startsWith('http://') || url.startsWith('https://')
  }
}

function validateHeader(header: string): boolean {
  return header.includes(':')
}

async function collectHeaders(rl: readline.Interface): Promise<string[]> {
  const headers: string[] = []
  console.log('  Enter headers in "Name: value" format (empty line to finish):')

  while (true) {
    const result = await prompt(rl, '  > ')
    if (result.cancelled || result.answer === '') break

    if (validateHeader(result.answer)) {
      headers.push(result.answer)
    } else {
      console.log('    Invalid header format. Use "Name: value"')
    }
  }

  return headers
}

async function createProfile(
  rl: readline.Interface,
): Promise<{ name: string; profile: Profile } | null> {
  const nameResult = await prompt(rl, '? Profile name: ')
  if (nameResult.cancelled || !nameResult.answer) return null

  const name = nameResult.answer

  const baseUrlResult = await prompt(rl, `? Base URL for '${name}': `)
  if (baseUrlResult.cancelled) return null

  const profile: Profile = {}

  if (baseUrlResult.answer) {
    if (!validateUrl(baseUrlResult.answer)) {
      console.log('  Warning: URL may be invalid, but proceeding anyway')
    }
    profile.baseUrl = baseUrlResult.answer
  }

  const wantTimeout = await confirm(rl, '? Set a default timeout?', false)
  if (wantTimeout) {
    const timeoutResult = await prompt(rl, '? Timeout in milliseconds: ')
    if (!timeoutResult.cancelled && timeoutResult.answer) {
      const timeout = parseInt(timeoutResult.answer, 10)
      if (!isNaN(timeout) && timeout > 0) {
        profile.timeout = timeout
      } else {
        console.log('  Invalid timeout, skipping')
      }
    }
  }

  const wantHeaders = await confirm(rl, '? Add default headers?', false)
  if (wantHeaders) {
    const headers = await collectHeaders(rl)
    if (headers.length > 0) {
      profile.headers = headers
    }
  }

  const wantRetry = await confirm(rl, '? Configure retry settings?', false)
  if (wantRetry) {
    const retryResult = await prompt(rl, '? Number of retries (default: 0): ')
    if (!retryResult.cancelled && retryResult.answer) {
      const retry = parseInt(retryResult.answer, 10)
      if (!isNaN(retry) && retry >= 0) {
        profile.retry = retry
      }
    }

    const retryDelayResult = await prompt(rl, '? Initial retry delay in ms (default: 1000): ')
    if (!retryDelayResult.cancelled && retryDelayResult.answer) {
      const retryDelay = parseInt(retryDelayResult.answer, 10)
      if (!isNaN(retryDelay) && retryDelay > 0) {
        profile.retryDelay = retryDelay
      }
    }
  }

  return { name, profile }
}

async function loadExistingConfig(): Promise<Config | null> {
  try {
    if (!existsSync(CONFIG_PATH)) {
      return null
    }
    const content = await fs.readFile(CONFIG_PATH, 'utf8')
    return JSON.parse(content) as Config
  } catch {
    return null
  }
}

async function saveConfig(config: Config): Promise<void> {
  await fs.mkdir(CONFIG_DIR, { recursive: true })
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n', 'utf8')
}

export async function handleInit(): Promise<void> {
  const rl = createInterface()

  console.log('')
  console.log("Welcome to Curly! Let's set up your configuration.")
  console.log('')

  const existingConfig = await loadExistingConfig()
  let config: Config = { profiles: {} }

  if (existingConfig) {
    console.log(`Found existing config at ${CONFIG_PATH}`)
    const merge = await confirm(rl, '? Merge with existing config?', true)
    if (merge) {
      config = existingConfig
    } else {
      const overwrite = await confirm(rl, '? Overwrite existing config?', false)
      if (!overwrite) {
        console.log('')
        console.log('Setup cancelled.')
        rl.close()
        return
      }
    }
    console.log('')
  }

  // Ask about default profile
  const wantDefault = await confirm(rl, '? Set a default profile name?', false)
  if (wantDefault) {
    const defaultResult = await prompt(rl, '? Default profile name: ')
    if (!defaultResult.cancelled && defaultResult.answer) {
      config.default = defaultResult.answer
    }
  }
  console.log('')

  // Create profiles
  let createMore = await confirm(rl, '? Create a profile?', true)

  while (createMore) {
    const profileResult = await createProfile(rl)
    if (profileResult) {
      if (!config.profiles) {
        config.profiles = {}
      }
      config.profiles[profileResult.name] = profileResult.profile
      console.log(`  Added profile '${profileResult.name}'`)
    }
    console.log('')
    createMore = await confirm(rl, '? Create another profile?', false)
  }

  // Save configuration
  if (config.profiles && Object.keys(config.profiles).length > 0) {
    try {
      await saveConfig(config)
      console.log('')
      console.log(`Configuration saved to ${CONFIG_PATH}`)
      console.log('')
      console.log('Tip: Use profiles with the -p flag:')
      const profileNames = Object.keys(config.profiles)
      if (profileNames.length > 0) {
        console.log(`  curly /users -p ${profileNames[0]}`)
      }
      if (config.default) {
        console.log('')
        console.log(
          `Default profile '${config.default}' will be used when no -p flag is specified.`,
        )
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`Failed to save config: ${message}`)
      rl.close()
      process.exit(1)
    }
  } else {
    console.log('')
    console.log('No profiles created. Run `curly --init` again to set up profiles.')
  }

  console.log('')
  rl.close()
}
