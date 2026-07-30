import type { VocdoniApiClient } from '@vocdoni/api-client'
import { lazy } from 'react'
import { Params } from 'react-router-dom'
// These aren't lazy loaded since they are main layouts and related components
import ErrorElement from '~elements/Error'
import Layout from '~elements/Layout'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { Routes } from '.'
import { SuspenseLoader } from '../SuspenseLoader'

// elements / pages
const NotFound = lazy(() => import('~elements/NotFound'))
const Process = lazy(() => import('~elements/processes/view'))
const OrganizationView = lazy(() => import('~elements/organization/view'))
const PlansPublicPage = lazy(() => import('~elements/plans'))

const RootElements = (client: VocdoniApiClient) => [
  {
    path: Routes.processes.view,
    id: 'process-view',
    handle: { hideNavbar: true },
    element: (
      <SuspenseLoader>
        <Process />
      </SuspenseLoader>
    ),
    loader: async ({ params }: { params: Params<string> }) => client.elections.get(params.id!),
    errorElement: <ErrorElement />,
  },
  {
    path: Routes.organization,
    element: (
      <SuspenseLoader>
        <OrganizationView />
      </SuspenseLoader>
    ),
    loader: async ({ params }: { params: Params<string> }) => client.organizations.get(params.address!),
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
  const { client } = useApiClient()

  return {
    path: Routes.root,
    element: <Layout />,
    children: RootElements(client),
  }
}
