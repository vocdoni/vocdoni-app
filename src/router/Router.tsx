import { useMemo } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { useAuthRoutes, useCreateOrganizationRoutes } from './routes/auth'
import { useDashboardRoutes } from './routes/dashboard'
import { useHomeRoute } from './routes/home'
import { useRootRoutes } from './routes/root'

export const RoutesProvider = ({ basename }: { basename?: string }) => {
  const home = useHomeRoute()
  const root = useRootRoutes()
  const auth = useAuthRoutes()
  const dashboard = useDashboardRoutes()
  const createOrganizationRoute = useCreateOrganizationRoutes()

  const resolvedBasename = basename ?? import.meta.env.BASE_URL

  // Recreate the router only when the basename (language prefix) changes, so a
  // language switch swaps it in place instead of forcing a full reload. The
  // route trees are static, so capturing them once on (re)creation is intended.
  const router = useMemo(
    () => createBrowserRouter([home, root, auth, dashboard, createOrganizationRoute], { basename: resolvedBasename }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resolvedBasename]
  )

  // Key by basename: RouterProvider ignores a changed `router` prop, so remount
  // it when the language prefix changes to adopt the new basename.
  return <RouterProvider key={resolvedBasename} router={router} future={{ v7_startTransition: true }} />
}
