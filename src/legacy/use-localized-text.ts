import { useTranslation } from 'react-i18next'
import type { LocalizedText } from '~src/legacy/vochain-archive'

/** Resolves an archive-era locale map against the active UI language. */
export const useLocalizedText = () => {
  const { i18n } = useTranslation()

  return (value?: LocalizedText) => {
    if (!value) return ''
    const language = i18n.resolvedLanguage ?? i18n.language ?? 'en'

    return value[language] ?? value[language.split('-')[0]] ?? value.default ?? Object.values(value).find(Boolean) ?? ''
  }
}
