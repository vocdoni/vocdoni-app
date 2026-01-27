import { ActionsProvider as RActionsProvider } from '@vocdoni/react-providers'
import { type ReactNode } from 'react'
import { useActionsToast } from './use-actions-toast'

const ChakraInternalActionsProvider = ({ children }: { children: ReactNode }) => {
  useActionsToast()
  return <>{children}</>
}

export const ActionsProvider = ({ children }: { children: ReactNode }) => (
  <RActionsProvider>
    <ChakraInternalActionsProvider>{children}</ChakraInternalActionsProvider>
  </RActionsProvider>
)
