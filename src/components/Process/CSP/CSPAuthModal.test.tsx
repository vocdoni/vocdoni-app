import { render, screen } from '~src/test-utils'
import userEvent from '@testing-library/user-event'
import { CspAuthModal } from './CSPAuthModal'

const cspStepState = vi.hoisted(() => ({ currentStep: 0 }))

vi.mock('@vocdoni/react-providers', () => ({
  useElection: () => ({
    election: { id: 'test-election' },
  }),
}))

vi.mock('./CSPStepsProvider', () => ({
  useCspAuthContext: () => ({ currentStep: cspStepState.currentStep }),
}))

vi.mock('./Step0', () => ({
  Step0Base: () => <div>Step 0</div>,
}))

vi.mock('./Step1', () => ({
  Step1Base: () => <div>Step 1</div>,
}))

describe('CspAuthModal', () => {
  beforeEach(() => {
    cspStepState.currentStep = 0
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
    expect(screen.getByText('Step 1')).toBeInTheDocument()
  })
})
