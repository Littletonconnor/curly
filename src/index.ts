import { cli, printHelpMessage } from './lib/cli'
import {
  printHistoryFile,
  writeHistoryFile,
  interpolate,
  interpolateArray,
  loadConfig,
  getProfile,
  resolveUrl,
} from './lib/utils'
import { executeRequest } from './commands/request'
import { load } from './commands/load-test'
import { handleCompletions } from './commands/completions'
import { setVerbose } from './lib/utils/logger'

export async function main() {
  try {
    await writeHistoryFile()
    const { values: cliFlags, positionals } = cli()

    if (cliFlags.verbose) {
      setVerbose(true)
    }

    if (cliFlags.help) {
      printHelpMessage()
      process.exit(0)
    }

    if (cliFlags.history) {
      await printHistoryFile()
      process.exit(0)
    }

    if (cliFlags.completions !== undefined) {
      handleCompletions(cliFlags.completions)
      process.exit(0)
    }

    // Load config and get profile
    const config = await loadConfig()
    const profile = getProfile(config, cliFlags.profile)

    const rawUrl = positionals[positionals.length - 1]

    // Resolve URL with profile's baseUrl if applicable
    const resolvedUrl = resolveUrl(rawUrl, profile?.baseUrl)

    // Interpolate environment variables in URL and options
    const url = interpolate(resolvedUrl)

    // Merge profile headers with CLI headers (CLI headers add to profile headers)
    const profileHeaders = profile?.headers ? interpolateArray(profile.headers) : []
    const cliHeaders = interpolateArray(cliFlags.headers)
    const mergedHeaders = [...profileHeaders, ...cliHeaders]

    const options = {
      ...cliFlags,
      headers: mergedHeaders,
      data: interpolateArray(cliFlags.data),
      'data-raw': cliFlags['data-raw'] ? interpolate(cliFlags['data-raw']) : undefined,
      cookie: interpolateArray(cliFlags.cookie),
      query: interpolateArray(cliFlags.query),
      user: cliFlags.user ? interpolate(cliFlags.user) : undefined,
      // Profile values as defaults, CLI flags override
      timeout: cliFlags.timeout ?? profile?.timeout?.toString(),
      retry: cliFlags.retry !== '0' ? cliFlags.retry : (profile?.retry?.toString() ?? '0'),
      'retry-delay':
        cliFlags['retry-delay'] !== '1000'
          ? cliFlags['retry-delay']
          : (profile?.retryDelay?.toString() ?? '1000'),
    }

    const isLoadTest = options.concurrency || options.requests
    if (isLoadTest) {
      await load(url, options)
    } else {
      await executeRequest(url, options)
    }
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}
