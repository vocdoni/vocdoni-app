export const baseLanguages = {
  en: 'English',
  es: 'Español',
  ca: 'Català',
  it: 'Italiano',
  de: 'Deutsch',
} as const

/**
 * Maps internal language codes to BCP 47-style Open Graph locale strings.
 * Used for og:locale and og:locale:alternate meta tags.
 */
export const openGraphLocaleMap: Record<string, string> = {
  en: 'en_US',
  es: 'es_ES',
  ca: 'ca_ES',
  it: 'it_IT',
  de: 'de_DE',
}

export const toOpenGraphLocale = (language: string): string => openGraphLocaleMap[language] ?? language

export default Object.keys(baseLanguages)
