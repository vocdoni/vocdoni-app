import { useElection, useElectionAuth } from '@vocdoni/react-components'
import { createContext, useContext, useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { readCertReturn, type CertReturn } from '~components/Process/CertAuth/cert-auth'
import { AuthFieldType, CensusData, TwoFaFieldType } from './basics'

// The voter page's identify and code steps (the dashboard-wide identify dialog is the SDK's CspAuth). Contact info
// captured at step 0 so step 1 can resend the challenge; the auth tokens live in the ElectionProvider session.
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
  // The certificate gateway's answer, read once from the fragment of a certificate census's voting page.
  certReturn: CertReturn | null
  clearCertReturn: () => void
  // Back to step 0 with no stored contact.
  resetFlow: () => void
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
  const { election } = useElection()

  // Bails out when the flow is already at its start, so the mount-time run
  // doesn't re-render every consumer for nothing.
  const resetFlow = () => {
    setCurrentStep(0)
    setAuthData((prev) => (prev.email || prev.phone ? {} : prev))
  }

  // The provider outlives one identify flow, so once the flow completes start the
  // next one from scratch: after a logout, step 1 would point at a cleared token.
  useEffect(() => {
    if (connected) {
      resetFlow()
      setCertReturn(null)
    }
  }, [connected])

  // Defensive: process pages are server-routed (clientRouting: false), so the
  // process never changes under a mounted provider today. Should that change,
  // a pending step 1 must not carry over to another process.
  useEffect(resetFlow, [processId])

  // Declared after the reset above, which must not clear the answer read here.
  // Read once: the read strips the fragment.
  const certAuth = !!election?.census?.certAuth
  const electionId = election?.id
  useEffect(() => {
    if (!electionId || !certAuth) return
    const found = readCertReturn(electionId)
    // A voter already connected keeps no answer: its code is spent, and must not be redeemed if the session is lost.
    if (found && !connected) setCertReturn(found)
  }, [electionId, certAuth, connected])

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
    certReturn,
    clearCertReturn: () => setCertReturn(null),
    resetFlow,
  }

  return <CspAuthContext.Provider value={value}>{children}</CspAuthContext.Provider>
}

// For helpers that also run outside the voter page's provider (the census's auth fields, when there is one).
export const useOptionalCspAuthContext = () => useContext(CspAuthContext)

export const useCspAuthContext = () => {
  const context = useOptionalCspAuthContext()
  if (!context) {
    throw new Error('useCspAuthContext must be used within an CspAuthProvider')
  }
  return context
}
