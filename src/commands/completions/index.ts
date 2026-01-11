import { existsSync, readFileSync, appendFileSync, writeFileSync, mkdirSync } from 'fs'
import path from 'path'
import os from 'os'
import { getBashScript, getZshScript } from './scripts'

type Shell = 'bash' | 'zsh'

interface InstallResult {
  success: boolean
  message: string
  path?: string
}

function getShellConfigPath(shell: Shell): string {
  const home = os.homedir()
  switch (shell) {
    case 'bash':
      // Check for common bash config files
      const bashrc = path.join(home, '.bashrc')
      const bashProfile = path.join(home, '.bash_profile')
      // Prefer .bashrc on Linux, .bash_profile on macOS
      if (process.platform === 'darwin') {
        return existsSync(bashProfile) ? bashProfile : bashrc
      }
      return bashrc
    case 'zsh':
      return path.join(home, '.zshrc')
  }
}

function getCompletionDir(_shell: Shell): string {
  const home = os.homedir()
  const configDir = path.join(home, '.config', 'curly', 'completions')
  return configDir
}

function getCompletionFilePath(shell: Shell): string {
  const dir = getCompletionDir(shell)
  switch (shell) {
    case 'bash':
      return path.join(dir, 'curly.bash')
    case 'zsh':
      return path.join(dir, '_curly')
  }
}

function getSourceLine(shell: Shell): string {
  const filePath = getCompletionFilePath(shell)
  switch (shell) {
    case 'bash':
      return `\n# Curly shell completions\n[ -f "${filePath}" ] && source "${filePath}"\n`
    case 'zsh':
      const dir = getCompletionDir(shell)
      return `\n# Curly shell completions\nfpath=(${dir} $fpath)\nautoload -Uz compinit && compinit\n`
  }
}

function isAlreadyInstalled(shell: Shell): boolean {
  const configPath = getShellConfigPath(shell)
  if (!existsSync(configPath)) {
    return false
  }
  const content = readFileSync(configPath, 'utf-8')
  return content.includes('Curly shell completions')
}

function installCompletions(shell: Shell): InstallResult {
  const completionFile = getCompletionFilePath(shell)
  const completionDir = path.dirname(completionFile)
  const configPath = getShellConfigPath(shell)
  const script = shell === 'bash' ? getBashScript() : getZshScript()

  try {
    // Create completion directory if it doesn't exist
    if (!existsSync(completionDir)) {
      mkdirSync(completionDir, { recursive: true })
    }

    // Write completion script
    writeFileSync(completionFile, script, { mode: 0o644 })

    // Check if already installed
    if (isAlreadyInstalled(shell)) {
      return {
        success: true,
        message: `Completions updated at ${completionFile}\nAlready configured in ${configPath}`,
        path: completionFile,
      }
    }

    // Add source line to shell config
    const sourceLine = getSourceLine(shell)
    appendFileSync(configPath, sourceLine)

    return {
      success: true,
      message: `Completions installed successfully!\n\nCompletion script: ${completionFile}\nShell config updated: ${configPath}\n\nRestart your shell or run:\n  source ${configPath}`,
      path: completionFile,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      message: `Failed to install completions: ${errorMessage}`,
    }
  }
}

function detectShell(): Shell | null {
  const shellEnv = process.env.SHELL || ''
  if (shellEnv.includes('zsh')) return 'zsh'
  if (shellEnv.includes('bash')) return 'bash'
  return null
}

export function handleCompletions(arg: string | undefined): void {
  if (!arg) {
    console.log('Usage: curly --completions <shell|install>')
    console.log('')
    console.log('Generate or install shell completions for curly.')
    console.log('')
    console.log('Commands:')
    console.log('  bash          Output bash completion script')
    console.log('  zsh           Output zsh completion script')
    console.log('  install       Auto-detect shell and install completions')
    console.log('  install bash  Install bash completions')
    console.log('  install zsh   Install zsh completions')
    console.log('')
    console.log('Examples:')
    console.log('  curly --completions bash > ~/.config/curly/completions/curly.bash')
    console.log('  curly --completions install')
    console.log('  source <(curly --completions bash)')
    process.exit(0)
  }

  // Handle "install" with optional shell argument
  if (arg === 'install') {
    const shell = detectShell()
    if (!shell) {
      console.error('Could not detect shell. Please specify: curly --completions install bash|zsh')
      process.exit(1)
    }
    const result = installCompletions(shell)
    console.log(result.message)
    process.exit(result.success ? 0 : 1)
  }

  // Handle shell-specific commands
  switch (arg) {
    case 'bash':
      console.log(getBashScript())
      break
    case 'zsh':
      console.log(getZshScript())
      break
    default:
      // Check if it's "install bash" or "install zsh" passed as single string
      if (arg.startsWith('install ')) {
        const shell = arg.split(' ')[1] as Shell
        if (shell !== 'bash' && shell !== 'zsh') {
          console.error(`Unknown shell: ${shell}. Supported: bash, zsh`)
          process.exit(1)
        }
        const result = installCompletions(shell)
        console.log(result.message)
        process.exit(result.success ? 0 : 1)
      }
      console.error(`Unknown completions argument: ${arg}`)
      console.error('Use: curly --completions bash|zsh|install')
      process.exit(1)
  }
}

export function handleCompletionsInstall(shell: string | undefined): void {
  if (!shell) {
    const detectedShell = detectShell()
    if (!detectedShell) {
      console.error('Could not detect shell. Please specify: curly --completions-install bash|zsh')
      process.exit(1)
    }
    const result = installCompletions(detectedShell)
    console.log(result.message)
    process.exit(result.success ? 0 : 1)
  }

  if (shell !== 'bash' && shell !== 'zsh') {
    console.error(`Unknown shell: ${shell}. Supported: bash, zsh`)
    process.exit(1)
  }

  const result = installCompletions(shell as Shell)
  console.log(result.message)
  process.exit(result.success ? 0 : 1)
}
