import i18n from 'i18next'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import LayoutIntegratorsAuth from '~elements/LayoutIntegratorsAuth'
import type { AuthOutletContextType } from '~elements/LayoutAuth'
import { act, createTestMemoryRouter, render, screen, TestRouterProvider } from '~src/test-utils'
import IntegratorsSignin from './signin'

// Stands in for the shared sign-in form, which sets the generic title whenever `t` changes.
vi.mock('~components/Auth/SignIn', () => ({
  default: () => {
    const { t } = useTranslation()
    const { setTitle } = useOutletContext<AuthOutletContextType>()
    useEffect(() => {
      setTitle(t('signin_title'))
    }, [setTitle, t])
    return null
  },
}))

afterEach(async () => {
  // Still-mounted screens are subscribed to i18next, so the reset re-renders them.
  await act(async () => {
    await i18n.changeLanguage('en')
  })
})

describe('IntegratorsSignin', () => {
  // The shared form re-translates its generic title on a language change; the integrator
  // title must be re-applied after it rather than lose to it.
  it('keeps the integrator title after a language change', async () => {
    i18n.addResources('en', 'common', { signin_title: 'Welcome', 'integrators.signin_title': 'Integrator sign in' })
    i18n.addResources('es', 'common', { signin_title: 'Bienvenido', 'integrators.signin_title': 'Acceso integradores' })
    const router = createTestMemoryRouter(
      [
        {
          path: '/integrators',
          element: <LayoutIntegratorsAuth />,
          children: [{ path: 'signin', element: <IntegratorsSignin /> }],
        },
      ],
      { initialEntries: ['/integrators/signin'] }
    )
    render(<TestRouterProvider router={router} />)
    expect(screen.getByRole('heading', { name: 'Integrator sign in' })).toBeInTheDocument()

    await act(async () => {
      await i18n.changeLanguage('es')
    })

    expect(screen.getByRole('heading', { name: 'Acceso integradores' })).toBeInTheDocument()
  })
})
