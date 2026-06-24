import { Navigate, Outlet } from 'react-router-dom'
import { Routes } from '~platform/routes'
import { useAuth } from './AuthContext'

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to={Routes.auth.login} replace />
  }
  return <Outlet />
}

export default ProtectedRoute
