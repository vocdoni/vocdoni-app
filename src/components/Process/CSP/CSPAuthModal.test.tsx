import userEvent from '@testing-library/user-event'
import { mockUseElection, render, screen } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { CspAuthModal } from './CSPAuthModal'

const cspStepState = vi.hoisted(() => ({ currentStep: 0 }))

vi.mock('./CSPStepsProvider', () => ({
  useCspAuthContext: () => ({ currentStep: cspStepState.currentStep }),
}))

vi.mock('./Step0', () => ({
  Step0Base: () => <div>Step 0</div>,
}))

vi.mock('./Step1', () => ({
  Step1Base: () => (
    <div>
      <div>Enter the verification code</div>
      <div>
        We’ve sent a code to your phone number or email address. If you chose to receive it by email, please check your
        spam folder.
      </div>
      <div>Didn’t receive the code? Resend it.</div>
      <div>If you experience any issues, contact your organization.</div>
      <div>Step 1</div>
    </div>
  ),
}))

describe('CspAuthModal', () => {
  beforeEach(() => {
    cspStepState.currentStep = 0
    setReactProvidersMock({
      useElection: () => mockUseElection({ election: { id: 'test-election' } }),
    })
  })

  it('shows step 0 when modal opens at step 0', async () => {
    const user = userEvent.setup()

    render(<CspAuthModal />)

    expect(screen.queryByText('Step 0')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /login/i }))
    expect(screen.getByText('Step 0')).toBeInTheDocument()
  })

  it('shows step 1 when modal opens at step 1', async () => {
    cspStepState.currentStep = 1
    const user = userEvent.setup()

    render(<CspAuthModal />)

    await user.click(screen.getByRole('button', { name: /login/i }))
    expect(screen.getByText('Authentication')).toBeInTheDocument()
    expect(screen.getByText('Enter the verification code')).toBeInTheDocument()
    expect(
      screen.getByText(
        'We’ve sent a code to your phone number or email address. If you chose to receive it by email, please check your spam folder.'
      )
    ).toBeInTheDocument()
    expect(screen.getByText('Didn’t receive the code? Resend it.')).toBeInTheDocument()
    expect(screen.getByText('If you experience any issues, contact your organization.')).toBeInTheDocument()
    expect(screen.getByText('Step 1')).toBeInTheDocument()
  })
})
