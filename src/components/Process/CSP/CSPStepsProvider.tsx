import { useElectionAuth } from '@vocdoni/react-components'
import { createContext, useContext, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { AuthFieldType, CensusData, TwoFaFieldType } from './basics'

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
  const { connected } = useElectionAuth()

  // A single provider may outlive one identify flow (it's shared by every
  // Identify button on the process page), so once the flow completes start the
  // next one from scratch: after a logout, step 1 would point at a cleared token.
  // The same goes for client-side navigation to another process: its session
  // holds no pending token, so step 1 would fail.
  useEffect(() => {
    if (!connected) return
    setCurrentStep(0)
    setAuthData({})
  }, [connected])

  useEffect(() => {
    setCurrentStep(0)
    setAuthData({})
  }, [processId])

  // Memoized: the provider sits at the root of the process page, which
  // re-renders on every election/results poll; a fresh value each time would
  // re-render every Identify button and open step for nothing.
  const value = useMemo<CspAuthContextState>(
    () => ({
      currentStep,
      setCurrentStep,
      authData,
      setAuthData,
      censusData: censusData ?? null,
      // Process census data to determine auth fields
      authFields: censusData?.authFields || [],
      twoFaFields: censusData?.twoFaFields || [],
    }),
    [currentStep, authData, censusData]
  )

  return <CspAuthContext.Provider value={value}>{children}</CspAuthContext.Provider>
}

// Lets CspAuth reuse a provider mounted higher up, so several Identify buttons
// on the same page share one flow instead of each keeping its own step.
export const useOptionalCspAuthContext = () => useContext(CspAuthContext)

export const useCspAuthContext = () => {
  const context = useContext(CspAuthContext)
  if (!context) {
    throw new Error('useCspAuthContext must be used within an CspAuthProvider')
  }
  return context
}
