import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '~src/test-utils'
import { Step0Base } from './Step0'

const csp = vi.hoisted(() => ({
  authFields: [] as string[],
  twoFaFields: [] as string[],
  setCurrentStep: vi.fn(),
  setAuthData: vi.fn(),
  mutateAsync: vi.fn(),
  toast: vi.fn(),
  pending: false,
}))

vi.mock('./CSPStepsProvider', () => ({
  useCspAuthContext: () => ({
    setCurrentStep: csp.setCurrentStep,
    setAuthData: csp.setAuthData,
    authFields: csp.authFields,
    twoFaFields: csp.twoFaFields,
  }),
}))

vi.mock('./basics', () => ({
  useCspAuth0: () => ({
    mutateAsync: csp.mutateAsync,
    isPending: false,
    isError: false,
  }),
  useCspAuthPending: () => csp.pending,
  useIsCspAuthBusy: () => () => csp.pending,
}))

vi.mock('~components/Toast', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~components/Toast')>()),
  useToast: () => csp.toast,
}))

const renderStep0 = ({ authFields = [], twoFaFields = [] }: { authFields?: string[]; twoFaFields?: string[] }) => {
  csp.authFields = authFields
  csp.twoFaFields = twoFaFields
  return render(<Step0Base />)
}

// The form fields have no accessible name tying them to their label, so address them by
// the name react-hook-form registers them under.
const field = (name: string) => document.querySelector<HTMLInputElement>(`input[name="${name}"]`)!

describe('Step0Base', () => {
  beforeEach(() => {
    csp.setCurrentStep.mockReset()
    csp.setAuthData.mockReset()
    csp.mutateAsync.mockReset().mockResolvedValue(undefined)
    csp.toast.mockReset()
    csp.pending = false
  })

  it('sends the trimmed credentials and moves on to the code step when 2FA is required', async () => {
    const user = userEvent.setup()
    renderStep0({ authFields: ['memberNumber'], twoFaFields: ['email'] })

    await user.type(field('memberNumber'), '  00123 ')
    await user.type(field('contact'), ' voter@example.com ')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Receive Code' }))

    await waitFor(() => expect(csp.setCurrentStep).toHaveBeenCalledWith(1))
    expect(csp.mutateAsync).toHaveBeenCalledWith({ memberNumber: '00123', email: 'voter@example.com' })
    // Step 1 resends the challenge to this contact.
    expect(csp.setAuthData.mock.calls[0][0]({})).toEqual({ email: 'voter@example.com' })
  })

  it.each([
    ['an email address', 'voter@example.com', { email: 'voter@example.com' }],
    ['a phone number', '+34600000000', { phone: '+34600000000' }],
  ])('routes %s to the matching 2FA method when both are offered', async (_, contact, expected) => {
    const user = userEvent.setup()
    renderStep0({ twoFaFields: ['email', 'phone'] })

    await user.type(field('contact'), contact)
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Receive Code' }))

    await waitFor(() => expect(csp.mutateAsync).toHaveBeenCalledWith(expected))
  })

  it('authenticates in place when the census has no 2FA', async () => {
    const user = userEvent.setup()
    renderStep0({ authFields: ['nationalId'] })

    await user.type(field('nationalId'), '12345678Z')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Authenticate' }))

    await waitFor(() =>
      expect(csp.toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Authentication successful', type: 'success' })
      )
    )
    expect(csp.mutateAsync).toHaveBeenCalledWith({ nationalId: '12345678Z' })
    expect(csp.setCurrentStep).not.toHaveBeenCalled()
  })

  it('reports a rejected authentication and stays on this step', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    csp.mutateAsync.mockRejectedValue(new Error('Voter not found in census'))
    const user = userEvent.setup()
    renderStep0({ authFields: ['memberNumber'], twoFaFields: ['email'] })

    await user.type(field('memberNumber'), '999')
    await user.type(field('contact'), 'voter@example.com')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Receive Code' }))

    await waitFor(() =>
      expect(csp.toast).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error', description: 'Voter not found in census' })
      )
    )
    expect(csp.setCurrentStep).not.toHaveBeenCalled()
    expect(csp.setAuthData).not.toHaveBeenCalled()
  })

  it('does not submit while a required credential is empty', async () => {
    const user = userEvent.setup()
    renderStep0({ authFields: ['memberNumber'] })

    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Authenticate' }))

    expect(csp.mutateAsync).not.toHaveBeenCalled()
  })

  it('does not submit until the terms are accepted', async () => {
    const user = userEvent.setup()
    renderStep0({ authFields: ['memberNumber'] })

    await user.type(field('memberNumber'), '00123')
    await user.click(screen.getByRole('button', { name: 'Authenticate' }))
    expect(csp.mutateAsync).not.toHaveBeenCalled()

    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Authenticate' }))
    await waitFor(() => expect(csp.mutateAsync).toHaveBeenCalledWith({ memberNumber: '00123' }))
  })

  it('blocks a second identify request while one from any dialog is in flight', () => {
    csp.pending = true

    renderStep0({})

    expect(screen.getByRole('button', { name: 'Authenticate' })).toBeDisabled()
  })
})
