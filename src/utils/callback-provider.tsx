import { ReactNode, createContext, useContext } from 'react'

// Define the context type
type CallbackContextType = {
  success: () => void
  error: () => void
}

// Use `createContext` to initialize the context and its provider
const CallbackContext = createContext<CallbackContextType | undefined>(undefined)

// Wrapper hook to make the context optional
export const useCallbackContext = (): CallbackContextType => {
  const context = useContext(CallbackContext)
  if (context) return context
  return {
    success: () => {}, // default no-op function
    error: () => {}, // default no-op function
  }
}

// CallbackProvider component to wrap around components needing callback functionality
export const CallbackProvider = ({
  children,
  success,
  error = () => {}, // default to a no-op if not provided
}: {
  children: ReactNode
  success: () => void
  error?: () => void
}) => {
  const value = { success, error }

  return <CallbackContext.Provider value={value}>{children}</CallbackContext.Provider>
}
