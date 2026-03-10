import type { ClientProviderComponentProps } from '@vocdoni/react-components'
import { ClientProvider as BaseClientProvider } from '@vocdoni/react-components'
import { ConfirmProvider } from '~components/Confirm/ConfirmProvider'
import { ToastProvider } from '~components/Toast'

export const ClientProvider = ({ children, ...props }: ClientProviderComponentProps) => (
  <ToastProvider>
    <BaseClientProvider {...props}>
      <ConfirmProvider>{children}</ConfirmProvider>
    </BaseClientProvider>
  </ToastProvider>
)
