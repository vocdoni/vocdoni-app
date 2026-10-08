import { type ComponentPropsWithoutRef, forwardRef } from 'react'
import { Link as ReactRouterLink, useInRouterContext } from 'react-router'

type RouterAwareLinkProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'> & {
  to: string
  /** React Router location state; dropped when rendered outside a router, as a plain anchor cannot carry it. */
  state?: unknown
}

export const RouterAwareLink = forwardRef<HTMLAnchorElement, RouterAwareLinkProps>(function RouterAwareLink(
  { to, state, ...props },
  ref
) {
  const inRouterContext = useInRouterContext()

  if (inRouterContext) {
    return <ReactRouterLink ref={ref} to={to} state={state} {...props} />
  }

  return <a ref={ref} href={to} {...props} />
})
