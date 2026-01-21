import { buildUrl, buildMethod, buildHeaders, buildBody } from '../../core/http/client'
import type { FetchOptions } from '../../types'

export function shouldDryRun(options: FetchOptions): boolean {
  return options['dry-run'] === true
}

export function printDryRun(url: string, options: FetchOptions): void {
  const method = buildMethod(options)
  const finalUrl = buildUrl(url, options.query)
  const headers = buildHeaders(options)
  const body = buildBody(options)

  console.log('DRY RUN - Request not sent')
  console.log('')
  console.log(`Method:  ${method}`)
  console.log(`URL:     ${finalUrl}`)

  const headerEntries = Object.entries(headers)
  if (headerEntries.length > 0) {
    console.log('Headers:')
    for (const [key, value] of headerEntries) {
      console.log(`  ${key}: ${value}`)
    }
  }

  if (body) {
    console.log('Body:')
    console.log(`  ${body}`)
  }
}
