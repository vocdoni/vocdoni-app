/**
 * ucfirst makes the first letter of a string uppercase
 */
export const ucfirst = (str: string, lng?: string | undefined) => str.charAt(0).toLocaleUpperCase(lng) + str.slice(1)

/**
 * normalizeEmail trims and lowercases an email so it is stored and matched case-insensitively.
 *
 * Workaround for the backend treating emails case-sensitively: by normalizing on every UI entry
 * point (CSV import, manual add/edit, CSP login), a client uploading their memberbase through the
 * UI ends up using exclusively lowercased emails for authentication. Uses toLowerCase (not the
 * locale variant) on purpose to avoid the Turkish dotless-i issue.
 */
export const normalizeEmail = (email: string): string => email.trim().toLowerCase()

/**
 * maskValue masks a string value with a specified character, leaving the last n characters visible
 * @param {string} value - The string to be masked
 * @param {boolean} condition - If true, the value will be masked
 * @param {number} visibleDigits - The number of digits to leave visible at the end of the string
 * @param {string} maskChar - The character to use for masking
 * @returns {string} - The masked string
 */
export const maskValue = (value: string, condition: boolean, visibleDigits = 4, maskChar = '*'): string => {
  if (!value) return ''
  if (!condition) return value

  const cleanValue = value.replace(/\s/g, '')
  const masked = maskChar.repeat(Math.max(0, cleanValue.length - visibleDigits))
  const visible = cleanValue.slice(-visibleDigits)

  return masked + visible
}
