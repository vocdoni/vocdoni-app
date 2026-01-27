import { ToastProvider } from '@chakra-ui/react'
import { ClientProvider as BaseClientProvider } from '@vocdoni/react-providers'
import type { ClientProviderComponentProps } from '@vocdoni/react-providers'
import { ConfirmProvider } from '../confirm/ConfirmProvider'

export const ClientProvider = ({ children, ...props }: ClientProviderComponentProps) => (
  <>
    <ToastProvider />
    <BaseClientProvider {...props}>
      <ConfirmProvider>{children}</ConfirmProvider>
    </BaseClientProvider>
  </>
)
