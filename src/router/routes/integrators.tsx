// Integrators private app - separate dashboard for integrator organizations
import { lazy } from 'react'
import { Navigate } from 'react-router-dom'
import OrganizationSupport from '~components/Organization/Dashboard/Support'
import Error from '~elements/Error'
import LayoutIntegrators from '~elements/LayoutIntegrators'
import LayoutIntegratorsAuth from '~elements/LayoutIntegratorsAuth'
import AccountProtectedRoute from '~src/router/AccountProtectedRoute'
import IntegratorOrgGuard from '~src/router/IntegratorOrgGuard'
import NonLoggedRoute from '~src/router/NonLoggedRoute'
import { Routes } from '.'
import { SuspenseLoader } from '../SuspenseLoader'

const IntegratorsDashboard = lazy(() => import('~elements/integrators'))
const IntegratorsSignin = lazy(() => import('~elements/integrators/signin'))
const IntegratorsSignup = lazy(() => import('~elements/integrators/signup'))
const IntegratorsConfiguration = lazy(() => import('~elements/integrators/configuration'))
const IntegratorSubscriptionTab = lazy(() => import('~components/Integrator/SubscriptionTab'))

// Independent single-column sign in / sign up for the integrators app.
export const useIntegratorsAuthRoutes = () => {
  return {
    element: <NonLoggedRoute redirectTo={Routes.integrators.base} />,
    children: [
      {
        element: <LayoutIntegratorsAuth />,
        children: [
          {
            path: Routes.integrators.signIn,
            element: (
              <SuspenseLoader>
                <IntegratorsSignin />
              </SuspenseLoader>
            ),
          },
          {
            path: Routes.integrators.signUp,
            element: (
              <SuspenseLoader>
                <IntegratorsSignup />
              </SuspenseLoader>
            ),
          },
        ],
      },
    ],
  }
}

export const useIntegratorsRoutes = () => {
  return {
    element: (
      <SuspenseLoader>
        <AccountProtectedRoute />
      </SuspenseLoader>
    ),
    children: [
      {
        // Guard that provisions an integrator org when missing and redirects non-integrators to /admin
        element: (
          <SuspenseLoader>
            <IntegratorOrgGuard />
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
              {
                path: Routes.integrators.configuration.base,
                element: (
                  <SuspenseLoader>
                    <IntegratorsConfiguration />
                  </SuspenseLoader>
                ),
                errorElement: <Error />,
                children: [
                  {
                    index: true,
                    element: <Navigate to={Routes.integrators.configuration.subscription} replace />,
                  },
                  {
                    path: Routes.integrators.configuration.subscription,
                    element: (
                      <SuspenseLoader>
                        <IntegratorSubscriptionTab />
                      </SuspenseLoader>
                    ),
                  },
                  {
                    path: Routes.integrators.configuration.support,
                    element: (
                      <SuspenseLoader>
                        <OrganizationSupport />
                      </SuspenseLoader>
                    ),
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  }
}
