// Integrators private app - minimal separate dashboard for integrator organizations
import { lazy } from 'react'
import Error from '~elements/Error'
import LayoutIntegrators from '~elements/LayoutIntegrators'
import AccountProtectedRoute from '~src/router/AccountProtectedRoute'
import OrganizationTypeGuard from '~src/router/OrganizationTypeGuard'
import { Routes } from '.'
import { SuspenseLoader } from '../SuspenseLoader'

// Minimal integrators placeholder page
const IntegratorsDashboard = lazy(() => import('~elements/integrators'))

export const useIntegratorsRoutes = () => {
  return {
    element: (
      <SuspenseLoader>
        <AccountProtectedRoute />
      </SuspenseLoader>
    ),
    children: [
      {
        // Guard that redirects non-integrators to /admin
        element: (
          <SuspenseLoader>
            <OrganizationTypeGuard redirectPath={Routes.integrators.base} />
          </SuspenseLoader>
        ),
        children: [
          {
            element: (
              <SuspenseLoader>
                <LayoutIntegrators />
              </SuspenseLoader>
            ),
            children: [
              {
                path: Routes.integrators.base,
                element: (
                  <SuspenseLoader>
                    <IntegratorsDashboard />
                  </SuspenseLoader>
                ),
                errorElement: <Error />,
              },
            ],
          },
        ],
      },
    ],
  }
}
