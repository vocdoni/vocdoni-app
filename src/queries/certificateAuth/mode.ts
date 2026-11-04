import { useAppEnv } from '~src/app-env'
import type { AppEnv } from '~src/app-env-build'

export type CertificateAuthMode = 'off' | 'on' | 'mock'

export const certificateAuthMode = (env: Pick<AppEnv, 'ENABLE_CERTIFICATE_AUTH'> | undefined): CertificateAuthMode =>
  env?.ENABLE_CERTIFICATE_AUTH ?? 'off'

/** 'off' unless ENABLE_CERTIFICATE_AUTH turns the certificate sign-in on (or mocks it outside prod). */
export const useCertificateAuthMode = (): CertificateAuthMode => certificateAuthMode(useAppEnv())
