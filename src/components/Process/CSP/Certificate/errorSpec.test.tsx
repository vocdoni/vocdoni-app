import { describe, expect, it, vi } from 'vitest'
import { render } from '~src/test-utils'
import { getErrorSpec } from './errorSpec'
import { CertAuthError, type CertAuthErrorCode, type CertAuthErrorData } from '~queries/certificateAuth/types'

// A minimal t() that returns the defaultValue string directly for testing.
const t = (key: string, opts?: Record<string, unknown>): string => {
  const def = typeof opts?.defaultValue === 'string' ? opts.defaultValue : key
  if (!opts) return def
  return def.replace(/\{\{(\w+)\}\}/g, (_, k) => (opts[k] != null ? String(opts[k]) : `{{${k}}}`))
}

const language = 'en'
const onRetry = vi.fn()

const opts = { t: t as never, language, mode: 'vote' as const, onRetry }

const makeError = (reason: CertAuthErrorCode, data: Partial<CertAuthErrorData> = {}) => new CertAuthError(reason, data)

// Renders a ReactNode through the full Chakra provider tree.
const renderNode = (node: React.ReactNode) => render(<>{node}</>, { appEnv: { ENABLE_CERTIFICATE_AUTH: 'on' } })

describe('getErrorSpec', () => {
  it('dni_not_in_census: title, sentence text, primary label', () => {
    const spec = getErrorSpec(
      makeError('dni_not_in_census', {
        holder: { fullName: 'Maria García López', documentType: 'DNI', documentEnding: '678Z' },
      }),
      opts
    )
    expect(spec.title).toBe("This certificate isn't on the voter list")
    const { container } = renderNode(spec.sentence)
    expect(container).toHaveTextContent('Maria García López')
    expect(container).toHaveTextContent('DNI')
    expect(container).toHaveTextContent('678Z')
    const { container: pc } = renderNode(spec.primary)
    expect(pc).toHaveTextContent('Use a different certificate')
    expect(spec.secondary).toBeUndefined()
  })

  it('dni_not_in_census with NIE shows NIE', () => {
    const spec = getErrorSpec(
      makeError('dni_not_in_census', {
        holder: { fullName: 'Jordi Puig Roca', documentType: 'NIE', documentEnding: '567L' },
      }),
      opts
    )
    const { container } = renderNode(spec.sentence)
    expect(container).toHaveTextContent('NIE')
    expect(container).toHaveTextContent('567L')
  })

  it('expired with notAfter renders "Your FNMT certificate expired on 3 October 2026."', () => {
    const spec = getErrorSpec(
      makeError('expired', {
        issuer: { id: 'fnmt', name: 'FNMT' },
        notAfter: '2026-10-03T00:00:00Z',
      }),
      { ...opts, language: 'en-GB' }
    )
    expect(spec.sentence).toContain('FNMT')
    expect(spec.sentence).toContain('expired')
    expect(spec.sentence).toContain('2026')
  })

  it('expired without notAfter renders "Your FNMT certificate is no longer valid."', () => {
    const spec = getErrorSpec(makeError('expired', { issuer: { id: 'fnmt', name: 'FNMT' } }), opts)
    expect(spec.sentence).toContain('no longer valid')
  })

  it('expired: "Get a new FNMT certificate" primary is a link with correct href and rel', () => {
    const spec = getErrorSpec(makeError('expired', { issuer: { id: 'fnmt', name: 'FNMT' } }), opts)
    const { container } = renderNode(spec.primary)
    const link = container.querySelector('a')
    expect(link).not.toBeNull()
    expect(link?.href).toBe('https://www.sede.fnmt.gob.es/certificados/persona-fisica')
    expect(link?.target).toBe('_blank')
    expect(link?.rel).toContain('noopener')
    expect(link?.rel).toContain('noreferrer')
    expect(link).toHaveTextContent('Get a new FNMT certificate')
    expect(container).toHaveTextContent('(opens in a new tab)')
  })

  it('expired idCAT: "Get a new idCAT certificate" link goes to idcat.aoc.cat', () => {
    const spec = getErrorSpec(makeError('expired', { issuer: { id: 'idcat', name: 'idCAT' } }), opts)
    const { container } = renderNode(spec.primary)
    const link = container.querySelector('a')
    expect(link?.href).toBe('https://idcat.aoc.cat/')
  })

  it('expired with unknown issuer id: primary is UseDifferentButton, not a dead link', () => {
    // An issuer not in ISSUER_LINKS must not render a href="#" link.
    const spec = getErrorSpec(makeError('expired', { issuer: { id: 'unknown-ca' as never, name: 'Unknown CA' } }), opts)
    expect(spec.sentence).toContain('Unknown CA')
    const { container } = renderNode(spec.primary)
    expect(container.querySelector('a')).toBeNull()
    expect(container).toHaveTextContent('Use a different certificate')
    expect(spec.secondary).toBeUndefined()
  })

  it('no_certificate: title, sentence, primary "Try again", secondary "Copy link for another device"', () => {
    const spec = getErrorSpec(makeError('no_certificate'), opts)
    expect(spec.title).toBe('No certificate found in this browser')
    expect(spec.sentence).toContain('window to choose it was closed')
    const { container: pc } = renderNode(spec.primary)
    expect(pc).toHaveTextContent('Try again')
    const { container: sc } = renderNode(spec.secondary)
    expect(sc).toHaveTextContent('Copy link for another device')
  })

  it('untrusted_issuer: title, sentence, primary "Use a different certificate", no secondary', () => {
    const spec = getErrorSpec(makeError('untrusted_issuer'), opts)
    expect(spec.title).toBe("This certificate can't be used here")
    expect(spec.sentence).toContain('idCAT Certificat')
    const { container } = renderNode(spec.primary)
    expect(container).toHaveTextContent('Use a different certificate')
    expect(spec.secondary).toBeUndefined()
  })

  it('invalid_chain: "We couldn\'t verify this certificate", Use a different certificate', () => {
    const spec = getErrorSpec(makeError('invalid_chain'), opts)
    expect(spec.title).toBe("We couldn't verify this certificate")
    const { container } = renderNode(spec.primary)
    expect(container).toHaveTextContent('Use a different certificate')
  })

  it('provider_mismatch: same layout as invalid_chain', () => {
    const spec = getErrorSpec(makeError('provider_mismatch'), opts)
    expect(spec.title).toBe("We couldn't verify this certificate")
  })

  it('invalid_chain title comes from its own literal key, not a template', () => {
    // Verifies that the key cert_auth.errors.invalid_chain.title is a literal in the t() call.
    // A key-tracking t() rejects non-literal keys; here we confirm the key resolves independently.
    const keysSeen: string[] = []
    const tRecording = (key: string, opts?: Record<string, unknown>): string => {
      keysSeen.push(key)
      const def = typeof opts?.defaultValue === 'string' ? opts.defaultValue : key
      return def
    }
    getErrorSpec(makeError('invalid_chain'), { ...opts, t: tRecording as never })
    expect(keysSeen).toContain('cert_auth.errors.invalid_chain.title')
    expect(keysSeen).toContain('cert_auth.errors.invalid_chain.sentence')
    expect(keysSeen).not.toContain('cert_auth.errors.invalid_chain.title'.replace('invalid_chain', '${reason}'))
  })

  it('provider_mismatch title comes from its own literal key, not a template', () => {
    const keysSeen: string[] = []
    const tRecording = (key: string, opts?: Record<string, unknown>): string => {
      keysSeen.push(key)
      const def = typeof opts?.defaultValue === 'string' ? opts.defaultValue : key
      return def
    }
    getErrorSpec(makeError('provider_mismatch'), { ...opts, t: tRecording as never })
    expect(keysSeen).toContain('cert_auth.errors.provider_mismatch.title')
    expect(keysSeen).toContain('cert_auth.errors.provider_mismatch.sentence')
  })

  it('not_yet_valid: title, sentence, primary "Try again", no secondary', () => {
    const spec = getErrorSpec(makeError('not_yet_valid'), opts)
    expect(spec.title).toBe("This certificate isn't active yet")
    const { container } = renderNode(spec.primary)
    expect(container).toHaveTextContent('Try again')
    expect(spec.secondary).toBeUndefined()
  })

  it('unsupported_profile: "Use your personal certificate", Use a different certificate', () => {
    const spec = getErrorSpec(makeError('unsupported_profile'), opts)
    expect(spec.title).toBe('Use your personal certificate')
    const { container } = renderNode(spec.primary)
    expect(container).toHaveTextContent('Use a different certificate')
  })

  it('unsupported_purpose: title, Use a different certificate', () => {
    const spec = getErrorSpec(makeError('unsupported_purpose'), opts)
    expect(spec.title).toBe("This certificate can't be used to sign in")
  })

  it('weak_algorithm with issuer: link primary + Use a different certificate secondary', () => {
    const spec = getErrorSpec(makeError('weak_algorithm', { issuer: { id: 'fnmt', name: 'FNMT' } }), opts)
    const { container: pc } = renderNode(spec.primary)
    expect(pc.querySelector('a')).not.toBeNull()
    expect(pc).toHaveTextContent('Get a new FNMT certificate')
    const { container: sc } = renderNode(spec.secondary)
    expect(sc).toHaveTextContent('Use a different certificate')
  })

  it('weak_algorithm without issuer: Use a different certificate primary, no secondary', () => {
    const spec = getErrorSpec(makeError('weak_algorithm'), opts)
    const { container } = renderNode(spec.primary)
    expect(container).toHaveTextContent('Use a different certificate')
    expect(spec.secondary).toBeUndefined()
  })

  it('test_certificate: "This is a test certificate", Use a different certificate', () => {
    const spec = getErrorSpec(makeError('test_certificate'), opts)
    expect(spec.title).toBe('This is a test certificate')
    const { container } = renderNode(spec.primary)
    expect(container).toHaveTextContent('Use a different certificate')
  })

  it('identity_invalid: "We couldn\'t read the identity in this certificate"', () => {
    const spec = getErrorSpec(makeError('identity_invalid'), opts)
    expect(spec.title).toBe("We couldn't read the identity in this certificate")
  })

  it('identity_unsupported_document: "This certificate has no DNI or NIE"', () => {
    const spec = getErrorSpec(makeError('identity_unsupported_document'), opts)
    expect(spec.title).toBe('This certificate has no DNI or NIE')
  })

  it('revoked: "This certificate is no longer valid", Use a different certificate primary', () => {
    const spec = getErrorSpec(makeError('revoked'), opts)
    expect(spec.title).toBe('This certificate is no longer valid')
    const { container } = renderNode(spec.primary)
    expect(container).toHaveTextContent('Use a different certificate')
  })

  it('revoked with known issuer: Get new certificate link as secondary', () => {
    const spec = getErrorSpec(makeError('revoked', { issuer: { id: 'fnmt', name: 'FNMT' } }), opts)
    const { container } = renderNode(spec.secondary)
    expect(container.querySelector('a')).not.toBeNull()
  })

  it('revocation_unknown with issuer: title includes issuer name', () => {
    const spec = getErrorSpec(makeError('revocation_unknown', { issuer: { id: 'fnmt', name: 'FNMT' } }), opts)
    expect(spec.title).toContain('FNMT')
    expect(spec.sentence).toContain('FNMT')
    expect(spec.sentence).toContain('reference code')
  })

  it('revocation_unknown without issuer: generic title and sentence', () => {
    const spec = getErrorSpec(makeError('revocation_unknown'), opts)
    expect(spec.title).not.toContain('{{')
    expect(spec.sentence).toContain('certificate issuer')
  })

  it('revocation_unavailable: "We couldn\'t check your certificate right now", Try again', () => {
    const spec = getErrorSpec(makeError('revocation_unavailable'), opts)
    expect(spec.title).toBe("We couldn't check your certificate right now")
    const { container } = renderNode(spec.primary)
    expect(container).toHaveTextContent('Try again')
  })

  it('internal: "Something went wrong on our side", Try again', () => {
    const spec = getErrorSpec(makeError('internal'), opts)
    expect(spec.title).toBe('Something went wrong on our side')
    const { container } = renderNode(spec.primary)
    expect(container).toHaveTextContent('Try again')
  })

  it('network: "We couldn\'t reach the certificate check", Try again + Copy link', () => {
    const spec = getErrorSpec(makeError('network'), opts)
    expect(spec.title).toBe("We couldn't reach the certificate check")
    const { container: pc } = renderNode(spec.primary)
    expect(pc).toHaveTextContent('Try again')
    const { container: sc } = renderNode(spec.secondary)
    expect(sc).toHaveTextContent('Copy link for another device')
  })

  it('too_many_attempts shows clock time now + retryAfter and no buttons', () => {
    const now = new Date('2026-10-01T10:00:00Z')
    const spec = getErrorSpec(makeError('too_many_attempts', { retryAfter: 1800 }), { ...opts, now })
    expect(spec.title).toBe('Too many attempts')
    expect(spec.primary).toBeNull()
    expect(spec.secondary).toBeUndefined()
    expect(typeof spec.sentence).toBe('string')
    expect(spec.sentence as string).toMatch(/\d{1,2}[:.,h]\d{2}/)
  })

  it('closing note appears when vote ends today', () => {
    const now = new Date('2026-10-01T09:00:00')
    const closesAt = new Date('2026-10-01T20:00:00')
    const spec = getErrorSpec(makeError('internal'), { ...opts, closesAt, now })
    expect(spec.note).toContain('today')
  })

  it('closing note appears when vote ends tomorrow', () => {
    const now = new Date('2026-10-01T09:00:00')
    const closesAt = new Date('2026-10-02T20:00:00')
    const spec = getErrorSpec(makeError('internal'), { ...opts, closesAt, now })
    expect(spec.note).toContain('tomorrow')
  })

  it('no closing note when vote ends in more than a day', () => {
    const now = new Date('2026-10-01T09:00:00')
    const closesAt = new Date('2026-10-05T20:00:00')
    const spec = getErrorSpec(makeError('internal'), { ...opts, closesAt, now })
    expect(spec.note).toBeUndefined()
  })

  it('in mode "check": primary reads "Check a different certificate"', () => {
    const spec = getErrorSpec(makeError('untrusted_issuer'), { ...opts, mode: 'check' })
    const { container } = renderNode(spec.primary)
    expect(container).toHaveTextContent('Check a different certificate')
  })

  it('in mode "check": note is "You still have time: voting opens on {{date}}." when opensAt given', () => {
    const opensAt = new Date('2026-11-15T10:00:00Z')
    const spec = getErrorSpec(makeError('internal'), { ...opts, mode: 'check', opensAt })
    expect(spec.note).toContain('You still have time')
    expect(spec.note).toContain('2026')
  })

  it('throws for recovery codes', () => {
    expect(() => getErrorSpec(makeError('attempt_expired'), opts)).toThrow()
    expect(() => getErrorSpec(makeError('code_used'), opts)).toThrow()
    expect(() => getErrorSpec(makeError('verifier_mismatch'), opts)).toThrow()
    expect(() => getErrorSpec(makeError('session_lost'), opts)).toThrow()
  })
})
