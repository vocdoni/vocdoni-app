import { createContext, useContext, useState, type Dispatch, type SetStateAction } from 'react'
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
}: {
  children: React.ReactNode
  censusData?: CensusData | null
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [authData, setAuthData] = useState<CspAuthData>({})

  // Process census data to determine auth fields
  const authFields = censusData?.authFields || []
  const twoFaFields = censusData?.twoFaFields || []

  return (
    <CspAuthContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        authData,
        setAuthData,
        censusData: censusData ?? null,
        authFields,
        twoFaFields,
      }}
    >
      {children}
    </CspAuthContext.Provider>
  )
}

export const useCspAuthContext = () => {
  const context = useContext(CspAuthContext)
  if (!context) {
    throw new Error('useCspAuthContext must be used within an CspAuthProvider')
  }
  return context
}
