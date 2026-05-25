import userEvent from '@testing-library/user-event'
import { createTestI18n, mockUseElection, render, screen } from '~src/test-utils'
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

  afterEach(() => {
    vi.useRealTimers()
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

  it('uses the translated label before June 10 when the translation exists', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 4, 25, 12, 0, 0))

    const i18nInstance = await createTestI18n({
      lng: 'en',
      fallbackLng: 'en',
      useReactI18next: true,
      resources: {
        en: {
          common: {
            'spreadsheet.access_available_june_10': 'Voting will be available on June 10',
            'spreadsheet.access_button': 'Identify',
            'csp.step1.title': 'Authentication',
          },
        },
      },
    })

    render(<CspAuthModal />, { i18nInstance })

    const button = screen.getByRole('button', { name: 'Voting will be available on June 10' })
    expect(button).toBeDisabled()
  })
})
