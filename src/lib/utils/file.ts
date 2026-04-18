import { readFileSync } from 'fs'
import { basename } from 'path'
import { getErrorMessage, isNodeError } from '../../types'
import { logger } from './logger'

/**
 * Represents a parsed form field from -F flag
 */
export interface FormField {
  name: string
  value: string
  isFile: boolean
  filename?: string
}

/**
 * Parses a form field string like "file=@photo.jpg" or "name=vacation"
 * - `@` prefix indicates a file upload
 * - Without `@`, it's a plain text field
 */
export function parseFormField(field: string): FormField {
  const eqIndex = field.indexOf('=')
  if (eqIndex === -1) {
    logger().error(`Invalid form field format: "${field}". Expected name=value or name=@file`)
    throw new Error(`Invalid form field: ${field}`)
  }

  const name = field.slice(0, eqIndex)
  const rawValue = field.slice(eqIndex + 1)

  if (rawValue.startsWith('@')) {
    const filePath = rawValue.slice(1)
    return {
      name,
      value: filePath,
      isFile: true,
      filename: basename(filePath),
    }
  }

  return {
    name,
    value: rawValue,
    isFile: false,
  }
}

/**
 * Checks if a value is a valid JSON string.
 */
export function isValidJson(str: unknown): boolean {
  if (typeof str !== 'string') return false

  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

/**
 * Exits with a friendly message for common filesystem errors.
 * ENOENT → "File not found", EACCES → "Permission denied", other → generic.
 */
function exitOnFileError(filePath: string, error: unknown): never {
  if (isNodeError(error) && error.code === 'ENOENT') {
    return logger().error(`File not found: "${filePath}"`)
  }
  if (isNodeError(error) && error.code === 'EACCES') {
    return logger().error(`Permission denied reading file: "${filePath}"`)
  }
  return logger().error(`Failed to read file "${filePath}": ${getErrorMessage(error)}`)
}

/**
 * Reads file contents to be used as a request body.
 * Exits with a friendly error if the file is missing or unreadable.
 */
export function readBodyFromFile(filePath: string): string {
  logger().verbose('request', `Reading request body from file: ${filePath}`)
  try {
    return readFileSync(filePath, 'utf8')
  } catch (error: unknown) {
    return exitOnFileError(filePath, error)
  }
}

/**
 * Reads file contents as a binary Buffer (e.g., for multipart uploads).
 * Exits with a friendly error if the file is missing or unreadable.
 */
export function readFileAsBuffer(filePath: string): Buffer {
  try {
    return readFileSync(filePath)
  } catch (error: unknown) {
    return exitOnFileError(filePath, error)
  }
}

/**
 * Returns the MIME type for a file based on its extension.
 * Returns undefined for unknown extensions.
 */
export function getContentTypeFromExtension(filePath: string): string | undefined {
  const ext = filePath.split('.').pop()?.toLowerCase()
  const contentTypes: Record<string, string> = {
    json: 'application/json',
    xml: 'application/xml',
    txt: 'text/plain',
    html: 'text/html',
    csv: 'text/csv',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    ico: 'image/x-icon',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    zip: 'application/zip',
    gz: 'application/gzip',
    tar: 'application/x-tar',
    mp3: 'audio/mpeg',
    mp4: 'video/mp4',
    webm: 'video/webm',
    js: 'application/javascript',
    css: 'text/css',
    wasm: 'application/wasm',
  }
  return contentTypes[ext ?? '']
}
