import type { ClientProviderComponentProps } from '@vocdoni/react-providers'
import { ClientProvider as BaseClientProvider } from '@vocdoni/react-providers'
import { ConfirmProvider as ReactComponentsConfirmProvider } from '@vocdoni/react-components'
import { ToastProvider } from '~components/Toast'
import { ConfirmProvider } from '~components/Confirm/ConfirmProvider'

export const ClientProvider = ({ children, ...props }: ClientProviderComponentProps) => (
  <ToastProvider>
    <BaseClientProvider {...props}>
      <ReactComponentsConfirmProvider>
        <ConfirmProvider>{children}</ConfirmProvider>
      </ReactComponentsConfirmProvider>
    </BaseClientProvider>
  </ToastProvider>
)
