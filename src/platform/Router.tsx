import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import OrgGuard from '~platform/components/Integrator/OrgGuard'
import DashboardLayout from '~platform/components/Layout/DashboardLayout'
import ProtectedRoute from '~platform/auth/ProtectedRoute'
import ForgotPassword from '~platform/pages/auth/ForgotPassword'
import Login from '~platform/pages/auth/Login'
import Register from '~platform/pages/auth/Register'
import ResetPassword from '~platform/pages/auth/ResetPassword'
import Verify from '~platform/pages/auth/Verify'
import ApiKeysPage from '~platform/pages/ApiKeys'
import ConfigurationPage from '~platform/pages/Configuration'
import ManagedOrganizationsPage from '~platform/pages/ManagedOrganizations'
import OverviewPage from '~platform/pages/Overview'
import { Routes } from '~platform/routes'

const router = createBrowserRouter([
  { path: Routes.auth.login, element: <Login /> },
  { path: Routes.auth.register, element: <Register /> },
  { path: Routes.auth.verify, element: <Verify /> },
  { path: Routes.auth.forgotPassword, element: <ForgotPassword /> },
  { path: Routes.auth.resetPassword, element: <ResetPassword /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            element: <OrgGuard />,
            children: [
              { path: Routes.dashboard.overview, element: <OverviewPage /> },
              { path: Routes.dashboard.organizations, element: <ManagedOrganizationsPage /> },
              { path: Routes.dashboard.apiKeys, element: <ApiKeysPage /> },
              { path: Routes.dashboard.configuration, element: <ConfigurationPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to={Routes.dashboard.overview} replace /> },
])

export const AppRouter = () => <RouterProvider router={router} />
