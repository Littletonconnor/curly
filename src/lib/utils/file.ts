import { promises } from 'fs'
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

export async function writeToOutputFile(data: any, outputPath: string) {
  const buffer = inspect(data, { depth: null, maxArrayLength: null, colors: true })

  try {
    await promises.writeFile(outputPath, buffer, 'utf8')
  } catch {
    logger().warn(`Failed to write to output path ${outputPath}`)
  }
}
