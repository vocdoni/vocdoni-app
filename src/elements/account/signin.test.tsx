import i18n from 'i18next'
import { afterEach, describe, expect, it, vi } from 'vitest'
import LayoutAuth from '~elements/LayoutAuth'
import { act, createTestMemoryRouter, render, screen, TestRouterProvider } from '~src/test-utils'
import Signin from './signin'

vi.mock('~components/Auth/SignIn', () => ({ default: () => null }))

afterEach(async () => {
  // Still-mounted screens are subscribed to i18next, so the reset re-renders them.
  await act(async () => {
    await i18n.changeLanguage('en')
  })
})

describe('Signin', () => {
  // Picking a language in the auth layout must re-translate the card title, not only the
  // components that read `t` while rendering.
  it('keeps the layout title in the active language', async () => {
    i18n.addResources('en', 'common', { signin_title: 'Welcome' })
    i18n.addResources('es', 'common', { signin_title: 'Bienvenido' })
    const router = createTestMemoryRouter(
      [{ path: '/account', element: <LayoutAuth />, children: [{ path: 'signin', element: <Signin /> }] }],
      { initialEntries: ['/account/signin'] }
    )
    render(<TestRouterProvider router={router} />)
    expect(screen.getByRole('heading', { name: 'Welcome' })).toBeInTheDocument()

    await act(async () => {
      await i18n.changeLanguage('es')
    })

    expect(screen.getByRole('heading', { name: 'Bienvenido' })).toBeInTheDocument()
  })
})
