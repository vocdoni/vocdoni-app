import { useTranslation } from 'react-i18next'
import { getSupportedPublicLanguages, localizePublicPath, persistPublicLanguage } from './public-language'

const defaultNavigate = (url: string) => window.location.assign(url)

export const navigateToPublicLanguage = async ({
  language,
  currentPathname,
  publicLanguageLinks,
  navigate = defaultNavigate,
  changeLanguage,
}: {
  language: string
  currentPathname?: string
  publicLanguageLinks?: Record<string, string>
  navigate?: (url: string) => void
  changeLanguage: (language: string) => Promise<unknown>
}) => {
  const supportedLanguages = getSupportedPublicLanguages()

  persistPublicLanguage(language, {
    supportedLanguages,
    storage: typeof window === 'undefined' ? undefined : window.localStorage,
  })

  const targetUrl = publicLanguageLinks?.[language]

  if (targetUrl && typeof window !== 'undefined') {
    navigate(targetUrl)
    return
  }

  const pathname = currentPathname ?? (typeof window === 'undefined' ? undefined : window.location.pathname)

  if (pathname) {
    navigate(
      localizePublicPath({
        pathname,
        language,
        supportedLanguages,
      })
    )
  } else {
    await changeLanguage(language)
  }
}

export const usePublicLanguageRouting = ({
  publicLanguageLinks,
  navigate,
}: {
  publicLanguageLinks?: Record<string, string>
  navigate?: (url: string) => void
} = {}) => {
  const { i18n } = useTranslation()

  return {
    currentLanguage: i18n.language,
    navigateToLanguage: (language: string) =>
      navigateToPublicLanguage({
        language,
        publicLanguageLinks,
        navigate,
        changeLanguage: i18n.changeLanguage.bind(i18n),
      }),
  }
}
