const maskedFields = new Set<string>(['phone'])

// value may be undefined for optional/empty member fields, so guard it before
// returning so the function always resolves to a string.
export const maskIfNeeded = (fieldId: string, value?: string): string => {
  if (!value) return ''
  if (!maskedFields.has(fieldId)) return value
  return '*********'
}
