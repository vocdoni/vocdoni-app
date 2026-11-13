import { type ComponentType, lazy, type LazyExoticComponent } from 'react'

type Module<T> = { default: T }

export type PreloadableComponent<T extends ComponentType<any>> = LazyExoticComponent<T> & {
  preload: () => Promise<Module<T>>
}

// A route handle that lets the router start a lazy page's import as soon as the route matches.
export type PreloadHandle = { preload: () => Promise<unknown> }

/**
 * React.lazy plus a `preload()` that starts the same import ahead of the first render. A failed
 * import is forgotten, so the render retries it instead of reusing the failure.
 */
export const lazyWithPreload = <T extends ComponentType<any>>(
  factory: () => Promise<Module<T>>
): PreloadableComponent<T> => {
  let pending: Promise<Module<T>> | undefined
  const load = () => {
    pending ??= factory().catch((error) => {
      pending = undefined
      throw error
    })
    return pending
  }
  return Object.assign(lazy(load), { preload: load })
}

// Starts the imports of every matched route that declares a preload handle.
export const preloadMatchedRoutes = (matches: ReadonlyArray<{ route: { handle?: unknown } }> = []) => {
  for (const { route } of matches) {
    const preload = (route.handle as Partial<PreloadHandle> | undefined)?.preload
    // A failure surfaces when the page renders, through its error boundary.
    preload?.().catch(() => undefined)
  }
}
