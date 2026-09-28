// Empty text and a missing value mean the same to a vote: an Editor that reports '' on mount, or a
// draft read back with a field the API left out, is not a change
const normalize = (_key: string, value: unknown) => {
  if (value === '' || value === null) return undefined
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)))
  }
  return value
}

/** A comparable fingerprint of the form values: equal when nothing that would be saved changed. */
export const formSnapshot = (values: unknown) => JSON.stringify(values, normalize)
