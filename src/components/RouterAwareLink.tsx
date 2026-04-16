import { type ComponentPropsWithoutRef, forwardRef } from 'react'
import { Link as ReactRouterLink, useInRouterContext } from 'react-router-dom'
import { shouldBypassRouterBasename } from '~src/router/appNavigation'

type RouterAwareLinkProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'> & {
  to: string
}

export const RouterAwareLink = forwardRef<HTMLAnchorElement, RouterAwareLinkProps>(function RouterAwareLink(
  { to, ...props },
  ref
) {
  const inRouterContext = useInRouterContext()

  if (inRouterContext && !shouldBypassRouterBasename(to)) {
    return <ReactRouterLink ref={ref} to={to} {...props} />
  }

  return <a ref={ref} href={to} {...props} />
})
