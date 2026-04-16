import { act, renderHook } from '@testing-library/react'
import { usePublicLanguageRouting } from './usePublicLanguageRouting'

const changeLanguage = vi.fn()

vi.mock('~src/app-env', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~src/app-env')>()
  return {
    ...actual,
    getLanguagesEnv: () => ({
      en: 'English',
      es: 'Spanish',
      ca: 'Catalan',
    }),
  }
})

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>()
  return {
    ...actual,
    useTranslation: () => ({
      i18n: {
        language: 'en',
        changeLanguage,
      },
    }),
  }
})

describe('usePublicLanguageRouting', () => {
  beforeEach(() => {
    changeLanguage.mockReset()
    window.localStorage.clear()
    window.history.replaceState({}, '', '/en/plans')
  })

  it('navigates public routes to their canonical localized url and persists the selected language', async () => {
    const navigate = vi.fn()
    const { result } = renderHook(() => usePublicLanguageRouting({ navigate }))

    act(() => {
      result.current.navigateToLanguage('ca')
    })

    expect(navigate).toHaveBeenCalledWith('/ca/plans')
    expect(changeLanguage).not.toHaveBeenCalled()
    expect(window.localStorage.getItem('i18nextLng')).toBe('ca')
  })

  it('keeps auth routes unlocalized and only changes i18n state', async () => {
    window.history.replaceState({}, '', '/account/signin')
    const navigate = vi.fn()
    const { result } = renderHook(() => usePublicLanguageRouting({ navigate }))

    await act(async () => {
      await result.current.navigateToLanguage('es')
    })

    expect(navigate).not.toHaveBeenCalled()
    expect(changeLanguage).toHaveBeenCalledWith('es')
    expect(window.localStorage.getItem('i18nextLng')).toBe('es')
  })
})
