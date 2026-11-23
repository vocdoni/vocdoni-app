import type { ComponentType } from 'react'

/**
 * A route `lazy` that renders a page's default export with fixed props. The current page stays on screen until the
 * next one loads. One result per call, so routes that share it keep the same component type and the page's state.
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
