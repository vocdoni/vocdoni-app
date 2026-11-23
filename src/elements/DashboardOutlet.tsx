import { Suspense } from 'react'
import { Outlet } from 'react-router'
import { PageSkeleton } from '~components/ui/PageSkeleton'
import { NavigationPendingBar } from '~components/Layout/NavigationPendingBar'

/**
 * The content area of the dashboard shell. Pages load their code through route `lazy`, so the
 * router keeps the current page on screen (with the pending bar) until the next one is ready.
 * The Suspense boundary only shows on the first load of something that suspends while rendering.
 */
export const DashboardOutlet = ({ context }: { context?: unknown }) => (
  <>
    <NavigationPendingBar />
    <Suspense fallback={<PageSkeleton />}>
      <Outlet context={context} />
    </Suspense>
  </>
)
