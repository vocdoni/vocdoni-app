import userEvent from '@testing-library/user-event'
import { ApiError } from '~components/Auth/api'
import { render, screen, waitFor, within } from '~src/test-utils'
import AccountForm from './Form'

const toastSpy = vi.fn()

vi.mock('~components/Toast', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~components/Toast')>()
  return {
    ...actual,
    useToast: () => toastSpy,
  }
})

vi.mock('~src/queries/account', () => ({
  useUpdateProfile: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}))

const bearedFetchMock = vi.fn().mockResolvedValue(undefined)
const linkSaasOAuthMock = vi.fn().mockResolvedValue(undefined)

const navigateMock = vi.fn()

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({
    bearedFetch: bearedFetchMock,
    bearer: 'token',
  }),
}))

vi.mock('@vocdoni/rainbowkit-wallets', () => ({
  linkSaasOAuth: (...args: unknown[]) => linkSaasOAuthMock(...args),
}))

const baseProfile = {
  id: 'user-1',
  email: 'ada@example.com',
  firstName: 'Ada',
  lastName: 'Lovelace',
  organizations: [],
  providers: ['google'],
  hasPassword: true,
}

describe('AccountForm', () => {
  beforeEach(() => {
    bearedFetchMock.mockClear()
    navigateMock.mockClear()
    toastSpy.mockClear()
  })

  it('shows unlink action for linked providers', () => {
    render(<AccountForm profile={baseProfile} />)

    expect(screen.getByRole('button', { name: /unlink google/i })).toBeInTheDocument()
  })

  it('shows link action for unlinked providers', () => {
    render(<AccountForm profile={{ ...baseProfile, providers: [] }} />)

    expect(screen.getByRole('button', { name: /link google account/i })).toBeInTheDocument()
  })

  it('does not unlink when confirmation is canceled', async () => {
    const user = userEvent.setup()

    render(<AccountForm profile={baseProfile} />)

    await user.click(screen.getByRole('button', { name: /unlink google/i }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /cancel/i }))

    expect(bearedFetchMock).not.toHaveBeenCalled()
  })

  it('shows api error message when unlink fails', async () => {
    const user = userEvent.setup()
    bearedFetchMock.mockRejectedValueOnce(new ApiError({ error: 'Provider unlink failed' }))

    render(<AccountForm profile={baseProfile} />)

    await user.click(screen.getByRole('button', { name: /unlink google/i }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /unlink google/i }))

    await waitFor(() =>
      expect(toastSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Failed to unlink provider',
          description: 'Provider unlink failed',
        })
      )
    )
  })

  it('links provider without triggering session changes', async () => {
    const user = userEvent.setup()

    render(<AccountForm profile={{ ...baseProfile, providers: [] }} />)

    await user.click(screen.getByRole('button', { name: /link google account/i }))

    expect(linkSaasOAuthMock).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'google',
        authToken: 'token',
      })
    )
  })

  it('requests a password setup code and opens the setup page when no password is set', async () => {
    const user = userEvent.setup()
    render(<AccountForm profile={{ ...baseProfile, hasPassword: false }} />)

    expect(screen.queryByLabelText(/change password/i)).toBeNull()
    await user.click(screen.getByRole('button', { name: /set a password/i }))

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/account/password/setup'))
    expect(bearedFetchMock).toHaveBeenCalledWith('users/me/password/setup', { method: 'POST' })
    expect(toastSpy).toHaveBeenCalledWith(expect.objectContaining({ title: 'We sent you an email with a code' }))
  })

  it('asks to retry later when a setup code was sent recently', async () => {
    bearedFetchMock.mockRejectedValueOnce(
      new ApiError({ error: 'a password setup code was sent recently, retry later', code: 40017 })
    )
    const user = userEvent.setup()
    render(<AccountForm profile={{ ...baseProfile, hasPassword: false }} />)

    await user.click(screen.getByRole('button', { name: /set a password/i }))

    await waitFor(() =>
      expect(toastSpy).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'A code was sent recently, check your email or try again in a minute' })
      )
    )
    expect(navigateMock).toHaveBeenCalledWith('/account/password/setup')
  })
})
