/**
 * ucfirst makes the first letter of a string uppercase
 */
export const ucfirst = (str: string, lng?: string | undefined) => str.charAt(0).toLocaleUpperCase(lng) + str.slice(1)

/**
 * parseProcessIds turns a comma-separated list of process ids into a trimmed, non-empty array
 */
export const parseProcessIds = (value: string | undefined) =>
  (value || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)

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
