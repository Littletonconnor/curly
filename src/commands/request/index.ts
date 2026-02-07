import { HTTP_ERROR_EXIT_CODE } from '../../core/config/constants'
import {
  buildMethod,
  buildResponse,
  buildUrl,
  curl,
  type FetchOptions,
} from '../../core/http/client'
import { stdout, streamDownload } from '../../lib/output/formatters'
import { type ResponseData } from '../../types'

export async function executeRequest(url: string, options: FetchOptions) {
  const { response, duration } = await curl(url, options)
  const method = buildMethod(options)

  let data: ResponseData
  const shouldStream = options.output && method !== 'HEAD' && !options.json && !options.diff
  if (shouldStream) {
    const { size } = await streamDownload(response, options.output!)
    data = {
      response: null,
      duration,
      headers: response.headers,
      status: response.status,
      size,
    }
  } else {
    data = await buildResponse({ options, response, duration })
  }

  const finalUrl = buildUrl(url, options.query)
  await stdout(data, options, { url: finalUrl, method })

  if (options.fail && data.status >= 400) {
    process.exit(HTTP_ERROR_EXIT_CODE)
  }
}
