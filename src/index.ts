import { cli, printHelpMessage, printDryRun, shouldDryRun } from './lib/cli'
import {
  printHistoryFile,
  writeHistoryFile,
  interpolate,
  loadConfig,
  getProfile,
  resolveUrl,
  saveAlias,
  getAlias,
  deleteAlias,
  listAliases,
  mergeInterpolatedArrays,
} from './lib/utils'
import { executeRequest } from './commands/request'
import { load } from './commands/load-test'
import { handleCompletions } from './commands/completions'
import { setVerbose } from './lib/utils/logger'

export async function main(): Promise<void> {
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

    const alias = cliFlags.use ? await getAlias(cliFlags.use) : null
    if (cliFlags.use && !alias) {
      console.error(`Alias "${cliFlags.use}" not found`)
      console.error('Use --aliases to see available aliases')
      process.exit(1)
    }

    const rawUrl = positionals[positionals.length - 1] || alias?.url
    if (!rawUrl) {
      console.error('No URL provided')
      process.exit(1)
    }

    const resolvedUrl = resolveUrl(rawUrl, profile?.baseUrl)
    const url = interpolate(resolvedUrl)

    const mergedHeaders = mergeInterpolatedArrays(profile?.headers, alias?.headers, cliFlags.headers)
    const mergedData = mergeInterpolatedArrays(alias?.data, cliFlags.data)
    const mergedCookies = mergeInterpolatedArrays(alias?.cookie, cliFlags.cookie)
    const mergedQuery = mergeInterpolatedArrays(alias?.query, cliFlags.query)
    const mergedForm = mergeInterpolatedArrays(alias?.form, cliFlags.form)

    const hasData = (mergedData && mergedData.length > 0) || cliFlags['data-raw']
    const hasForm = mergedForm && mergedForm.length > 0
    if (hasData && hasForm) {
      console.error('Cannot use -d/--data and -F/--form together. Choose one.')
      process.exit(1)
    }

    const options = {
      ...cliFlags,
      method: cliFlags.method || alias?.method,
      headers: mergedHeaders,
      data: mergedData,
      'data-raw': cliFlags['data-raw'] ? interpolate(cliFlags['data-raw']) : undefined,
      cookie: mergedCookies,
      query: mergedQuery,
      form: mergedForm,
      user: cliFlags.user
        ? interpolate(cliFlags.user)
        : alias?.user
          ? interpolate(alias.user)
          : undefined,
      timeout: cliFlags.timeout ?? alias?.timeout ?? profile?.timeout?.toString(),
      retry: cliFlags.retry !== '0' ? cliFlags.retry : (alias?.retry ?? profile?.retry?.toString() ?? '0'),
      'retry-delay':
        cliFlags['retry-delay'] !== '1000'
          ? cliFlags['retry-delay']
          : (alias?.retryDelay ?? profile?.retryDelay?.toString() ?? '1000'),
    }

    if (cliFlags.save) {
      await saveAlias(cliFlags.save, {
        url: rawUrl,
        method: cliFlags.method,
        headers: cliFlags.headers,
        data: cliFlags.data,
        query: cliFlags.query,
        cookie: cliFlags.cookie,
        form: cliFlags.form,
        user: cliFlags.user,
        timeout: cliFlags.timeout,
        retry: cliFlags.retry !== '0' ? cliFlags.retry : undefined,
        retryDelay: cliFlags['retry-delay'] !== '1000' ? cliFlags['retry-delay'] : undefined,
      })
      console.log(`Saved alias "${cliFlags.save}"`)
    }

    if (shouldDryRun(options)) {
      printDryRun(url, options)
      process.exit(0)
    }

    const isLoadTest = options.concurrency || options.requests
    if (isLoadTest) {
      if (options.export && options.export !== 'json' && options.export !== 'csv') {
        console.error(`Invalid export format: "${options.export}"`)
        console.error('Valid formats: json, csv')
        process.exit(1)
      }
      await load(url, {
        ...options,
        profileTui: profile?.tui,
        profileName: cliFlags.profile,
      })
    } else {
      if (options.export) {
        console.error('--export is only available in load test mode (use -n or -c)')
        process.exit(1)
      }
      await executeRequest(url, options)
    }
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}
