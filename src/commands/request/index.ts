import { curl, buildResponse, buildMethod, buildUrl, type FetchOptions } from '../../core/http/client'
import { HTTP_ERROR_EXIT_CODE } from '../../core/config/constants'
import { stdout, writeToCookieJar } from '../../lib/output/formatters'
import { shouldOutputJson, printJsonOutput } from '../../lib/output/json-output'
import { type ResponseData } from '../../types'

export async function executeRequest(url: string, options: FetchOptions) {
  const { response, duration } = await curl(url, options)
  const method = buildMethod(options)

  const data: ResponseData =
    method === 'HEAD'
      ? { response: null, duration, headers: response.headers, status: response.status, size: '0 B' }
      : await buildResponse({ response, duration })

  if (shouldOutputJson(options)) {
    if (options['cookie-jar']) {
      await writeToCookieJar(data, options)
    }
    const finalUrl = buildUrl(url, options.query)
    printJsonOutput(finalUrl, method, data)
  } else {
    await stdout(data, options)
  }

  if (options.fail && data.status >= 400) {
    process.exit(HTTP_ERROR_EXIT_CODE)
  }
}
