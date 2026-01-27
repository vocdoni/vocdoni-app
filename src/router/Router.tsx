import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { useAuthRoutes, useCreateOrganizationRoutes } from './routes/auth'
import { useDashboardRoutes } from './routes/dashboard'
import { useHomeRoute } from './routes/home'
import { useRootRoutes } from './routes/root'

export const RoutesProvider = () => {
  const home = useHomeRoute()
  const root = useRootRoutes()
  const auth = useAuthRoutes()
  const dashboard = useDashboardRoutes()
  const createOrganizationRoute = useCreateOrganizationRoutes()

  const router = createBrowserRouter([home, root, auth, dashboard, createOrganizationRoute], {
    basename: import.meta.env.BASE_URL,
  })

  return <RouterProvider router={router} future={{ v7_startTransition: true }} />
}
