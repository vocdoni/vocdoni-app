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
 * language when unset or when no valid code is provided.
 *
 * Runs at runtime during globalContext creation, so it is lenient: unsupported
 * codes are logged and dropped rather than thrown, mirroring the SHARED_CENSUS_*
 * handling, so a config typo never takes down SSR for every request.
 */
export const resolveLanguagesSlice = (rawValue?: string): Record<string, string> => {
  if (!rawValue) {
    return { ...baseLanguages }
  }

  const requested = rawValue
    .split(',')
    .map((lang) => lang.trim())
    .filter(Boolean)

  const invalidLanguages = requested.filter((lang) => !baseLanguages[lang as keyof typeof baseLanguages])
  if (invalidLanguages.length) {
    console.warn(
      `Ignoring unsupported LANGUAGES: ${invalidLanguages.join(', ')}. Supported: ${Object.keys(baseLanguages).join(', ')}.`
    )
  }

  const validLanguages = requested.filter((lang) => baseLanguages[lang as keyof typeof baseLanguages])
  if (validLanguages.length === 0) {
    return { ...baseLanguages }
  }

  return validLanguages.reduce(
    (acc, lang) => {
      acc[lang] = baseLanguages[lang as keyof typeof baseLanguages]
      return acc
    },
    {} as Record<string, string>
  )
}

export default Object.keys(baseLanguages)
