/** A value stored per language code, with an optional `default` entry. */
export type LocalizedTextMap = Record<string, string | undefined>

/**
 * Resolves a locale map against a page language: exact language -> base
 * language -> `default` -> first non-empty entry.
 *
 * Values come back verbatim (only trimmed), for text that must survive as-is —
 * an organization logo URL, say. Text rendered as prose is sanitized on top of
 * this by the SSR meta builders.
 */
export const getLocalizedRawText = (value: LocalizedTextMap | undefined, language: string): string => {
  if (!value) return ''

  const candidates = [value[language], value[language.split('-')[0]], value.default, ...Object.values(value)]

  return candidates.map((entry) => entry?.trim()).find(Boolean) ?? ''
}
