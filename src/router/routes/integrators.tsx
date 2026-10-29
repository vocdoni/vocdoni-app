// Integrators private app - separate dashboard for integrator organizations
import { lazy } from 'react'
import { Navigate } from 'react-router'
import OrganizationSupport from '~components/Organization/Dashboard/Support'
import Error from '~elements/Error'
import LayoutIntegrators from '~elements/LayoutIntegrators'
import LayoutIntegratorsAuth from '~elements/LayoutIntegratorsAuth'
import AccountProtectedRoute from '~src/router/AccountProtectedRoute'
import IntegratorOrgGuard from '~src/router/IntegratorOrgGuard'
import NonLoggedRoute from '~src/router/NonLoggedRoute'
import { useWalletAccess } from '~queries/wallet'
import { redirectLegacyPath, Routes } from '.'
import { SuspenseLoader } from '../SuspenseLoader'

// Admins and managers can read the wallet, so they open on billing; everyone else gets support.
const ConfigurationIndex = () => {
  const { canView } = useWalletAccess()
  const target = canView ? Routes.integrators.configuration.billing : Routes.integrators.configuration.support
  return <Navigate to={target} replace />
}

const IntegratorsDashboard = lazy(() => import('~elements/integrators'))
const IntegratorsSignin = lazy(() => import('~elements/integrators/signin'))
const IntegratorsSignup = lazy(() => import('~elements/integrators/signup'))
const IntegratorsPasswordForgot = lazy(() => import('~elements/integrators/password'))
const IntegratorsPasswordReset = lazy(() => import('~elements/integrators/password/reset'))
const IntegratorsConfiguration = lazy(() => import('~elements/integrators/configuration'))
const WalletPanel = lazy(() => import('~components/Wallet/Wallet'))
const IntegratorsManagedOrganizations = lazy(() => import('~elements/integrators/organizations'))
const IntegratorsApiKeys = lazy(() => import('~elements/integrators/api-keys'))

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
          {
            path: Routes.integrators.recovery,
            element: (
              <SuspenseLoader>
                <IntegratorsPasswordForgot />
              </SuspenseLoader>
            ),
          },
          {
            path: Routes.integrators.passwordReset,
            element: (
              <SuspenseLoader>
                <IntegratorsPasswordReset />
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
        <AccountProtectedRoute signInRoute={Routes.integrators.signIn} />
      </SuspenseLoader>
    ),
    children: [
      {
        // Layout first (always-visible sidebar/shell), then the guard renders either the pages,
        // the provisioning state, or the "not an integrator yet" notice in the content area.
        element: (
          <SuspenseLoader>
            <LayoutIntegrators />
          </SuspenseLoader>
        ),
        children: [
          {
            // Guard that provisions an integrator org when missing and shows the not-integrator
            // notice for non-integrator orgs.
            element: (
              <SuspenseLoader>
                <IntegratorOrgGuard />
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
                path: Routes.integrators.managedOrganizations,
                element: (
                  <SuspenseLoader>
                    <IntegratorsManagedOrganizations />
                  </SuspenseLoader>
                ),
                errorElement: <Error />,
              },
              {
                path: Routes.integrators.apiKeys,
                element: (
                  <SuspenseLoader>
                    <IntegratorsApiKeys />
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
                    element: <ConfigurationIndex />,
                  },
                  {
                    path: Routes.integrators.configuration.billing,
                    element: (
                      <SuspenseLoader>
                        <WalletPanel />
                      </SuspenseLoader>
                    ),
                  },
                  {
                    path: Routes.integrators.configuration.billingReturn,
                    element: (
                      <SuspenseLoader>
                        <WalletPanel />
                      </SuspenseLoader>
                    ),
                  },
                  {
                    path: Routes.integrators.configuration.legacySubscription,
                    ...redirectLegacyPath(Routes.integrators.configuration.billing),
                  },
                  {
                    path: Routes.integrators.configuration.legacyWallet,
                    ...redirectLegacyPath(Routes.integrators.configuration.billing),
                  },
                  {
                    path: Routes.integrators.configuration.legacyWalletReturn,
                    ...redirectLegacyPath(Routes.integrators.configuration.billingReturn),
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
