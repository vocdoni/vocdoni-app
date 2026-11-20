import userEvent from '@testing-library/user-event'
import { ApiError } from '~components/Auth/api'
import { createTestQueryClient, render, screen, waitFor } from '~src/test-utils'
import PasswordSetupForm from './PasswordSetupForm'

const session = { token: 'fresh-token', expirity: '2030-01-01T00:00:00Z' }
const bearedFetchMock = vi.fn()
const setSessionMock = vi.fn()
const navigateMock = vi.fn()
const toastSpy = vi.fn()

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({
    bearedFetch: bearedFetchMock,
    setSession: setSessionMock,
    bearer: 'token',
  }),
}))

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

vi.mock('~components/Toast', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~components/Toast')>()
  return {
    ...actual,
    useToast: () => toastSpy,
  }
})

const fillPasswords = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText(/new password/i), 'new-password')
  await user.type(screen.getByLabelText(/confirm password/i), 'new-password')
  await user.click(screen.getByRole('button', { name: /set password/i }))
}

describe('PasswordSetupForm', () => {
  beforeEach(() => {
    bearedFetchMock.mockReset().mockResolvedValue(session)
    setSessionMock.mockReset()
    navigateMock.mockReset()
    toastSpy.mockReset()
  })

  it('sets the password with the code from the link, keeps the session and marks the profile stale', async () => {
    const user = userEvent.setup()
    const queryClient = createTestQueryClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    render(<PasswordSetupForm code='abc123' />, { queryClient })

    expect(screen.getByLabelText(/verification code/i)).toHaveValue('abc123')
    await fillPasswords(user)

    await waitFor(() => expect(setSessionMock).toHaveBeenCalledWith(session))
    expect(bearedFetchMock).toHaveBeenCalledWith('users/me/password/setup/verify', {
      method: 'POST',
      body: { code: 'abc123', newPassword: 'new-password' },
    })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['profile'], refetchType: 'none' })
    expect(navigateMock).toHaveBeenCalledWith('/admin/profile')
  })

  it('accepts a typed code when the link carried none', async () => {
    const user = userEvent.setup()
    render(<PasswordSetupForm />)

    await user.type(screen.getByLabelText(/verification code/i), 'def456')
    await fillPasswords(user)

    await waitFor(() =>
      expect(bearedFetchMock).toHaveBeenCalledWith('users/me/password/setup/verify', {
        method: 'POST',
        body: { code: 'def456', newPassword: 'new-password' },
      })
    )
  })

  it('lets the user replace a stale code from the link', async () => {
    const user = userEvent.setup()
    render(<PasswordSetupForm code='stale' />)

    const codeInput = screen.getByLabelText(/verification code/i)
    await user.clear(codeInput)
    await user.type(codeInput, 'fresh1')
    await fillPasswords(user)

    await waitFor(() =>
      expect(bearedFetchMock).toHaveBeenCalledWith('users/me/password/setup/verify', {
        method: 'POST',
        body: { code: 'fresh1', newPassword: 'new-password' },
      })
    )
  })

  it('sends the user to the profile when the account already has a password', async () => {
    bearedFetchMock.mockRejectedValue(new ApiError({ error: 'user already has a password', code: 40045 }))
    const user = userEvent.setup()
    render(<PasswordSetupForm code='abc123' />)

    await fillPasswords(user)

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/admin/profile'))
    expect(setSessionMock).not.toHaveBeenCalled()
    expect(toastSpy).toHaveBeenCalledWith(expect.objectContaining({ title: 'Your account already has a password' }))
  })

  it('shows the api error and stays on the page when the code is wrong', async () => {
    bearedFetchMock.mockRejectedValue(new ApiError({ error: 'code mismatch', code: 40001 }))
    const user = userEvent.setup()
    render(<PasswordSetupForm code='abc123' />)

    await fillPasswords(user)

    await waitFor(() =>
      expect(toastSpy).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Failed to set the password', description: 'code mismatch' })
      )
    )
    expect(navigateMock).not.toHaveBeenCalled()
    expect(setSessionMock).not.toHaveBeenCalled()
  })
})
