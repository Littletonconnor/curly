import { curl, buildResponse, type FetchOptions } from '../../core/http/client'
import { stdout } from '../../lib/output/formatters'

export async function executeRequest(url: string, options: FetchOptions) {
  const response = await curl(url, options)
  const data = await buildResponse(response)
  await stdout(data, options)
}
