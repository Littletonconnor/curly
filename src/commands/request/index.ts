import { curl, buildResponse, type FetchOptions } from '../../core/http/client'
import { HTTP_ERROR_EXIT_CODE } from '../../core/config/constants'
import { stdout } from '../../lib/output/formatters'

export async function executeRequest(url: string, options: FetchOptions) {
  const response = await curl(url, options)
  const data = await buildResponse(response)
  await stdout(data, options)

  if (options.fail && data.status >= 400) {
    process.exit(HTTP_ERROR_EXIT_CODE)
  }
}
