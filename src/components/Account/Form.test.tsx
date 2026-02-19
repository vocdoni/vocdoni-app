import userEvent from '@testing-library/user-event'
import { ApiError } from '~components/Auth/api'
import { render, screen, waitFor } from '~src/test-utils'
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
  it('shows unlink action for linked providers', () => {
    render(<AccountForm profile={baseProfile} />)

    expect(screen.getByRole('button', { name: /unlink google/i })).toBeInTheDocument()
  })

  it('shows link action for unlinked providers', () => {
    render(<AccountForm profile={{ ...baseProfile, providers: [] }} />)

    expect(screen.getByRole('button', { name: /link google account/i })).toBeInTheDocument()
  })

  it('does not unlink when confirmation is canceled', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    const user = userEvent.setup()

    render(<AccountForm profile={baseProfile} />)

    await user.click(screen.getByRole('button', { name: /unlink google/i }))

    expect(bearedFetchMock).not.toHaveBeenCalled()
    confirmSpy.mockRestore()
  })

  it('shows api error message when unlink fails', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const user = userEvent.setup()
    bearedFetchMock.mockRejectedValueOnce(new ApiError({ error: 'Provider unlink failed' }))

    render(<AccountForm profile={baseProfile} />)

    await user.click(screen.getByRole('button', { name: /unlink google/i }))

    await waitFor(() =>
      expect(toastSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Failed to unlink provider',
          description: 'Provider unlink failed',
        })
      )
    )

    confirmSpy.mockRestore()
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

  it('shows password request button when no password is set', () => {
    render(<AccountForm profile={{ ...baseProfile, hasPassword: false }} />)

    expect(screen.getByRole('button', { name: /request password change/i })).toBeInTheDocument()
    expect(screen.queryByLabelText(/change password/i)).toBeNull()
  })
})
