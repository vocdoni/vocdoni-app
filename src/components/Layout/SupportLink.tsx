import { Link, LinkProps } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router'
import { Routes } from '~routes'

// An inline link to the support page, meant to be passed to Trans as one of its `components`.
// Trans replaces its component's children with the translated text, so the RouterLink must live
// inside this wrapper; passed inline, `asChild` would be left without a child and Chakra would throw.
export const SupportLink = ({ children, ...props }: Omit<LinkProps, 'asChild'>) => (
  <Link asChild {...props}>
    <RouterLink to={Routes.dashboard.settings.support}>{children}</RouterLink>
  </Link>
)
