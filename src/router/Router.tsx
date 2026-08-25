import { useEffect, useMemo, useRef } from 'react'
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

  // Create the router once. RouterProvider seeds its rendered location from
  // `useState(router.state)` — from the FIRST router only — and afterwards updates it
  // solely from whichever router is currently subscribed. Each router also owns its own
  // history instance, so one router's pushState never reaches another. Recreating it per
  // render therefore left any `navigate` captured before the re-render pushing to a
  // router nobody listens to: the URL changed, the page didn't (#1746).
  //
  // Capturing the route objects once is safe because no loader depends on anything that
  // changes: `client` and `queryClient` are stable for the app's lifetime, and everything
  // else a loader reads comes from the URL. Data keyed by session state (the elections
  // list, which used to close over `currentAddress`) is fetched with useQuery instead.
  const router = useMemo(
    () =>
      createBrowserRouter([home, root, auth, dashboard, integrators, integratorsAuth, createOrganizationRoute], {
        basename: resolvedBasename,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resolvedBasename]
  )

  // Dispose the router we just replaced — a language switch is the only thing that
  // replaces one — so its popstate/pagehide listeners go away with it.
  //
  // Deliberately not an unmount cleanup: React can run an effect's cleanup and then re-run
  // the effect on the same component instance, and vike-react wraps every page in
  // StrictMode, which does exactly that on mount. useMemo keeps the same router across it,
  // so disposing there would abort the in-flight initial navigation (dispose() aborts the
  // pending navigation controller) and hand the second mount a dead router that never
  // initializes — a blank page on every route with a loader.
  const previousRouter = useRef(router)
  useEffect(() => {
    if (previousRouter.current === router) return
    previousRouter.current.dispose()
    previousRouter.current = router
  }, [router])

  // Key by basename so a language switch — the only time the basename changes — remounts
  // the router to adopt the new prefix, since RouterProvider keeps the first router's
  // state and won't re-init from a changed `router` prop.
  return <RouterProvider key={resolvedBasename} router={router} future={{ v7_startTransition: true }} />
}
