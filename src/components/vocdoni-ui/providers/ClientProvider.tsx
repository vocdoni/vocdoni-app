import { ClientProvider as BaseClientProvider } from '@vocdoni/react-providers'
import type { ClientProviderComponentProps } from '@vocdoni/react-providers'

export const ClientProvider = ({ children, ...props }: ClientProviderComponentProps) => (
  <BaseClientProvider {...props}>{children}</BaseClientProvider>
)
