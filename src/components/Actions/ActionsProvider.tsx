import { type ReactNode } from 'react'
import { ActionsProvider as SaasActionsProvider } from './ActionsContext'
import { useActionsToast } from './use-actions-toast'

const ChakraInternalActionsProvider = ({ children }: { children: ReactNode }) => {
  useActionsToast()
  return <>{children}</>
}

export const ActionsProvider = ({ children }: { children: ReactNode }) => (
  <SaasActionsProvider>
    <ChakraInternalActionsProvider>{children}</ChakraInternalActionsProvider>
  </SaasActionsProvider>
)
