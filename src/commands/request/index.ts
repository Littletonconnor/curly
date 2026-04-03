import { HTTP_ERROR_EXIT_CODE } from '../../core/config/constants'
import {
  buildMethod,
  buildResponse,
  buildUrl,
  curl,
  type FetchOptions,
} from '../../core/http/client'
import { stdout, streamDownload } from '../../lib/output/formatters'
import { getHttpStatusHint } from '../../lib/utils/errors'
import { type ResponseData } from '../../types'

export async function executeRequest(url: string, options: FetchOptions) {
  const { response, duration, urlEffective, numRedirects, redirectUrl } = await curl(url, options)
  const method = buildMethod(options)

  let data: ResponseData
  const shouldStream = options.output && method !== 'HEAD' && !options.json
  if (shouldStream) {
    const { size } = await streamDownload(response, options.output!)
    data = {
      response: null,
      duration,
      headers: response.headers,
      status: response.status,
      size,
      urlEffective,
      numRedirects,
      redirectUrl,
    }
  } else {
    data = await buildResponse({
      options,
      response,
      duration,
      urlEffective,
      numRedirects,
      redirectUrl,
    })
  }

  const finalUrl = buildUrl(url, options.query)
  await stdout(data, options, { url: finalUrl, method })

  // Hint: suggest --follow when a redirect is returned without following
  if (!options.follow && data.status >= 300 && data.status < 400 && redirectUrl) {
    console.error(
      `HTTP ${data.status} — redirected to ${redirectUrl}\n  Hint: Use -L or --follow to automatically follow redirects.`,
    )
  }

  if (options.fail && data.status >= 400) {
    const hint = getHttpStatusHint(data.status)
    if (hint) {
      console.error(`HTTP ${data.status} error\n  Hint: ${hint}`)
    }
    process.exit(HTTP_ERROR_EXIT_CODE)
  }
}
