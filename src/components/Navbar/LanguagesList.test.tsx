import { ChakraProvider } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { system } from '~theme/system'

const languagesEnv = { en: 'English', es: 'Spanish' } as unknown as Record<string, string>
const changeLanguage = vi.fn()

vi.mock('~src/app-env', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~src/app-env')>()
  return {
    ...actual,
    useLanguagesEnv: () => languagesEnv,
  }
})

const supportedLanguages = Object.keys(languagesEnv)

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>()
  return {
    ...actual,
    useTranslation: () => ({
      t: (_key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? 'User menu',
      i18n: {
        language: 'en',
        changeLanguage,
      },
    }),
  }
})

describe('LanguagesList', () => {
  beforeEach(() => {
    changeLanguage.mockReset()
    window.localStorage.clear()
    document.cookie = 'vocdoni-public-language=; Max-Age=0; Path=/'
  })

  it('renders the languages menu trigger when multiple languages exist', async () => {
    const { LanguagesMenu } = await import('./LanguagesList')

    render(
      <ChakraProvider value={system}>
        <LanguagesMenu />
      </ChakraProvider>
    )

    expect(screen.getByRole('button', { name: /user menu/i })).toBeInTheDocument()
  })

  it('navigates to the localized public url instead of only changing i18n state', async () => {
    const locationAssign = vi.fn()
    const { navigateToLanguage } = await import('./LanguagesList')

    navigateToLanguage(
      'es',
      { language: 'en', changeLanguage } as any,
      supportedLanguages,
      {
        en: '/organization/0xabc',
        es: '/es/organization/0xabc',
      },
      locationAssign
    )

    expect(locationAssign).toHaveBeenCalledWith('/es/organization/0xabc')
    expect(changeLanguage).not.toHaveBeenCalled()
  })

  it('localizes auth routes when changing language', async () => {
    window.history.replaceState({}, '', '/en/account/signin')
    const locationAssign = vi.fn()
    const { navigateToLanguage } = await import('./LanguagesList')

    navigateToLanguage('es', { language: 'en', changeLanguage } as any, supportedLanguages, undefined, locationAssign)

    expect(locationAssign).toHaveBeenCalledWith('/es/account/signin')
    expect(changeLanguage).not.toHaveBeenCalled()
  })

  it('persists a language cookie when consent was accepted', async () => {
    window.localStorage.setItem('vocdoni-cookie-consent', 'accepted')
    const locationAssign = vi.fn()
    const { navigateToLanguage } = await import('./LanguagesList')

    navigateToLanguage('es', { language: 'en', changeLanguage } as any, supportedLanguages, undefined, locationAssign)

    expect(document.cookie).toContain('vocdoni-public-language=es')
    expect(window.localStorage.getItem('i18nextLng')).toBe('es')
  })
})
