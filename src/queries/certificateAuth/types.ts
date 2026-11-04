/** Wire types of the certificate sign-in contract (.delivery/certificats-digitals/contract-cert-auth.md). */
export type CertAuthPurpose = 'vote' | 'check'

export type CreateCertAuthRequest = {
  challenge: string
  challengeMethod: 'S256'
  returnUrl: string
  purpose: CertAuthPurpose
}

export type CreateCertAuthResponse = {
  state: string
  authUrl: string
  expiresAt: string
  probeUrl?: string
}

export type RedeemCertAuthRequest = { code: string; verifier: string }

export type CertDocumentType = 'DNI' | 'NIE'

export type CertHolder = {
  fullName: string
  documentType: CertDocumentType
  /** Last 4 characters of the canonical document, e.g. "678Z". Never the full number. */
  documentEnding: string
}

export type CertIssuerId = 'fnmt' | 'idcat'

export type CertIssuer = { id: CertIssuerId; name: string }

export type RedeemCertAuthResponse = {
  purpose: CertAuthPurpose
  /** Null for purpose "check": a pre-check never opens a voting session. */
  authToken: string | null
  weight?: string
  /** Opaque, stable per voter and process; not derived from the DNI/NIE alone. */
  voterRef: string
  holder: CertHolder
  reference: string
}

/** cert-check `certcheck.Codes`, verbatim. */
export const CERT_CHECK_CODES = [
  'no_certificate',
  'provider_mismatch',
  'untrusted_issuer',
  'invalid_chain',
  'expired',
  'not_yet_valid',
  'unsupported_profile',
  'unsupported_purpose',
  'weak_algorithm',
  'test_certificate',
  'identity_invalid',
  'identity_unsupported_document',
  'revoked',
  'revocation_unknown',
  'revocation_unavailable',
  'internal',
] as const

export const CERT_AUTH_SERVER_CODES = [
  ...CERT_CHECK_CODES,
  'dni_not_in_census',
  'attempt_expired',
  'code_used',
  'verifier_mismatch',
  'too_many_attempts',
] as const

/** Raised by the app itself, never sent by the backend. */
export const CERT_AUTH_CLIENT_CODES = ['session_lost', 'network'] as const

export type CertAuthServerCode = (typeof CERT_AUTH_SERVER_CODES)[number]
export type CertAuthErrorCode = CertAuthServerCode | (typeof CERT_AUTH_CLIENT_CODES)[number]

export type CertAuthErrorData = {
  reason: CertAuthServerCode
  retryable: boolean
  reference?: string
  holder?: CertHolder
  issuer?: CertIssuer
  notAfter?: string
  retryAfter?: number
}

/** Not errors for the voter: V1 again with "Let's finish identifying you...", no reference. */
export const RECOVERY_CODES: ReadonlySet<CertAuthErrorCode> = new Set([
  'attempt_expired',
  'code_used',
  'verifier_mismatch',
  'session_lost',
])

const SERVER_CODES: ReadonlySet<string> = new Set(CERT_AUTH_SERVER_CODES)

export const isCertAuthServerCode = (value: unknown): value is CertAuthServerCode =>
  typeof value === 'string' && SERVER_CODES.has(value)

export class CertAuthError extends Error {
  readonly reason: CertAuthErrorCode
  readonly data: Partial<CertAuthErrorData>

  constructor(reason: CertAuthErrorCode, data: Partial<CertAuthErrorData> = {}) {
    super(reason)
    this.name = 'CertAuthError'
    this.reason = reason
    this.data = data
  }
}

/** The reference shown to the voter: the first 12 hex digits, upper case, in groups of 4. */
export const formatReference = (diagnosticId?: string): { shown: string; copy: string } | null => {
  const hex = diagnosticId?.toLowerCase().replace(/[^0-9a-f]/g, '') ?? ''
  if (hex.length < 12) return null
  const copy = hex.slice(0, 12)
  return { copy, shown: copy.toUpperCase().match(/.{4}/g)!.join(' ') }
}
