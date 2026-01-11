import { cli, printHelpMessage } from './lib/cli'
import {
  printHistoryFile,
  writeHistoryFile,
  interpolate,
  interpolateArray,
  loadConfig,
  getProfile,
  resolveUrl,
  saveAlias,
  getAlias,
  deleteAlias,
  listAliases,
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

    if (cliFlags.aliases) {
      await listAliases()
      process.exit(0)
    }

    if (cliFlags['delete-alias']) {
      const deleted = await deleteAlias(cliFlags['delete-alias'])
      if (deleted) {
        console.log(`Deleted alias "${cliFlags['delete-alias']}"`)
      } else {
        console.error(`Alias "${cliFlags['delete-alias']}" not found`)
        process.exit(1)
      }
      process.exit(0)
    }

    const config = await loadConfig()
    const profile = getProfile(config, cliFlags.profile)

    // Load alias if --use is specified
    const alias = cliFlags.use ? await getAlias(cliFlags.use) : null
    if (cliFlags.use && !alias) {
      console.error(`Alias "${cliFlags.use}" not found`)
      console.error('Use --aliases to see available aliases')
      process.exit(1)
    }

    // URL: CLI positional > alias > error
    const rawUrl = positionals[positionals.length - 1] || alias?.url
    if (!rawUrl) {
      console.error('No URL provided')
      process.exit(1)
    }

    const resolvedUrl = resolveUrl(rawUrl, profile?.baseUrl)
    const url = interpolate(resolvedUrl)

    // Merge headers: profile < alias < CLI (later sources override)
    const profileHeaders = interpolateArray(profile?.headers)
    const aliasHeaders = interpolateArray(alias?.headers)
    const cliHeaders = interpolateArray(cliFlags.headers)
    const mergedHeaders = [...profileHeaders, ...aliasHeaders, ...cliHeaders]

    // Merge data arrays: alias + CLI
    const aliasData = interpolateArray(alias?.data)
    const cliData = interpolateArray(cliFlags.data)
    const mergedData = [...aliasData, ...cliData]

    // Merge other array fields
    const aliasCookies = interpolateArray(alias?.cookie)
    const cliCookies = interpolateArray(cliFlags.cookie)
    const mergedCookies = [...aliasCookies, ...cliCookies]

    const aliasQuery = interpolateArray(alias?.query)
    const cliQuery = interpolateArray(cliFlags.query)
    const mergedQuery = [...aliasQuery, ...cliQuery]

    const options = {
      ...cliFlags,
      method: cliFlags.method || alias?.method,
      headers: mergedHeaders,
      data: mergedData,
      'data-raw': cliFlags['data-raw'] ? interpolate(cliFlags['data-raw']) : undefined,
      cookie: mergedCookies,
      query: mergedQuery,
      user: cliFlags.user ? interpolate(cliFlags.user) : (alias?.user ? interpolate(alias.user) : undefined),
      timeout: cliFlags.timeout ?? alias?.timeout ?? profile?.timeout?.toString(),
      retry: cliFlags.retry !== '0' ? cliFlags.retry : (alias?.retry ?? profile?.retry?.toString() ?? '0'),
      'retry-delay':
        cliFlags['retry-delay'] !== '1000'
          ? cliFlags['retry-delay']
          : (alias?.retryDelay ?? profile?.retryDelay?.toString() ?? '1000'),
    }

    // Handle --save: capture the request as an alias
    if (cliFlags.save) {
      await saveAlias(cliFlags.save, {
        url: rawUrl,
        method: cliFlags.method,
        headers: cliFlags.headers,
        data: cliFlags.data,
        query: cliFlags.query,
        cookie: cliFlags.cookie,
        user: cliFlags.user,
        timeout: cliFlags.timeout,
        retry: cliFlags.retry !== '0' ? cliFlags.retry : undefined,
        retryDelay: cliFlags['retry-delay'] !== '1000' ? cliFlags['retry-delay'] : undefined,
      })
      console.log(`Saved alias "${cliFlags.save}"`)
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
