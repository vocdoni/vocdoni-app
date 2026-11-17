import { fireEvent, screen, waitFor } from '@testing-library/react'
import { createTestI18n } from '~src/test-utils'
import { renderWithFlow, testFacts, testFlow } from '../test-flow'
import { CodeScreen } from './CodeScreen'
import { IdentifyScreen } from './IdentifyScreen'

const csp = vi.hoisted(() => ({
  context: {
    authFields: ['memberNumber'] as string[],
    twoFaFields: [] as string[],
    authData: { email: 'anna@exemple.cat' } as { email?: string; phone?: string },
    setAuthData: vi.fn(),
    setCurrentStep: vi.fn(),
    resetFlow: vi.fn(),
  },
  identify: { mutateAsync: vi.fn(), isPending: false, error: null as null | { mismatch: boolean; message: string } },
  auth1: { mutate: vi.fn(), error: null as null | Error },
  resend: { mutateAsync: vi.fn(async () => undefined), error: null as null | Error },
}))

vi.mock('~components/Process/CSP/CSPStepsProvider', () => ({ useCspAuthContext: () => csp.context }))
vi.mock('../use-voter-identify', () => ({ useVoterIdentify: () => csp.identify }))
vi.mock('~components/Process/CSP/basics', () => ({
  useCspAuth1: () => csp.auth1,
  useCspResend: () => csp.resend,
  useCspAuthPending: () => false,
  useIsCspAuthBusy: () => () => false,
}))

beforeEach(() => {
  csp.context.authFields = ['memberNumber']
  csp.context.twoFaFields = []
  csp.identify.error = null
  csp.identify.mutateAsync.mockReset()
})

describe('identify', () => {
  it('asks for the census fields and sends the trimmed request, then the code step on a 2FA census', async () => {
    csp.context.twoFaFields = ['email']
    renderWithFlow(<IdentifyScreen />, testFlow({ facts: testFacts({ connected: false }) }))
    fireEvent.change(screen.getByRole('textbox', { name: /Member Number/ }), { target: { value: ' 42 ' } })
    fireEvent.change(screen.getByRole('textbox', { name: /Email/ }), { target: { value: 'anna@exemple.cat' } })
    fireEvent.click(screen.getByRole('checkbox', { hidden: true }))
    fireEvent.click(screen.getByRole('button', { name: 'voter.continue' }))
    await waitFor(() =>
      expect(csp.identify.mutateAsync).toHaveBeenCalledWith({ memberNumber: '42', email: 'anna@exemple.cat' })
    )
    expect(csp.context.setCurrentStep).toHaveBeenCalledWith(1)
  })

  it('a failed match shows the board sentence and marks every field, naming none', () => {
    csp.identify.error = { mismatch: true, message: 'csp.errors.participant_not_found' }
    renderWithFlow(<IdentifyScreen />, testFlow({ facts: testFacts({ connected: false }) }))
    expect(screen.getByRole('alert')).toHaveTextContent('voter.identify.mismatch')
    expect(screen.getByRole('textbox', { name: /Member Number/ })).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('button', { name: 'voter.identify.retry' })).toBeInTheDocument()
  })

  it('keeps the password variant and other refusals as today, marking no field for the latter', () => {
    csp.context.authFields = ['memberNumber', 'password']
    csp.identify.error = { mismatch: true, message: 'csp.errors.credentials_or_password_incorrect' }
    const { unmount } = renderWithFlow(<IdentifyScreen />, testFlow({ facts: testFacts({ connected: false }) }))
    expect(screen.getByRole('alert')).toHaveTextContent('csp.errors.credentials_or_password_incorrect')
    unmount()
    csp.identify.error = { mismatch: false, message: 'csp.errors.requests_on_cooldown' }
    renderWithFlow(<IdentifyScreen />, testFlow({ facts: testFacts({ connected: false }) }))
    expect(screen.getByRole('alert')).toHaveTextContent('csp.errors.requests_on_cooldown')
    expect(screen.getByRole('textbox', { name: /Member Number/ })).not.toHaveAttribute('aria-invalid', 'true')
  })

  it('offers the live results only when they are public, and notes an expired session', () => {
    const flow = testFlow({ facts: testFacts({ connected: false }) })
    const { unmount } = renderWithFlow(<IdentifyScreen notice='sessionExpired' />, flow)
    expect(screen.getByRole('status')).toHaveTextContent('voter.identify.session_expired')
    fireEvent.click(screen.getByTestId('voter-show-results'))
    expect(flow.showResults).toHaveBeenCalledWith(true)
    unmount()
    renderWithFlow(<IdentifyScreen />, testFlow({ facts: testFacts({ connected: false, secretUntilTheEnd: true }) }))
    expect(screen.queryByTestId('voter-show-results')).toBeNull()
  })
})

describe('code', () => {
  it('says where the code went, masked, and goes back to identify', () => {
    renderWithFlow(<CodeScreen />, testFlow({ facts: testFacts({ connected: false, challengePending: true }) }))
    expect(screen.getByText('voter.code.sent_to')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'voter.back' }))
    expect(csp.context.resetFlow).toHaveBeenCalled()
  })

  it('resends the code to the same contact and confirms it inline', async () => {
    const i18nInstance = await createTestI18n({
      resources: { en: { common: { voter: { code: { resend: "Didn't get it? <resend>Send it again</resend>." } } } } },
      useReactI18next: true,
    })
    renderWithFlow(<CodeScreen />, testFlow({ facts: testFacts({ connected: false, challengePending: true }) }), {
      i18nInstance,
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send it again' }))
    await waitFor(() => expect(csp.resend.mutateAsync).toHaveBeenCalledWith({ email: 'anna@exemple.cat' }))
    expect(await screen.findByText('voter.code.resent')).toBeInTheDocument()
  })
})
