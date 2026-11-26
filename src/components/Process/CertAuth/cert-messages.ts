import type { TFunction } from 'i18next'

/** The voter-facing message of a gateway or backend error code. */
export const certErrorMessage = (t: TFunction, code: string): string => {
  switch (code) {
    case 'no_certificate':
      return t('csp.cert.errors.no_certificate', { defaultValue: 'No certificate was selected.' })
    case 'not_in_census':
      return t('csp.cert.errors.not_in_census', {
        defaultValue: "The DNI/NIE of this certificate isn't in the census of this vote.",
      })
    case 'zero_weight':
      return t('csp.cert.errors.zero_weight', {
        defaultValue: "You don't have enough voting power to access the vote.",
      })
    case 'provider_mismatch':
    case 'untrusted_issuer':
      return t('csp.cert.errors.unsupported_certificate', {
        defaultValue:
          "This certificate isn't accepted. Use a personal certificate from FNMT, idCAT, ACCV, DIGITEL, Bewor or Sectigo.",
      })
    case 'unsupported_profile':
      return t('csp.cert.errors.unsupported_profile', {
        defaultValue:
          'This certificate is for a company, a representative or an employee. Use the certificate issued to you as a person.',
      })
    case 'invalid_chain':
      return t('csp.cert.errors.invalid_chain', {
        defaultValue: "We couldn't verify this certificate. Use another certificate if you have one.",
      })
    case 'unsupported_purpose':
      return t('csp.cert.errors.unsupported_purpose', {
        defaultValue: "This certificate can't be used to sign in. Use the certificate you use to identify yourself.",
      })
    case 'weak_algorithm':
      return t('csp.cert.errors.weak_algorithm', {
        defaultValue: 'This certificate is too old to use here. Get a new one from its issuer.',
      })
    case 'test_certificate':
      return t('csp.cert.errors.test_certificate', {
        defaultValue: 'This is a test certificate. Use your real certificate.',
      })
    case 'identity_invalid':
      return t('csp.cert.errors.identity_invalid', {
        defaultValue: "We couldn't read the identity in this certificate. Use another certificate if you have one.",
      })
    case 'identity_unsupported_document':
      return t('csp.cert.errors.identity_unsupported_document', {
        defaultValue: 'This certificate has no DNI or NIE. You need a certificate issued with your DNI or NIE.',
      })
    case 'revocation_unknown':
      return t('csp.cert.errors.revocation_unknown', {
        defaultValue:
          "We couldn't confirm with its issuer that this certificate is still valid. Use another certificate if you have one.",
      })
    case 'expired':
      return t('csp.cert.errors.expired', {
        defaultValue: 'This certificate has expired. Get a new one from its issuer.',
      })
    case 'not_yet_valid':
      return t('csp.cert.errors.not_yet_valid', {
        defaultValue:
          "This certificate isn't active yet. If you got it today, try again later. If not, check your device's date and time.",
      })
    case 'revoked':
      return t('csp.cert.errors.revoked', { defaultValue: 'This certificate has been revoked.' })
    case 'mismatch':
      return t('csp.cert.errors.mismatch', {
        defaultValue: "Your certificate sign-in didn't finish in this tab. Sign in again.",
      })
    case 'revocation_unavailable':
    case 'internal':
      return t('csp.cert.errors.check_unavailable', {
        defaultValue: "We couldn't check your certificate right now. Try again in a few minutes.",
      })
    case 'backend_unavailable':
      return t('csp.cert.errors.backend_unavailable', {
        defaultValue: "The voting service didn't answer. Try again in a few minutes.",
      })
    case 'rate_limited':
      return t('csp.cert.errors.rate_limited', { defaultValue: 'Too many attempts. Try again later.' })
    case 'process_not_open':
    case 'not_cert_census':
    case 'anonymous_unavailable':
      return t('csp.cert.errors.process_unavailable', {
        defaultValue: "This vote can't be accessed with a certificate right now.",
      })
    default:
      return t('csp.cert.errors.generic', { defaultValue: "We couldn't sign you in with your certificate." })
  }
}
