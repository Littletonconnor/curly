/**
 * Parsing utilities for CLI options
 */

/**
 * Parses a string option to an integer with a default fallback.
 * Returns the default if the value is undefined or not a valid number.
 */
export function parseIntOption(value: string | undefined, defaultValue: number): number {
  if (value === undefined) {
    return defaultValue
  }
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}

/**
 * Formats bytes into human-readable string (B, KB, MB, GB)
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`
  } else if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  } else {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }
}

/**
 * Formats duration in seconds with fixed decimal places
 */
export function formatDuration(seconds: number, decimals: number = 4): string {
  return seconds.toFixed(decimals)
}
