export const baseLanguages = {
  ca: 'Català',
  de: 'Deutsch',
  el: 'Ελληνικά',
  en: 'English',
  es: 'Español',
  eu: 'Euskara',
  fr: 'Français',
  it: 'Italiano',
  pt: 'Português',
  'pt-br': 'Português (Brasil)',
} as const

/**
 * Maps internal language codes to BCP 47-style Open Graph locale strings.
 * Used for og:locale and og:locale:alternate meta tags.
 */
export const openGraphLocaleMap: Record<string, string> = {
  ca: 'ca_ES',
  de: 'de_DE',
  el: 'el_GR',
  en: 'en_US',
  es: 'es_ES',
  eu: 'eu_ES',
  fr: 'fr_FR',
  it: 'it_IT',
  pt: 'pt_PT',
  'pt-br': 'pt_BR',
}

export const toOpenGraphLocale = (language: string): string => openGraphLocaleMap[language] ?? language

export default Object.keys(baseLanguages)
