import { useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { createTestMemoryRouter, render, screen, TestRouterProvider } from '~src/test-utils'
import { Routes } from '~routes'
import LayoutAuth, { type AuthOutletContextType } from './LayoutAuth'

const StubScreen = () => {
  const { setTitle, setSubtitle } = useOutletContext<AuthOutletContextType>()

  useEffect(() => {
    setTitle('Welcome back')
    setSubtitle('Sign in to continue')
  }, [])

  return <button type='button'>Sign in</button>
}

const renderAt = (path: string) => {
  const router = createTestMemoryRouter(
    [{ path: '/account/*', element: <LayoutAuth />, children: [{ path: '*', element: <StubScreen /> }] }],
    { initialEntries: [path] }
  )

  return render(<TestRouterProvider router={router} />)
}

beforeEach(() => {
  window.sessionStorage.clear()
})

describe('LayoutAuth', () => {
  // The vertical chrome must never get in the way of the form the layout exists to host.
  it('renders the outlet screen with the title and subtitle it sets', () => {
    renderAt('/account/signin')

    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
    expect(screen.getByText('Sign in to continue')).toBeInTheDocument()
  })

  it('links home from sign in and back everywhere else', () => {
    renderAt('/account/signin')
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', Routes.vocdoni)

    renderAt('/account/signup')
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', Routes.auth.signIn)
  })

  it('shows the generic trust bar with no vertical', () => {
    renderAt('/account/signin')

    expect(screen.getByText(/Organizations in every sector already trust Vocdoni/)).toBeInTheDocument()
    expect(screen.getAllByRole('img').length).toBeGreaterThan(0)
  })

  it('shows the vertical trust bar for a populated vertical', () => {
    renderAt('/account/signin?type=professional-associations')

    expect(screen.getByText(/Professional associations already trust Vocdoni/)).toBeInTheDocument()
  })

  it('degrades an unknown vertical to the generic trust bar', () => {
    renderAt('/account/signin?type=banana')

    expect(screen.getByText(/Organizations in every sector already trust Vocdoni/)).toBeInTheDocument()
  })
})
