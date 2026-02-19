import type { ClientProviderComponentProps } from '@vocdoni/react-providers'
import { ClientProvider as BaseClientProvider } from '@vocdoni/react-providers'
import { ToastProvider } from '~components/Toast'
import { ConfirmProvider } from '../confirm/ConfirmProvider'

export const ClientProvider = ({ children, ...props }: ClientProviderComponentProps) => (
  <ToastProvider>
    <BaseClientProvider {...props}>
      <ConfirmProvider>{children}</ConfirmProvider>
    </BaseClientProvider>
  </ToastProvider>
)
