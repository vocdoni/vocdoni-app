import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '~src/test-utils'
import { ChangePasswordButton } from './Password'

const session = { token: 'fresh-token', expirity: '2030-01-01T00:00:00Z' }
const bearedFetchMock = vi.fn()
const setSessionMock = vi.fn()

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({
    bearedFetch: bearedFetchMock,
    setSession: setSessionMock,
    bearer: 'token',
  }),
}))

describe('ChangePasswordButton', () => {
  beforeEach(() => {
    bearedFetchMock.mockReset().mockResolvedValue(session)
    setSessionMock.mockReset()
  })

  it('keeps the user signed in with the token the password change returns', async () => {
    const user = userEvent.setup()
    render(<ChangePasswordButton />)

    await user.click(screen.getByRole('button', { name: /change password/i }))
    await user.type(await screen.findByLabelText(/current password/i), 'old-password')
    await user.type(screen.getByLabelText(/new password/i), 'new-password')
    await user.click(screen.getByRole('button', { name: /save password/i }))

    await waitFor(() => expect(setSessionMock).toHaveBeenCalledWith(session))
    expect(bearedFetchMock).toHaveBeenCalledWith('users/password', {
      method: 'PUT',
      body: { oldPassword: 'old-password', newPassword: 'new-password' },
    })
  })

  it('keeps the current session when the backend returns no token', async () => {
    bearedFetchMock.mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<ChangePasswordButton />)

    await user.click(screen.getByRole('button', { name: /change password/i }))
    await user.type(await screen.findByLabelText(/current password/i), 'old-password')
    await user.type(screen.getByLabelText(/new password/i), 'new-password')
    await user.click(screen.getByRole('button', { name: /save password/i }))

    await waitFor(() => expect(bearedFetchMock).toHaveBeenCalledTimes(1))
    expect(setSessionMock).not.toHaveBeenCalled()
  })
})
