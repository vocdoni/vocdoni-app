import type { CensusSpec } from '@vocdoni/api-types'
import type { CertificateAuthMode } from './mode'

/** Certificate census type; will merge into @vocdoni/api-types. */
export type CensusAuthMethod = 'certificate'
export type AppCensusSpec = CensusSpec & { authMethod?: CensusAuthMethod }

export const CERTIFICATE_AUTH_FIELDS = ['nationalId'] as const

/**
 * A census voters sign in to with a digital certificate. In mock mode a census whose only
 * credential is the DNI/NIE also counts, so the voter screens can be tried against a backend
 * that does not know `authMethod` yet.
 */
export const isCertificateCensus = (census: CensusSpec | null | undefined, mode: CertificateAuthMode): boolean => {
  if (!census || mode === 'off') return false
  if ((census as AppCensusSpec).authMethod === 'certificate') return true
  return (
    mode === 'mock' &&
    census.authFields?.length === 1 &&
    census.authFields[0] === 'nationalId' &&
    !census.twoFaFields?.length
  )
}
