import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { useAuthRoutes, useCreateOrganizationRoutes } from './routes/auth'
import { useDashboardRoutes } from './routes/dashboard'
import { useIntegratorsAuthRoutes, useIntegratorsRoutes } from './routes/integrators'
import { useHomeRoute } from './routes/home'
import { useRootRoutes } from './routes/root'

export const RoutesProvider = ({ basename }: { basename?: string }) => {
  const home = useHomeRoute()
  const root = useRootRoutes()
  const auth = useAuthRoutes()
  const dashboard = useDashboardRoutes()
  const integrators = useIntegratorsRoutes()
  const integratorsAuth = useIntegratorsAuthRoutes()
  const createOrganizationRoute = useCreateOrganizationRoutes()

  const resolvedBasename = basename ?? import.meta.env.BASE_URL

  // Recreate the router on every render. The route hooks return new objects
  // whenever the values their loaders close over change (client/account from
  // useClient, queryClient), so memoizing would pin stale loader closures —
  // e.g. the dashboard list loader would keep a pre-login `account`.
  const router = createBrowserRouter(
    [home, root, auth, dashboard, integrators, integratorsAuth, createOrganizationRoute],
    {
      basename: resolvedBasename,
    }
  )

  // Key by basename so a language switch — the only time the basename changes —
  // remounts the router to adopt the new prefix, since RouterProvider keeps the
  // first router's state and won't re-init from a changed `router` prop.
  return <RouterProvider key={resolvedBasename} router={router} future={{ v7_startTransition: true }} />
}
