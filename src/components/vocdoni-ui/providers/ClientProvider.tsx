import { ClientProvider as BaseClientProvider } from '@vocdoni/react-providers'
import type { ClientProviderComponentProps } from '@vocdoni/react-providers'
import { ConfirmProvider } from '../confirm/ConfirmProvider'
import { ToastProvider } from '~shared/Toast'

export const ClientProvider = ({ children, ...props }: ClientProviderComponentProps) => (
  <ToastProvider>
    <BaseClientProvider {...props}>
      <ConfirmProvider>{children}</ConfirmProvider>
    </BaseClientProvider>
  </ToastProvider>
)
