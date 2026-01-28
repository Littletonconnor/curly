export type DiffEntry = {
  path: string
  type: 'added' | 'removed' | 'changed'
  oldValue?: unknown
  newValue?: unknown
}

export function diff(a: unknown, b: unknown, path = ''): DiffEntry[] {
  if (a === b) return []

  // Both are objects, so compare them
  if (isObject(a) && isObject(b)) {
    const allKeys = new Set([...Object.keys(a), ...Object.keys(b)])
    return [...allKeys].flatMap((key) => {
      const childPath = path ? `${path}.${key}` : key
      if (!(key in a)) return [{ path: childPath, type: 'added', newValue: b[key] }]
      if (!(key in b)) return [{ path: childPath, type: 'removed', oldValue: a[key] }]
      return diff(a[key], b[key], childPath)
    })
  }

  // Both are arrays, so compare by index
  if (Array.isArray(a) && Array.isArray(b)) {
    const maxLength = Math.max(a.length, b.length)
    return Array.from({ length: maxLength }).flatMap((_, i) => {
      const childPath = `${path}[${i}]`
      if (i >= a.length) return [{ path: childPath, type: 'added', newValue: b[i] }]
      if (i >= b.length) return [{ path: childPath, type: 'removed', oldValue: a[i] }]
      return diff(a[i], b[i], childPath)
    })
  }

  // Primitive match
  return [{ path: path || '(root)', type: 'changed', oldValue: a, newValue: b }]
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
