import { useTranslation } from 'react-i18next'

// Resolves the active language for building public localized URLs and locale-aware formatting.
// Falls back to i18next's detected language and finally to 'en' so callers always get a usable value.
export const usePublicLanguage = () => {
  const { i18n } = useTranslation()

  return i18n.resolvedLanguage || i18n.language || 'en'
}
