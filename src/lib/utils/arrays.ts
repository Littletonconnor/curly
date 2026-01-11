/**
 * Array utilities for merging and processing arrays
 */

import { interpolate } from './interpolate'

/**
 * Merges multiple optional string arrays into a single array,
 * applying environment variable interpolation to each element.
 *
 * @example
 * mergeInterpolatedArrays(['a', 'b'], undefined, ['c']) // ['a', 'b', 'c']
 */
export function mergeInterpolatedArrays(...sources: (string[] | undefined)[]): string[] {
  const result: string[] = []
  for (const source of sources) {
    if (source) {
      for (const item of source) {
        result.push(interpolate(item))
      }
    }
  }
  return result
}

/**
 * Merges multiple optional arrays into a single array without interpolation.
 */
export function mergeArrays<T>(...sources: (T[] | undefined)[]): T[] {
  const result: T[] = []
  for (const source of sources) {
    if (source) {
      result.push(...source)
    }
  }
  return result
}
