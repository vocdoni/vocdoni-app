import { useClient } from '@vocdoni/react-components'
import { VocdoniSDKClient } from '@vocdoni/sdk'
import { lazy } from 'react'
import { Params } from 'react-router-dom'
// These aren't lazy loaded since they are main layouts and related components
import ErrorElement from '~elements/Error'
import Layout from '~elements/Layout'
import { Routes } from '.'
import { SuspenseLoader } from '../SuspenseLoader'

// elements / pages
const NotFound = lazy(() => import('~elements/NotFound'))
const Process = lazy(() => import('~elements/processes/view'))
const ProcessSummary = lazy(() => import('~elements/processes/summary'))
const OrganizationView = lazy(() => import('~elements/organization/view'))
const PlansPublicPage = lazy(() => import('~elements/plans'))

const RootElements = (client: VocdoniSDKClient) => [
  {
    path: Routes.processes.view,
    id: 'process-view',
    handle: { hideNavbar: true },
    element: (
      <SuspenseLoader>
        <Process />
      </SuspenseLoader>
    ),
    loader: async ({ params }: { params: Params<string> }) => client.fetchElection(params.id),
    errorElement: <ErrorElement />,
  },
  {
    path: Routes.processes.summary,
    id: 'process-summary',
    handle: { hideNavbar: true },
    element: (
      <SuspenseLoader>
        <ProcessSummary />
      </SuspenseLoader>
    ),
    loader: async ({ params }: { params: Params<string> }) => client.fetchElection(params.id),
    errorElement: <ErrorElement />,
  },
  {
    path: Routes.organization,
    element: (
      <SuspenseLoader>
        <OrganizationView />
      </SuspenseLoader>
    ),
    loader: async ({ params }: { params: Params<string> }) => client.fetchAccountInfo(params.address),
    errorElement: <ErrorElement />,
  },
  {
    path: Routes.plans,
    element: (
      <SuspenseLoader>
        <PlansPublicPage />
      </SuspenseLoader>
    ),
  },
  {
    path: '*',
    handle: { hideNavbar: true },
    element: (
      <SuspenseLoader>
        <NotFound />
      </SuspenseLoader>
    ),
  },
]

export const useRootRoutes = () => {
  const { client } = useClient()

  return {
    path: Routes.root,
    element: <Layout />,
    children: RootElements(client),
  }
}
