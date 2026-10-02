import i18n from 'i18next'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import LayoutAuth from '~elements/LayoutAuth'
import { act, createTestMemoryRouter, render, screen, TestRouterProvider } from '~src/test-utils'
import SignIn from './SignIn'

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({ login: { mutateAsync: vi.fn(), reset: vi.fn() } }),
}))

vi.mock('~components/AnalyticsProvider', () => ({
  useAnalytics: () => ({ trackEvent: vi.fn() }),
}))

vi.mock('./GoogleAuth', () => ({ default: () => null }))

const renderSignIn = () => {
  const router = createTestMemoryRouter(
    [{ path: '/account', element: <LayoutAuth />, children: [{ path: 'signin', element: <SignIn /> }] }],
    { initialEntries: ['/account/signin'] }
  )
  return render(<TestRouterProvider router={router} />)
}

const switchLanguage = (language: string) =>
  act(async () => {
    await i18n.changeLanguage(language)
  })

beforeEach(() => {
  i18n.addResources('en', 'common', { signin_title: 'Welcome' })
  i18n.addResources('es', 'common', { signin_title: 'Bienvenido' })
})

afterEach(async () => {
  // Still-mounted screens are subscribed to i18next, so the reset re-renders them.
  await switchLanguage('en')
})

describe('SignIn', () => {
  it('keeps the layout title in the active language', async () => {
    renderSignIn()
    expect(screen.getByRole('heading', { name: 'Welcome' })).toBeInTheDocument()

    await switchLanguage('es')

    expect(screen.getByRole('heading', { name: 'Bienvenido' })).toBeInTheDocument()
  })
})
