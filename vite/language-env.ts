// @ts-ignore
import { baseLanguages } from '../src/i18n/languages'

export const resolveLanguagesSlice = (rawValue?: string) => {
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

  const invalidLanguages = languages.filter((lang) => !baseLanguages[lang])

  if (invalidLanguages.length) {
    throw new Error(
      `Invalid LANGUAGES configuration. Received: ${invalidLanguages.join(', ')}. Supported: ${Object.keys(baseLanguages).join(', ')}.`
    )
  }

  return languages.reduce(
    (acc, lang) => {
      acc[lang] = baseLanguages[lang]
      return acc
    },
    {} as Record<string, string>
  )
}

export { baseLanguages }
