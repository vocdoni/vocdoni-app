import { useMemo } from 'react'
import { httpCertificateAuthApi, type CertificateAuthApi } from './client'
import { createMockCertificateAuthApi } from './mock'
import { useCertificateAuthMode } from './mode'

/** The contract adapter for this deployment: the backend, or the in-app mock outside prod. */
export const useCertificateAuthApi = (): CertificateAuthApi => {
  const mode = useCertificateAuthMode()
  return useMemo(() => (mode === 'mock' ? createMockCertificateAuthApi() : httpCertificateAuthApi), [mode])
}
