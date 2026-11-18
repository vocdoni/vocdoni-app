import { fireEvent, screen, waitFor } from '@testing-library/react'
import { createTestI18n } from '~src/test-utils'
import { renderWithFlow, testFacts, testFlow } from '../test-flow'
import { initialVoterState } from '../voter-flow'
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
  identify: {
    mutateAsync: vi.fn(),
    isPending: false,
    error: null as null | { mismatch: boolean; message: string; known: boolean; cause?: unknown },
  },
  auth1: { mutate: vi.fn(), error: null as null | Error },
  KnownCspError: class KnownCspError extends Error {},
  resend: { mutateAsync: vi.fn(async () => undefined), error: null as null | Error },
}))

vi.mock('~components/Process/CSP/CSPStepsProvider', () => ({ useCspAuthContext: () => csp.context }))
vi.mock('../use-voter-identify', () => ({ useVoterIdentify: () => csp.identify }))
vi.mock('~components/Process/CSP/basics', () => ({
  KnownCspError: csp.KnownCspError,
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
  csp.auth1.error = null
  csp.resend.error = null
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

  it('on an ended vote reached by "Comprova el teu vot" it says neither "open until" nor "identify to vote" (gate F7)', () => {
    const open = renderWithFlow(<IdentifyScreen />, testFlow({ facts: testFacts({ connected: false }) }))
    expect(screen.getByText(/voter\.status\.open_until/)).toBeInTheDocument()
    expect(screen.getByText('voter.identify.help')).toBeInTheDocument()
    open.unmount()
    renderWithFlow(
      <IdentifyScreen />,
      testFlow({
        facts: testFacts({ connected: false, status: 'ENDED' }),
        state: { ...initialVoterState, checkReceipt: true },
      })
    )
    expect(screen.queryByText(/voter\.status\.open_until/)).toBeNull()
    expect(screen.queryByText('voter.identify.help')).toBeNull()
    expect(screen.getByText('voter.results.check_vote')).toBeInTheDocument()
  })

  it('a failed match shows the board sentence and marks every field, naming none', () => {
    csp.identify.error = { mismatch: true, message: 'csp.errors.participant_not_found', known: true }
    renderWithFlow(<IdentifyScreen />, testFlow({ facts: testFacts({ connected: false }) }))
    expect(screen.getByRole('alert')).toHaveTextContent('voter.identify.mismatch')
    expect(screen.getByRole('textbox', { name: /Member Number/ })).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('button', { name: 'voter.identify.retry' })).toBeInTheDocument()
  })

  it('keeps the password variant and other refusals as today, marking no field for the latter', () => {
    csp.context.authFields = ['memberNumber', 'password']
    csp.identify.error = { mismatch: true, message: 'csp.errors.credentials_or_password_incorrect', known: true }
    const { unmount } = renderWithFlow(<IdentifyScreen />, testFlow({ facts: testFacts({ connected: false }) }))
    expect(screen.getByRole('alert')).toHaveTextContent('csp.errors.credentials_or_password_incorrect')
    unmount()
    csp.identify.error = { mismatch: false, message: 'csp.errors.requests_on_cooldown', known: true }
    renderWithFlow(<IdentifyScreen />, testFlow({ facts: testFacts({ connected: false }) }))
    expect(screen.getByRole('alert')).toHaveTextContent('csp.errors.requests_on_cooldown')
    expect(screen.getByRole('textbox', { name: /Member Number/ })).not.toHaveAttribute('aria-invalid', 'true')
  })

  it('shows a recognised refusal as worded, whatever its text, and logs nothing', () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    csp.identify.error = { mismatch: false, message: 'Too many attempts. Please try again in 3 days.', known: true }
    renderWithFlow(<IdentifyScreen />, testFlow({ facts: testFacts({ connected: false }) }))
    expect(screen.getByRole('alert')).toHaveTextContent('Too many attempts. Please try again in 3 days.')
    expect(logged).not.toHaveBeenCalled()
    logged.mockRestore()
  })

  it('asks for what is missing in the page, without the browser bubbles, and sends nothing', async () => {
    csp.context.authFields = ['memberNumber', 'password']
    renderWithFlow(<IdentifyScreen />, testFlow({ facts: testFacts({ connected: false }) }))
    const form = screen.getByRole('button', { name: 'voter.continue' }).closest('form') ?? document.forms[0]
    expect(form).toHaveAttribute('novalidate')
    fireEvent.click(screen.getByRole('button', { name: 'voter.continue' }))
    expect(await screen.findAllByText('voter.identify.field_required')).toHaveLength(2)
    expect(screen.getByText('voter.identify.terms_required')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /Member Number/ })).not.toBeRequired()
    expect(csp.identify.mutateAsync).not.toHaveBeenCalled()
  })

  it('never shows the SDK message of an unknown failure: a generic sentence, the error for support', () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const cause = new TypeError('fetch failed: ECONNRESET 10.0.0.3')
    csp.identify.error = { mismatch: false, message: cause.message, known: false, cause }
    renderWithFlow(<IdentifyScreen />, testFlow({ facts: testFacts({ connected: false }) }))
    expect(screen.getByRole('alert')).toHaveTextContent('voter.identify.failed')
    expect(screen.queryByText(/ECONNRESET/)).toBeNull()
    expect(logged).toHaveBeenCalledWith('Voter identification failed:', cause)
    logged.mockRestore()
  })

  it('opens the terms and privacy links in a new tab and does not toggle the checkbox', async () => {
    // With bare keys `Trans` renders no link: the strings need their link tags.
    const i18nInstance = await createTestI18n({
      resources: {
        en: {
          common: {
            voter: {
              identify: { terms: 'I accept the <terms>terms</terms> and the <privacy>privacy policy</privacy>.' },
            },
            footer: { terms_and_privacy: '<link1>Terms of use</link1> & <link2>Privacy Policy</link2>' },
          },
        },
      },
      useReactI18next: true,
    })
    renderWithFlow(<IdentifyScreen />, testFlow({ facts: testFacts({ connected: false }) }), { i18nInstance })
    const links = ['terms', 'privacy policy', 'Terms of use', 'Privacy Policy'].map((name) =>
      screen.getByRole('link', { name })
    )
    for (const link of links) {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link.getAttribute('rel')).toContain('noopener')
      fireEvent.click(link)
    }
    expect(screen.getByRole('checkbox', { hidden: true })).not.toBeChecked()
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

  it('leaves the empty code boxes blank, as the board draws them (conformance pass 2, N-1)', () => {
    renderWithFlow(<CodeScreen />, testFlow({ facts: testFacts({ connected: false, challengePending: true }) }))
    const boxes = document.querySelectorAll('input[data-scope="pin-input"][data-part="input"]')
    expect(boxes.length).toBeGreaterThan(0)
    // Only the box being typed in may differ; the others would show Ark's "○" without the prop.
    expect([...boxes].filter((box) => box.getAttribute('placeholder') === '\u25CB')).toHaveLength(0)
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

  it('shows a recognised refusal as worded and hides a raw one behind a generic sentence, logged for support', () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const flow = testFlow({ facts: testFacts({ connected: false, challengePending: true }) })
    csp.auth1.error = new csp.KnownCspError('csp.errors.requests_on_cooldown')
    const known = renderWithFlow(<CodeScreen />, flow)
    expect(screen.getByRole('alert')).toHaveTextContent('csp.errors.requests_on_cooldown')
    expect(logged).not.toHaveBeenCalled()
    known.unmount()
    const raw = new Error('otp mismatch at row 42')
    csp.auth1.error = raw
    const code = renderWithFlow(<CodeScreen />, flow)
    expect(screen.getByRole('alert')).toHaveTextContent('csp.auth_failed')
    expect(screen.queryByText(/row 42/)).toBeNull()
    expect(logged).toHaveBeenCalledWith('Voter code step failed:', raw)
    code.unmount()
    csp.auth1.error = null
    csp.resend.error = new Error('smtp: 550 mailbox unavailable')
    renderWithFlow(<CodeScreen />, flow)
    expect(screen.getByRole('alert')).toHaveTextContent('csp.step1.resend_failed')
    expect(screen.queryByText(/smtp/)).toBeNull()
    logged.mockRestore()
  })
})
