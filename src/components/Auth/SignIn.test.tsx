import userEvent from '@testing-library/user-event'
import i18n from 'i18next'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { UnverifiedApiError } from '~components/Auth/api'
import LayoutAuth, { type AuthOutletContextType } from '~elements/LayoutAuth'
import { act, createTestMemoryRouter, render, screen, TestRouterProvider } from '~src/test-utils'
import SignIn from './SignIn'

const loginMock = vi.fn()

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({ login: { mutateAsync: loginMock, reset: vi.fn() } }),
}))

vi.mock('~components/AnalyticsProvider', () => ({
  useAnalytics: () => ({ trackEvent: vi.fn() }),
}))

vi.mock('./GoogleAuth', () => ({ default: () => null }))

// The verification code status check: a still-valid code goes straight to the verification step.
vi.mock('~components/Auth/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~components/Auth/api')>()
  return { ...actual, api: vi.fn().mockResolvedValue({ valid: true }) }
})

// Stands in for the verification step, which owns the layout title while it is shown.
vi.mock('~components/Auth/Verify', () => ({
  VerificationPending: () => {
    const { t } = useTranslation()
    const { setTitle } = useOutletContext<AuthOutletContextType>()
    useEffect(() => {
      setTitle(t('verify.account_created_succesfully'))
    }, [setTitle, t])
    return null
  },
}))

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
  i18n.addResources('en', 'common', { signin_title: 'Welcome', 'verify.account_created_succesfully': 'Created!' })
  i18n.addResources('es', 'common', { signin_title: 'Bienvenido', 'verify.account_created_succesfully': '¡Creada!' })
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

  it('leaves the verification step its title across a language switch', async () => {
    loginMock.mockRejectedValue(new UnverifiedApiError())
    const { container } = renderSignIn()

    await userEvent.type(container.querySelector('input[name="email"]')!, 'user@example.com')
    await userEvent.type(container.querySelector('input[name="password"]')!, 'secret')
    await userEvent.click(container.querySelector('button[type="submit"]')!)
    expect(await screen.findByRole('heading', { name: 'Created!' })).toBeInTheDocument()

    await switchLanguage('es')

    expect(screen.getByRole('heading', { name: '¡Creada!' })).toBeInTheDocument()
  })
})
