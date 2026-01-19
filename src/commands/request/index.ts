import { curl, buildResponse, buildMethod, type FetchOptions } from '../../core/http/client'
import { HTTP_ERROR_EXIT_CODE } from '../../core/config/constants'
import { stdout } from '../../lib/output/formatters'
import { type ResponseData } from '../../types'

export async function executeRequest(url: string, options: FetchOptions) {
  const { response, duration } = await curl(url, options)
  const method = buildMethod(options)

  // HEAD requests have no body - skip body parsing
  const data: ResponseData =
    method === 'HEAD'
      ? { response: null, duration, headers: response.headers, status: response.status, size: '0 B' }
      : await buildResponse({ response, duration })

  await stdout(data, options)

  if (options.fail && data.status >= 400) {
    process.exit(HTTP_ERROR_EXIT_CODE)
  }
}
