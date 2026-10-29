import { ReactNode, Suspense } from 'react'
import { PageLoader, type PageLoaderProps } from '~components/ui/Loader'

type SuspenseLoaderProps = PageLoaderProps & {
  children: ReactNode
}

export const SuspenseLoader = ({ children, ...props }: SuspenseLoaderProps) => (
  <Suspense fallback={<PageLoader {...props} />}>{children}</Suspense>
)
