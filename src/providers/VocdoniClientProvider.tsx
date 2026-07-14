import type { ClientProviderProps } from '@vocdoni/react-components'
import { ClientProvider as BaseClientProvider } from '@vocdoni/react-components'
import { ToastProvider } from '~components/Toast'

export const ClientProvider = ({ children, ...props }: ClientProviderProps) => (
  <ToastProvider>
    <BaseClientProvider {...props}>{children}</BaseClientProvider>
  </ToastProvider>
)
