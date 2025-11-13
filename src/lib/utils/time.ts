export function toSeconds(t: number, fixed: number = 4) {
  return ((t || 0) / 1000).toFixed(fixed)
}
