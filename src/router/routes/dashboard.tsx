// These aren't lazy loaded since they are main layouts and related components
import { useQueryClient } from '@tanstack/react-query'
import { Fragment } from 'react'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { generatePath, Navigate, Params, ShouldRevalidateFunctionArgs } from 'react-router'
import Error from '~elements/Error'
import LayoutDashboard from '~elements/LayoutDashboard'
import { QueryKeys } from '~queries/keys'
import OrganizationProtectedRoute from '~src/router/OrganizationProtectedRoute'
import ProtectedRoutes from '~src/router/ProtectedRoutes'
import { redirectLegacyPath, Routes } from '.'
import AccountProtectedRoute from '../AccountProtectedRoute'
import { PageLoader } from '~components/ui/Loader'
import { lazyWithPreload } from '../lazy-with-preload'
import PrivateAppGuard from '../PrivateAppGuard'
import { SuspenseLoader } from '../SuspenseLoader'

// elements/pages
const DashboardCreateOrg = lazyWithPreload(() => import('~elements/dashboard/organization/create'))
const DashboardProcesses = lazyWithPreload(() => import('~elements/dashboard/processes'))
const AllProcesses = lazyWithPreload(() => import('~elements/dashboard/processes/all'))
const EndedProcesses = lazyWithPreload(() => import('~elements/dashboard/processes/ended'))
const Drafts = lazyWithPreload(() => import('~elements/dashboard/processes/drafts'))
const DashboardProcessView = lazyWithPreload(() => import('~elements/dashboard/processes/view'))
const ProcessCreate = lazyWithPreload(() => import('~elements/dashboard/processes/create'))
const OrganizationEdit = lazyWithPreload(() => import('~components/Organization/Dashboard/Organization'))
const WalletPanel = lazyWithPreload(() => import('~components/Wallet/Wallet'))
const OrganizationSupport = lazyWithPreload(() => import('~components/Organization/Dashboard/Support'))
const OrganizationTeam = lazyWithPreload(() => import('~components/Organization/Dashboard/Team'))
const Profile = lazyWithPreload(() => import('~elements/dashboard/profile'))
const Settings = lazyWithPreload(() => import('~elements/dashboard/settings'))
const Memberbase = lazyWithPreload(() => import('~elements/dashboard/memberbase'))
const Members = lazyWithPreload(() => import('~elements/dashboard/memberbase/members'))
const Groups = lazyWithPreload(() => import('~elements/dashboard/memberbase/groups'))
const CensusCheckout = lazyWithPreload(() => import('~elements/dashboard/processes/census-checkout'))

// others
const Dashboard = lazyWithPreload(() => import('~elements/dashboard'))

export const shouldRevalidateDashboardProcess = ({
  currentParams,
  nextParams,
}: Pick<ShouldRevalidateFunctionArgs, 'currentParams' | 'nextParams'>) => currentParams.id !== nextParams.id

export const useDashboardRoutes = () => {
  const queryClient = useQueryClient()
  const { client } = useApiClient()

  return {
    // Only checks that a token exists, so the frame below renders right away. The waiting state
    // (session probe, profile, integrator redirect) is PrivateAppGuard's, inside the frame.
    element: (
      <SuspenseLoader>
        <AccountProtectedRoute waitForSession={false} />
      </SuspenseLoader>
    ),
    // Safety net for crashes in the guards or the layout. Pages below have their own, so their
    // crashes render inside the dashboard shell.
    errorElement: <Error />,
    children: [
      {
        // The frame shows no private data until the session is confirmed: it reads the
        // organization through the confirmed address and the profile from its own response.
        element: (
          <SuspenseLoader>
            <LayoutDashboard />
          </SuspenseLoader>
        ),
        children: [
          {
            // Redirects integrators to /integrators
            element: <PrivateAppGuard redirectPath={Routes.dashboard.base} />,
            children: [
              {
                path: Routes.dashboard.organizationCreate,
                element: (
                  <SuspenseLoader>
                    <DashboardCreateOrg />
                  </SuspenseLoader>
                ),
                handle: { preload: DashboardCreateOrg.preload },
                errorElement: <Error />,
              },
              {
                path: Routes.dashboard.base,
                element: (
                  <SuspenseLoader>
                    <Dashboard />
                  </SuspenseLoader>
                ),
                handle: { preload: Dashboard.preload },
                errorElement: <Error />,
              },
              {
                path: Routes.dashboard.profile,
                element: (
                  <SuspenseLoader>
                    <Profile />
                  </SuspenseLoader>
                ),
                handle: { preload: Profile.preload },
                errorElement: <Error />,
              },
              // Protected routes if no account created without organization
              {
                element: (
                  <SuspenseLoader>
                    <OrganizationProtectedRoute />
                  </SuspenseLoader>
                ),
                children: [
                  {
                    path: Routes.dashboard.process,
                    element: (
                      <SuspenseLoader>
                        <DashboardProcessView />
                      </SuspenseLoader>
                    ),
                    handle: { preload: DashboardProcessView.preload },
                    HydrateFallback: PageLoader,
                    loader: async ({ params }: { params: Params<string> }) => {
                      const rawElection = await client.elections.get(params.id!)
                      // Pre-seed the ElectionProvider query so the view renders without re-fetching
                      queryClient.setQueryData(QueryKeys.election.process(rawElection.id), rawElection)
                      return rawElection
                    },
                    shouldRevalidate: shouldRevalidateDashboardProcess,
                    errorElement: <Error />,
                    children: [
                      { index: true, element: <Fragment /> },
                      { path: Routes.dashboard.processResults, element: <Fragment /> },
                    ],
                  },
                  {
                    path: Routes.dashboard.census.checkout,
                    element: (
                      <SuspenseLoader>
                        <CensusCheckout />
                      </SuspenseLoader>
                    ),
                    handle: { preload: CensusCheckout.preload },
                    errorElement: <Error />,
                  },
                  {
                    path: Routes.dashboard.census.checkoutReturn,
                    element: (
                      <SuspenseLoader>
                        <CensusCheckout />
                      </SuspenseLoader>
                    ),
                    handle: { preload: CensusCheckout.preload },
                    errorElement: <Error />,
                  },
                  {
                    path: Routes.dashboard.processes.base,
                    element: (
                      <SuspenseLoader>
                        <DashboardProcesses />
                      </SuspenseLoader>
                    ),
                    handle: { preload: DashboardProcesses.preload },
                    children: [
                      {
                        index: true,
                        element: <Navigate to={generatePath(Routes.dashboard.processes.all)} replace />,
                      },
                      {
                        path: Routes.dashboard.processes.all,
                        element: (
                          <SuspenseLoader>
                            <AllProcesses />
                          </SuspenseLoader>
                        ),
                        handle: { preload: AllProcesses.preload },
                      },
                      {
                        path: Routes.dashboard.processes.ended,
                        element: (
                          <SuspenseLoader>
                            <EndedProcesses />
                          </SuspenseLoader>
                        ),
                        handle: { preload: EndedProcesses.preload },
                      },
                      {
                        path: Routes.dashboard.processes.drafts,
                        element: (
                          <SuspenseLoader>
                            <Drafts />
                          </SuspenseLoader>
                        ),
                        handle: { preload: Drafts.preload },
                      },
                    ],

                    errorElement: <Error />,
                  },
                  {
                    path: Routes.dashboard.memberbase.base,
                    element: (
                      <SuspenseLoader>
                        <Memberbase />
                      </SuspenseLoader>
                    ),
                    handle: { preload: Memberbase.preload },
                    errorElement: <Error />,
                    children: [
                      {
                        index: true,
                        element: (
                          <Navigate to={generatePath(Routes.dashboard.memberbase.members, { page: '1' })} replace />
                        ),
                      },
                      {
                        path: Routes.dashboard.memberbase.members,
                        element: (
                          <SuspenseLoader>
                            <Members />
                          </SuspenseLoader>
                        ),
                        handle: { preload: Members.preload },
                      },
                      {
                        path: Routes.dashboard.memberbase.groups,
                        element: (
                          <SuspenseLoader>
                            <Groups />
                          </SuspenseLoader>
                        ),
                        handle: { preload: Groups.preload },
                      },
                    ],
                  },
                  {
                    path: Routes.dashboard.settings.base,
                    element: (
                      <SuspenseLoader>
                        <Settings />
                      </SuspenseLoader>
                    ),
                    handle: { preload: Settings.preload },
                    errorElement: <Error />,
                    children: [
                      {
                        index: true,
                        element: <Navigate to={Routes.dashboard.settings.organization} replace />,
                      },
                      {
                        path: Routes.dashboard.settings.organization,
                        element: (
                          <SuspenseLoader>
                            <OrganizationEdit />
                          </SuspenseLoader>
                        ),
                        handle: { preload: OrganizationEdit.preload },
                      },
                      {
                        path: Routes.dashboard.settings.team,
                        element: (
                          <SuspenseLoader>
                            <OrganizationTeam />
                          </SuspenseLoader>
                        ),
                        handle: { preload: OrganizationTeam.preload },
                      },
                      {
                        path: Routes.dashboard.settings.billing,
                        element: (
                          <SuspenseLoader>
                            <WalletPanel processLinks />
                          </SuspenseLoader>
                        ),
                        handle: { preload: WalletPanel.preload },
                      },
                      {
                        path: Routes.dashboard.settings.billingReturn,
                        element: (
                          <SuspenseLoader>
                            <WalletPanel processLinks />
                          </SuspenseLoader>
                        ),
                        handle: { preload: WalletPanel.preload },
                      },
                      {
                        path: Routes.dashboard.settings.legacySubscription,
                        ...redirectLegacyPath(Routes.dashboard.settings.billing),
                      },
                      {
                        path: Routes.dashboard.settings.legacyWallet,
                        ...redirectLegacyPath(Routes.dashboard.settings.billing),
                      },
                      {
                        path: Routes.dashboard.settings.legacyWalletReturn,
                        ...redirectLegacyPath(Routes.dashboard.settings.billingReturn),
                      },
                      {
                        path: Routes.dashboard.settings.support,
                        element: (
                          <SuspenseLoader>
                            <OrganizationSupport />
                          </SuspenseLoader>
                        ),
                        handle: { preload: OrganizationSupport.preload },
                      },
                    ],
                  },
                  {
                    ...ProtectedRoutes([
                      {
                        path: Routes.processes.create,
                        element: (
                          <SuspenseLoader>
                            <ProcessCreate />
                          </SuspenseLoader>
                        ),
                        handle: { preload: ProcessCreate.preload },
                        errorElement: <Error />,
                      },
                      {
                        path: Routes.processes.createReturn,
                        element: (
                          <SuspenseLoader>
                            <ProcessCreate />
                          </SuspenseLoader>
                        ),
                        handle: { preload: ProcessCreate.preload },
                        errorElement: <Error />,
                      },
                    ]),
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
