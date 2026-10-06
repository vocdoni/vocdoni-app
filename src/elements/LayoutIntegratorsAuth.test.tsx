import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createTestMemoryRouter, render, screen, TestRouterProvider } from '~src/test-utils'
import { Routes } from '~routes'
import LayoutIntegratorsAuth from './LayoutIntegratorsAuth'

const renderAt = (path: string) => {
  const router = createTestMemoryRouter(
    [
      {
        path: '/integrators/*',
        element: <LayoutIntegratorsAuth />,
        children: [{ path: '*', element: <button type='button'>Sign in</button> }],
      },
    ],
    { initialEntries: [path] }
  )

  return render(<TestRouterProvider router={router} />)
}

describe('LayoutIntegratorsAuth', () => {
  it('renders the outlet screen', () => {
    renderAt(Routes.integrators.signIn)

    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('offers a language selector', async () => {
    renderAt(Routes.integrators.signIn)

    await userEvent.click(screen.getByRole('button', { name: 'Language' }))

    expect(await screen.findByRole('menuitem', { name: 'Español' })).toBeInTheDocument()
  })
})
