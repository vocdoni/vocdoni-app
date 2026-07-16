const maskedFields = new Set<string>(['phone'])

export const maskIfNeeded = (fieldId: string, value: string): string => {
  if (!maskedFields.has(fieldId)) return value
  if (!value) return ''
  return '*********'
}
