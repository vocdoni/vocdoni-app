import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import PublicLayout from './PublicLayout'

const Layout = () => {
  const location = useLocation()

  return (
    <PublicLayout pathname={location.pathname}>
      <ScrollRestoration />
      <Outlet />
    </PublicLayout>
  )
}

export default Layout
