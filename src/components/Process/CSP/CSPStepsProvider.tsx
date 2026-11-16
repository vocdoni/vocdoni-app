import { useElectionAuth } from '@vocdoni/react-components'
import { createContext, useContext, useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { AuthFieldType, CensusData, TwoFaFieldType } from './basics'
import { readCertReturn, type CertReturn } from './cert-auth'

// Contact info captured at step 0 so step 1 can resend the challenge. The auth
// tokens themselves live in the ProcessProvider session, not here.
export type CspAuthData = {
  email?: string
  phone?: string
}

type CspAuthContextState = {
  currentStep: number
  setCurrentStep: (step: number) => void
  authData: CspAuthData
  setAuthData: Dispatch<SetStateAction<CspAuthData>>
  censusData: CensusData | null
  authFields: AuthFieldType[]
  twoFaFields: TwoFaFieldType[]
  // The process this flow authenticates against.
  processId?: string
  // Back to step 0 with no stored contact.
  resetFlow: () => void
  // A census whose voters sign in with a digital certificate.
  certAuth: boolean
  // The certificate gateway's answer found in the URL fragment on load, until it is handled.
  certReturn: CertReturn | null
  setCertReturn: (certReturn: CertReturn | null) => void
}

const CspAuthContext = createContext<CspAuthContextState | undefined>(undefined)

export const CspAuthProvider = ({
  children,
  censusData,
  processId,
}: {
  children: React.ReactNode
  censusData?: CensusData | null
  // The process the flow authenticates against; a change restarts the flow.
  processId?: string
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [authData, setAuthData] = useState<CspAuthData>({})
  const [certReturn, setCertReturn] = useState<CertReturn | null>(null)
  const { connected } = useElectionAuth()
  const certAuth = !!censusData?.certAuth

  // Bails out when the flow is already at its start, so the mount-time run
  // doesn't re-render every consumer for nothing.
  const resetFlow = () => {
    setCurrentStep(0)
    setAuthData((prev) => (prev.email || prev.phone ? {} : prev))
  }

  // A single provider may outlive one identify flow (it's shared by every
  // Identify button on the process page), so once the flow completes start the
  // next one from scratch: after a logout, step 1 would point at a cleared token.
  useEffect(() => {
    if (connected) resetFlow()
  }, [connected])

  // Defensive: process pages are server-routed (clientRouting: false), so the
  // process never changes under a mounted provider today. Should that change,
  // a pending step 1 must not carry over to another process.
  useEffect(resetFlow, [processId])

  // The certificate gateway sends the voter back with its answer in the fragment: read it once the
  // process (and so whether its census uses certificates) is known.
  useEffect(() => {
    if (!processId || !certAuth) return
    const found = readCertReturn(processId)
    if (found) setCertReturn(found)
  }, [processId, certAuth])

  useEffect(() => {
    if (connected) setCertReturn(null)
  }, [connected])

  const value: CspAuthContextState = {
    currentStep,
    setCurrentStep,
    authData,
    setAuthData,
    censusData: censusData ?? null,
    // Process census data to determine auth fields
    authFields: censusData?.authFields || [],
    twoFaFields: censusData?.twoFaFields || [],
    processId,
    resetFlow,
    certAuth,
    certReturn,
    setCertReturn,
  }

  return <CspAuthContext.Provider value={value}>{children}</CspAuthContext.Provider>
}

// Lets CspAuth reuse a provider mounted higher up, so several Identify buttons
// on the same page share one flow instead of each keeping its own step.
export const useOptionalCspAuthContext = () => useContext(CspAuthContext)

export const useCspAuthContext = () => {
  const context = useOptionalCspAuthContext()
  if (!context) {
    throw new Error('useCspAuthContext must be used within an CspAuthProvider')
  }
  return context
}
