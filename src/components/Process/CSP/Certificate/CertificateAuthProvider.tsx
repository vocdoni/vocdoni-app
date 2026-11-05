import { createContext, useContext, type ReactNode } from 'react'
import { useCertificateAuthMode } from '~queries/certificateAuth/mode'
import type { CertAuthPurpose } from '~queries/certificateAuth/types'
import { useCertificateAuthApi } from '~queries/certificateAuth/useCertificateAuthApi'
import { useCertificateAuth } from './useCertificateAuth'

type CertificateAuthValue = ReturnType<typeof useCertificateAuth> & { purpose: CertAuthPurpose }

const CertificateAuthContext = createContext<CertificateAuthValue | null>(null)

// The mock "auth host" is the page itself: a hash-only replace would not reload, so force it.
const mockNavigate = (url: string) => {
  window.location.replace(url)
  window.location.reload()
}

/** The one certificate flow per page: the panel above the questions and the sticky button share it. */
export const CertificateAuthProvider = ({
  processId,
  purpose,
  children,
}: {
  processId: string | undefined
  purpose: CertAuthPurpose
  children: ReactNode
}) => {
  const mode = useCertificateAuthMode()
  const api = useCertificateAuthApi()
  const value = useCertificateAuth({
    processId,
    purpose,
    api,
    navigate: mode === 'mock' ? mockNavigate : undefined,
    allowInsecureAuthUrl: mode === 'mock',
  })
  return <CertificateAuthContext.Provider value={{ ...value, purpose }}>{children}</CertificateAuthContext.Provider>
}

/** Null outside a certificate vote: callers render nothing new then. */
export const useCertificateAuthContext = () => useContext(CertificateAuthContext)
