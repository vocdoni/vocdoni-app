import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { mockUseElection, render, screen } from '~src/test-utils'
import { resetReactProvidersMock, setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { CertAuthError, type CertHolder } from '~queries/certificateAuth/types'
import { CertificateIdentify, CertificateStickyAction } from './CertificateIdentify'
import type { CertPhase } from './useCertificateAuth'

beforeAll(() => {
  // jsdom has no scrollIntoView; the component calls it on the bucket toggle / ballot container.
  Element.prototype.scrollIntoView = vi.fn()
})

const flow = {
  phase: { kind: 'idle' } as CertPhase,
  start: vi.fn(),
  retry: vi.fn(),
  reset: vi.fn(),
  logout: vi.fn(),
  purpose: 'vote' as const,
}

vi.mock('./CertificateAuthProvider', () => ({
  useCertificateAuthContext: () => flow,
}))

const HOLDER: CertHolder = { fullName: 'Maria García López', documentType: 'DNI', documentEnding: '678Z' }

const setPage = ({ status = 'ONGOING', connected = false }: { status?: string; connected?: boolean } = {}) =>
  setReactProvidersMock({
    useElection: () => mockUseElection({ election: { id: 'p1', title: 'Board election' }, status }),
    useElectionAuth: () => ({ connected, authToken: null, weight: null }),
  })

const renderIdentify = (phase: CertPhase, onIdentified = vi.fn()) => {
  flow.phase = phase
  return {
    onIdentified,
    ...render(<CertificateIdentify onIdentified={onIdentified} />, { appEnv: { ENABLE_CERTIFICATE_AUTH: 'on' } }),
  }
}

afterEach(() => {
  resetReactProvidersMock()
  vi.clearAllMocks()
})

describe('CertificateIdentify', () => {
  it('renders both slots during the server render', () => {
    setPage()
    const { container } = renderIdentify({ kind: 'ssr' })

    expect(container.querySelector('[data-cert-slot="idle"]')).toHaveTextContent('Identify to vote')
    expect(container.querySelector('[data-cert-slot="returning"]')).toHaveTextContent('Checking your certificate...')
  })

  it('shows the identify panel when idle and starts an attempt from its button', async () => {
    setPage()
    renderIdentify({ kind: 'idle' })

    expect(screen.getByRole('heading', { name: 'Identify to vote' })).toBeInTheDocument()
    expect(screen.queryByText(/Let's finish identifying you/)).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Access with your digital certificate' }))
    expect(flow.start).toHaveBeenCalledTimes(1)
  })

  it('shows the resume line when an attempt did not come back', () => {
    setPage()
    renderIdentify({ kind: 'idle', resume: true })

    expect(screen.getByText(/Let's finish identifying you/)).toBeInTheDocument()
  })

  it('shows the opening panel while the certificate window opens', () => {
    setPage()
    renderIdentify({ kind: 'starting' })

    expect(screen.getByRole('heading', { name: 'Opening the certificate window...' })).toBeInTheDocument()
  })

  it.each([
    [false, 'Checking your certificate...'],
    [true, 'Still checking with your certificate provider...'],
  ])('shows the checking panel (slow: %s)', (slow, heading) => {
    setPage()
    renderIdentify({ kind: 'checking', slow })

    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument()
  })

  it('shows the stalled panel and retries from it', async () => {
    setPage()
    renderIdentify({ kind: 'stalled' })

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(flow.retry).toHaveBeenCalledTimes(1)
  })

  it('shows the identified strip, logs out from it and hands focus to the ballot', async () => {
    setPage({ connected: true })
    const { onIdentified } = renderIdentify({ kind: 'identified', holder: HOLDER })

    expect(screen.getByRole('status')).toHaveClass('ph-no-capture')
    expect(screen.getByText('Maria García López')).toBeInTheDocument()
    expect(onIdentified).toHaveBeenCalledTimes(1)
    await userEvent.click(screen.getByRole('button', { name: 'Not you? Log out' }))
    expect(flow.logout).toHaveBeenCalledTimes(1)
  })

  it('goes back to the sign-in panel when the session ends from the aside', () => {
    setPage({ connected: true })
    const { rerender } = renderIdentify({ kind: 'identified', holder: HOLDER })
    expect(flow.reset).not.toHaveBeenCalled()

    setPage({ connected: false })
    rerender(<CertificateIdentify onIdentified={vi.fn()} />)

    expect(flow.reset).toHaveBeenCalledTimes(1)
  })

  it('shows the error block in place of the panel', () => {
    setPage()
    renderIdentify({ kind: 'error', error: new CertAuthError('no_certificate') })

    expect(screen.queryByRole('heading', { name: 'Identify to vote' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })

  it.each(['ENDED', 'RESULTS', 'CANCELED', 'UPCOMING'])('renders nothing on a %s vote', (status) => {
    setPage({ status })
    renderIdentify({ kind: 'idle' })

    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})

describe('CertificateStickyAction', () => {
  it('offers the certificate button while idle', async () => {
    setPage()
    flow.phase = { kind: 'idle' }
    render(<CertificateStickyAction />, { appEnv: { ENABLE_CERTIFICATE_AUTH: 'on' } })

    await userEvent.click(screen.getByRole('button', { name: 'Access with your digital certificate' }))
    expect(flow.start).toHaveBeenCalledTimes(1)
  })

  it('stays out of the way once an attempt is under way', () => {
    setPage()
    flow.phase = { kind: 'checking', slow: false }
    render(<CertificateStickyAction />, { appEnv: { ENABLE_CERTIFICATE_AUTH: 'on' } })

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
