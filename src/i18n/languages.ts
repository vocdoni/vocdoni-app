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

/**
 * Resolves the configured `LANGUAGES` env value (a comma-separated list of
 * language codes) into an ordered slice of `baseLanguages`. Returns every base
 * language when unset, and throws on unsupported codes.
 */
export const resolveLanguagesSlice = (rawValue?: string): Record<string, string> => {
  if (!rawValue) {
    return { ...baseLanguages }
  }

  const languages = rawValue
    .split(',')
    .map((lang) => lang.trim())
    .filter(Boolean)

  if (languages.length === 0) {
    return { ...baseLanguages }
  }

  const invalidLanguages = languages.filter((lang) => !baseLanguages[lang as keyof typeof baseLanguages])

  if (invalidLanguages.length) {
    throw new Error(
      `Invalid LANGUAGES configuration. Received: ${invalidLanguages.join(', ')}. Supported: ${Object.keys(baseLanguages).join(', ')}.`
    )
  }

  return languages.reduce(
    (acc, lang) => {
      acc[lang] = baseLanguages[lang as keyof typeof baseLanguages]
      return acc
    },
    {} as Record<string, string>
  )
}

export default Object.keys(baseLanguages)
