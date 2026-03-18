// These aren't lazy loaded since they are main layouts and related components
import { useQueryClient } from '@tanstack/react-query'
import { useClient } from '@vocdoni/react-components'
import { lazy } from 'react'
import { generatePath, LoaderFunctionArgs, Navigate, Params, ShouldRevalidateFunctionArgs } from 'react-router-dom'
import Error from '~elements/Error'
import LayoutDashboard from '~elements/LayoutDashboard'
import { paginatedElectionsQuery } from '~queries/organization'
import OrganizationProtectedRoute from '~src/router/OrganizationProtectedRoute'
import ProtectedRoutes from '~src/router/ProtectedRoutes'
import { getPaginationParams } from '~utils/pagination'
import { Routes } from '.'
import AccountProtectedRoute from '../AccountProtectedRoute'
import { SuspenseLoader } from '../SuspenseLoader'

// elements/pages
const DashboardCreateOrg = lazy(() => import('~elements/dashboard/organization/create'))
const DashboardProcesses = lazy(() => import('~elements/dashboard/processes'))
const AllProcesses = lazy(() => import('~elements/dashboard/processes/all'))
const EndedProcesses = lazy(() => import('~elements/dashboard/processes/ended'))
const Drafts = lazy(() => import('~elements/dashboard/processes/drafts'))
const DashboardProcessView = lazy(() => import('~elements/dashboard/processes/view'))
const ProcessCreate = lazy(() => import('~elements/dashboard/processes/create'))
const OrganizationEdit = lazy(() => import('~components/Organization/Dashboard/Organization'))
const SubscriptionPage = lazy(() => import('~components/Organization/Dashboard/Subscription'))
const OrganizationSupport = lazy(() => import('~components/Organization/Dashboard/Support'))
const OrganizationTeam = lazy(() => import('~components/Organization/Dashboard/Team'))
const Profile = lazy(() => import('~elements/dashboard/profile'))
const Settings = lazy(() => import('~elements/dashboard/settings'))
const Memberbase = lazy(() => import('~elements/dashboard/memberbase'))
const Members = lazy(() => import('~elements/dashboard/memberbase/members'))
const Groups = lazy(() => import('~elements/dashboard/memberbase/groups'))

// others
const Dashboard = lazy(() => import('~elements/dashboard'))
export const dashboardProcessRouteId = 'dashboard-process'

export const shouldRevalidateDashboardProcess = ({
  currentParams,
  nextParams,
}: Pick<ShouldRevalidateFunctionArgs, 'currentParams' | 'nextParams'>) => currentParams.id !== nextParams.id

export const useDashboardRoutes = () => {
  const queryClient = useQueryClient()
  const { client, account } = useClient()

  return {
    element: (
      <SuspenseLoader>
        <AccountProtectedRoute />
      </SuspenseLoader>
    ),
    children: [
      {
        element: (
          <SuspenseLoader>
            <LayoutDashboard />
          </SuspenseLoader>
        ),
        children: [
          {
            path: Routes.dashboard.organizationCreate,
            element: (
              <SuspenseLoader>
                <DashboardCreateOrg />
              </SuspenseLoader>
            ),
          },
          {
            path: Routes.dashboard.base,
            element: (
              <SuspenseLoader>
                <Dashboard />
              </SuspenseLoader>
            ),
            errorElement: <Error />,
          },
          {
            path: Routes.dashboard.profile,
            element: (
              <SuspenseLoader>
                <Profile />
              </SuspenseLoader>
            ),
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
                id: dashboardProcessRouteId,
                path: Routes.dashboard.process,
                loader: async ({ params }: { params: Params<string> }) => client.fetchElection(params.id),
                shouldRevalidate: shouldRevalidateDashboardProcess,
                errorElement: <Error />,
                children: [
                  {
                    index: true,
                    element: (
                      <SuspenseLoader>
                        <DashboardProcessView />
                      </SuspenseLoader>
                    ),
                  },
                  {
                    path: Routes.dashboard.processResults,
                    element: (
                      <SuspenseLoader>
                        <DashboardProcessView />
                      </SuspenseLoader>
                    ),
                  },
                ],
              },
              {
                path: Routes.dashboard.processes.base,
                element: (
                  <SuspenseLoader>
                    <DashboardProcesses />
                  </SuspenseLoader>
                ),
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
                    loader: async ({ params, request }: LoaderFunctionArgs) => {
                      const url = new URL(request.url)
                      const queryParams = getPaginationParams(url.searchParams)
                      // we want our route params to override the query params
                      const mergedParams = { ...queryParams, ...params }

                      return await queryClient.ensureQueryData(paginatedElectionsQuery(account, client, mergedParams))
                    },
                  },
                  {
                    path: Routes.dashboard.processes.ended,
                    element: (
                      <SuspenseLoader>
                        <EndedProcesses />
                      </SuspenseLoader>
                    ),
                    loader: async ({ params, request }: LoaderFunctionArgs) => {
                      const url = new URL(request.url)
                      const queryParams = getPaginationParams(url.searchParams)
                      // we want our route params to override the query params
                      const mergedParams = { ...queryParams, ...params }

                      return await queryClient.ensureQueryData(paginatedElectionsQuery(account, client, mergedParams))
                    },
                  },
                  {
                    path: Routes.dashboard.processes.drafts,
                    element: (
                      <SuspenseLoader>
                        <Drafts />
                      </SuspenseLoader>
                    ),
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
                errorElement: <Error />,
                children: [
                  {
                    index: true,
                    element: <Navigate to={generatePath(Routes.dashboard.memberbase.members, { page: 1 })} replace />,
                  },
                  {
                    path: Routes.dashboard.memberbase.members,
                    element: (
                      <SuspenseLoader>
                        <Members />
                      </SuspenseLoader>
                    ),
                  },
                  {
                    path: Routes.dashboard.memberbase.groups,
                    element: (
                      <SuspenseLoader>
                        <Groups />
                      </SuspenseLoader>
                    ),
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
                  },
                  {
                    path: Routes.dashboard.settings.team,
                    element: (
                      <SuspenseLoader>
                        <OrganizationTeam />
                      </SuspenseLoader>
                    ),
                  },
                  {
                    path: Routes.dashboard.settings.subscription,
                    element: (
                      <SuspenseLoader>
                        <SubscriptionPage />
                      </SuspenseLoader>
                    ),
                  },
                  {
                    path: Routes.dashboard.settings.support,
                    element: (
                      <SuspenseLoader>
                        <OrganizationSupport />
                      </SuspenseLoader>
                    ),
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
                  },
                ]),
              },
            ],
          },
        ],
      },
    ],
  }
}
