import { useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { isUnlocalizedPath } from '~i18n/public-language'

export const shouldBypassRouterBasename = (to: string) => to.startsWith('/') && isUnlocalizedPath(to)

export const navigateWithBasenameBypass = ({
  to,
  navigate,
  replace = false,
  location,
}: {
  to: string
  navigate: (to: string, options?: { replace?: boolean }) => void
  replace?: boolean
  location?: Pick<Location, 'assign' | 'replace'>
}) => {
  if (shouldBypassRouterBasename(to)) {
    const targetLocation = location ?? window.location
    if (replace) {
      targetLocation.replace(to)
    } else {
      targetLocation.assign(to)
    }
    return
  }

  navigate(to, replace ? { replace: true } : undefined)
}

export const useAppNavigate = () => {
  const navigate = useNavigate()

  return (to: string, options?: { replace?: boolean }) =>
    navigateWithBasenameBypass({
      to,
      navigate,
      replace: options?.replace,
    })
}

export const AppNavigate = ({ to, replace = false }: { to: string; replace?: boolean }) => {
  useEffect(() => {
    if (!shouldBypassRouterBasename(to)) return

    navigateWithBasenameBypass({
      to,
      replace,
      navigate: () => {},
    })
  }, [replace, to])

  if (shouldBypassRouterBasename(to)) {
    return null
  }

  return <Navigate to={to} replace={replace} />
}
