import { type ReactNode } from 'react'
import { ActionsProvider as SaasActionsProvider } from './ActionsContext'
import { useActionsToast } from './use-actions-toast'

const ChakraInternalActionsProvider = ({ children }: { children: ReactNode }) => {
  useActionsToast()
  return <>{children}</>
}

// useConfirm() calls under this provider resolve through the app-wide ConfirmProvider
// mounted in AppRuntimeProviders.
export const ActionsProvider = ({ children }: { children: ReactNode }) => (
  <SaasActionsProvider>
    <ChakraInternalActionsProvider>{children}</ChakraInternalActionsProvider>
  </SaasActionsProvider>
)
