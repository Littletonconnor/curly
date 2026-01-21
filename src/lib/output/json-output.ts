import { STATUS_CODES } from 'node:http'
import type { ResponseData } from '../../types'

export interface JsonOutput {
  request: {
    method: string
    url: string
  }
  response: {
    status: number
    statusText: string
    headers: Record<string, string>
  }
  timing: {
    total: number
  }
  body: unknown
}

export function formatJsonOutput(url: string, method: string, data: ResponseData): JsonOutput {
  const headers: Record<string, string> = {}
  data.headers.forEach((value, key) => {
    headers[key] = value
  })

  return {
    request: {
      method,
      url,
    },
    response: {
      status: data.status,
      statusText: STATUS_CODES[data.status] || 'Unknown',
      headers,
    },
    timing: {
      total: Math.round(data.duration),
    },
    body: data.response,
  }
}
