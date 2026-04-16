import { ChakraProvider } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { system } from '~theme/system'

const languagesEnv = { en: 'English', es: 'Spanish' } as unknown as Record<string, string>
const changeLanguage = vi.fn()

vi.mock('~src/app-env', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~src/app-env')>()
  return {
    ...actual,
    getLanguagesEnv: () => languagesEnv,
  }
})

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
      {
        en: '/organization/0xabc',
        es: '/es/organization/0xabc',
      },
      locationAssign
    )

    expect(locationAssign).toHaveBeenCalledWith('/es/organization/0xabc')
    expect(changeLanguage).not.toHaveBeenCalled()
  })

  it('keeps auth routes unprefixed when changing language', async () => {
    window.history.replaceState({}, '', '/account/signin')
    const locationAssign = vi.fn()
    const { navigateToLanguage } = await import('./LanguagesList')

    navigateToLanguage('es', { language: 'en', changeLanguage } as any, undefined, locationAssign)

    expect(locationAssign).not.toHaveBeenCalled()
    expect(changeLanguage).toHaveBeenCalledWith('es')
  })
})
