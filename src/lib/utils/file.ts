import { promises, readFileSync } from 'fs'
import { inspect } from 'node:util'
import { logger } from './logger'

export function isValidJson(str: unknown) {
  if (typeof str !== 'string') return false

  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

export function readBodyFromFile(filePath: string): string {
  logger().verbose('request', `Reading request body from file: ${filePath}`)
  return readFileSync(filePath, 'utf8')
}

export function getContentTypeFromExtension(filePath: string): string | undefined {
  const ext = filePath.split('.').pop()?.toLowerCase()
  const contentTypes: Record<string, string> = {
    json: 'application/json',
    xml: 'application/xml',
    txt: 'text/plain',
    html: 'text/html',
    csv: 'text/csv',
  }
  return contentTypes[ext ?? '']
}

export async function writeToOutputFile(data: any, outputPath: string) {
  const buffer = inspect(data, { depth: null, maxArrayLength: null, colors: true })

  try {
    await promises.writeFile(outputPath, buffer, 'utf8')
  } catch {
    logger().warn(`Failed to write to output path ${outputPath}`)
  }
}
