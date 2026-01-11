/**
 * Replaces {{VAR}} placeholders with environment variable values.
 * Throws an error if a referenced variable is not defined.
 *
 * @example
 * // With API_KEY=sk-12345 in environment
 * interpolate("Bearer {{API_KEY}}") // Returns "Bearer sk-12345"
 */
export function interpolate(input: string): string {
  return input.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    const value = process.env[varName]
    if (value === undefined) {
      throw new Error(`Environment variable "${varName}" is not defined`)
    }
    return value
  })
}

/**
 * Interpolates an array of strings, applying environment variable
 * substitution to each element.
 */
export function interpolateArray(inputs: string[] | undefined): string[] {
  if (!inputs) return []
  return inputs.map(interpolate)
}
