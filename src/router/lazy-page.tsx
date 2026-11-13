import type { ComponentType } from 'react'

/**
 * A route `lazy` that loads a page module and renders its default export, with fixed props if
 * given. The router loads it before it commits a navigation, so the current page stays on
 * screen meanwhile, and on the first load it starts as soon as the router is created.
 *
 * One result per lazyPage() call: routes that share it get the same component type, so the page
 * keeps its state when a navigation moves between them.
 */
export const lazyPage = <P extends object>(load: () => Promise<{ default: ComponentType<P> }>, props?: P) => {
  let loaded: Promise<{ Component: ComponentType }> | undefined
  return () => {
    loaded ??= load().then(({ default: Page }) => ({
      Component: props ? () => <Page {...props} /> : (Page as ComponentType),
    }))
    // react-router renders nothing for a route whose `lazy` rejected (its error element is skipped
    // while `lazy` is still set). Throwing while rendering reaches the route's error element.
    return loaded.catch((error: unknown) => {
      loaded = undefined
      const Failed = (): never => {
        throw error
      }
      return { Component: Failed as ComponentType }
    })
  }
}
