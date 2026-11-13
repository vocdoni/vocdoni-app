import { createContext, type ReactNode, useCallback, useContext } from 'react'
import { matchRoutes, type RouteObject } from 'react-router'

type PrefetchRoute = (to: string) => void

/**
 * Starts downloading the code of every route `to` matches that declares a route `lazy`, so a
 * navigation there does not wait for it. The bundler caches each chunk, so the router's own
 * call to the same `lazy` later resolves at once. Routes already loaded have no `lazy` left.
 */
export const prefetchRouteCode = (routes: RouteObject[] | undefined, to: string, hops = 0) => {
  for (const { route } of matchRoutes(routes ?? [], to) ?? []) {
    // A failure surfaces on the real navigation, through the route's error boundary.
    if (typeof route.lazy === 'function') Promise.resolve(route.lazy()).catch(() => undefined)
    // An index redirect (a section sending to its first tab) is followed to the tab's code too
    const next = (route.handle as { redirectsTo?: string } | undefined)?.redirectsTo
    if (next && hops < 2) prefetchRouteCode(routes, next, hops + 1)
  }
}

const RoutePrefetchContext = createContext<PrefetchRoute>(() => undefined)

export const RoutePrefetchProvider = ({ routes, children }: { routes?: RouteObject[]; children: ReactNode }) => {
  const prefetch = useCallback<PrefetchRoute>((to) => prefetchRouteCode(routes, to), [routes])
  return <RoutePrefetchContext.Provider value={prefetch}>{children}</RoutePrefetchContext.Provider>
}

// Returns a function that prefetches a path's route code; a no-op outside RoutesProvider.
export const usePrefetchRoute = () => useContext(RoutePrefetchContext)
