// These aren't lazy loaded since they are main layouts and related components
import { useQueryClient } from '@tanstack/react-query'
import { Fragment } from 'react'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { generatePath, Params, redirect, replace, ShouldRevalidateFunctionArgs } from 'react-router'
import { PageSkeleton } from '~components/ui/PageSkeleton'
import Error from '~elements/Error'
import LayoutDashboard from '~elements/LayoutDashboard'
import { QueryKeys } from '~queries/keys'
import OrganizationProtectedRoute from '~src/router/OrganizationProtectedRoute'
import ProtectedRoutes from '~src/router/ProtectedRoutes'
import { redirectLegacyPath, Routes } from '.'
import AccountProtectedRoute from '../AccountProtectedRoute'
import { lazyPage } from '../lazy-page'
import PrivateAppGuard from '../PrivateAppGuard'
import { SuspenseLoader } from '../SuspenseLoader'

// elements/pages, loaded through route `lazy` (see lazyPage)
const DashboardCreateOrg = () => import('~elements/dashboard/organization/create')
const DashboardProcesses = () => import('~elements/dashboard/processes')
const AllProcesses = () => import('~elements/dashboard/processes/all')
const EndedProcesses = () => import('~elements/dashboard/processes/ended')
const Drafts = () => import('~elements/dashboard/processes/drafts')
const DashboardProcessView = () => import('~elements/dashboard/processes/view')
const ProcessCreate = () => import('~elements/dashboard/processes/create')
const OrganizationEdit = () => import('~components/Organization/Dashboard/Organization')
const WalletPanel = () => import('~components/Wallet/Wallet')
const OrganizationSupport = () => import('~components/Organization/Dashboard/Support')
const OrganizationTeam = () => import('~components/Organization/Dashboard/Team')
const Profile = () => import('~elements/dashboard/profile')
const Settings = () => import('~elements/dashboard/settings')
const Memberbase = () => import('~elements/dashboard/memberbase')
const Members = () => import('~elements/dashboard/memberbase/members')
const Groups = () => import('~elements/dashboard/memberbase/groups')
const CensusCheckout = () => import('~elements/dashboard/processes/census-checkout')

// others
const Dashboard = () => import('~elements/dashboard')

// One page for billing and its Stripe return: the same component type on both routes, so the panel
// keeps the payment it is waiting for when the return URL is replaced.
const BillingPage = lazyPage(WalletPanel, { processLinks: true })

// An index route that sends a section to its first tab inside the same navigation. The handle
// lets the hover prefetch follow it to the tab's code.
const indexRedirect = (to: string) => ({
  index: true as const,
  loader: ({ request }: { request: Request }) => indexRedirectResponse(request, to),
  handle: { redirectsTo: to },
})

// A loader redirect is a push unless the navigation asked for replace, and a direct load or a Back
// to the section root does not: Back would land on the root and push the tab again. The address
// bar already shows the root in those cases, so that entry is replaced instead.
export const indexRedirectResponse = (request: Request, to: string) =>
  new URL(request.url).pathname === window.location.pathname ? replace(to) : redirect(to)

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
        // Its content area holds the pending bar shown while the router loads the next page.
        element: <LayoutDashboard />,
        children: [
          {
            // Redirects integrators to /integrators
            element: <PrivateAppGuard redirectPath={Routes.dashboard.base} />,
            children: [
              {
                // What the first load shows while the matched page's code arrives. It sits below the
                // guard so the guard (and the session reads it starts) renders meanwhile; the router
                // starts that download when it is created, in parallel with them.
                HydrateFallback: PageSkeleton,
                children: [
                  {
                    path: Routes.dashboard.organizationCreate,
                    lazy: lazyPage(DashboardCreateOrg),
                    errorElement: <Error />,
                  },
                  {
                    path: Routes.dashboard.base,
                    lazy: lazyPage(Dashboard),
                    errorElement: <Error />,
                  },
                  {
                    path: Routes.dashboard.profile,
                    lazy: lazyPage(Profile),
                    errorElement: <Error />,
                  },
                  // Protected routes if no account created without organization
                  {
                    element: <OrganizationProtectedRoute />,
                    children: [
                      {
                        path: Routes.dashboard.process,
                        lazy: lazyPage(DashboardProcessView),
                        // Reads the process through the ElectionProvider query, so one a list already
                        // fetched renders at once instead of waiting for a request.
                        loader: async ({ params }: { params: Params<string> }) => {
                          const id = params.id!
                          const election = await queryClient.ensureQueryData({
                            queryKey: QueryKeys.election.process(id),
                            queryFn: () => client.elections.get(id),
                            // The navigation waits for this: fail at once, like the direct call it
                            // replaces, not after the app default's three retries
                            retry: false,
                            // A list's copy renders at once; one older than a few seconds is refreshed
                            // in the background, whatever the app's default staleTime is
                            revalidateIfStale: true,
                            staleTime: 5_000,
                          })
                          // The view keys the provider by the API's id: seed that too if the URL spells it differently
                          if (election.id !== id) {
                            queryClient.setQueryData(QueryKeys.election.process(election.id), election)
                          }
                          return election
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
                        lazy: lazyPage(CensusCheckout),
                        errorElement: <Error />,
                      },
                      {
                        path: Routes.dashboard.census.checkoutReturn,
                        lazy: lazyPage(CensusCheckout),
                        errorElement: <Error />,
                      },
                      {
                        path: Routes.dashboard.processes.base,
                        lazy: lazyPage(DashboardProcesses),
                        children: [
                          // Index redirects run as loaders, so a menu link to a section is one
                          // navigation: no empty section committed before its first tab loads.
                          indexRedirect(generatePath(Routes.dashboard.processes.all)),
                          {
                            path: Routes.dashboard.processes.all,
                            lazy: lazyPage(AllProcesses),
                          },
                          {
                            path: Routes.dashboard.processes.ended,
                            lazy: lazyPage(EndedProcesses),
                          },
                          {
                            path: Routes.dashboard.processes.drafts,
                            lazy: lazyPage(Drafts),
                          },
                        ],

                        errorElement: <Error />,
                      },
                      {
                        path: Routes.dashboard.memberbase.base,
                        lazy: lazyPage(Memberbase),
                        errorElement: <Error />,
                        children: [
                          indexRedirect(generatePath(Routes.dashboard.memberbase.members, { page: '1' })),
                          {
                            path: Routes.dashboard.memberbase.members,
                            lazy: lazyPage(Members),
                          },
                          {
                            path: Routes.dashboard.memberbase.groups,
                            lazy: lazyPage(Groups),
                          },
                        ],
                      },
                      {
                        path: Routes.dashboard.settings.base,
                        lazy: lazyPage(Settings),
                        errorElement: <Error />,
                        children: [
                          indexRedirect(Routes.dashboard.settings.organization),
                          {
                            path: Routes.dashboard.settings.organization,
                            lazy: lazyPage(OrganizationEdit),
                          },
                          {
                            path: Routes.dashboard.settings.team,
                            lazy: lazyPage(OrganizationTeam),
                          },
                          {
                            path: Routes.dashboard.settings.billing,
                            lazy: BillingPage,
                          },
                          {
                            path: Routes.dashboard.settings.billingReturn,
                            lazy: BillingPage,
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
                            lazy: lazyPage(OrganizationSupport),
                          },
                        ],
                      },
                      {
                        ...ProtectedRoutes([
                          {
                            path: Routes.processes.create,
                            lazy: lazyPage(ProcessCreate),
                            errorElement: <Error />,
                          },
                          {
                            path: Routes.processes.createReturn,
                            lazy: lazyPage(ProcessCreate),
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
      },
    ],
  }
}
