import { promises } from 'fs'
import { inspect } from 'node:util'
import { logger } from './logger'

export function isValidJson(str: unknown) {
  if (typeof str !== 'string') return false

  try {
    JSON.parse(str)
    return true
  } catch (_: unknown) {
    return false
  }
}

export async function writeToOutputFile(data: any, outputPath: string) {
  logger().debug(`Writing response to output file`)

  const buffer = inspect(data, { depth: null, maxArrayLength: null, colors: true })

  try {
    logger().debug(`Writing response to ${outputPath}`)
    await promises.writeFile(outputPath, buffer, 'utf8')
  } catch (e: unknown) {
    logger().warn(`Failed to write to output path ${outputPath}`)
  }
}