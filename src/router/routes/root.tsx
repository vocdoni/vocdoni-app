import { VocdoniApiError, type VocdoniApiClient } from '@vocdoni/api-client'
import { lazy } from 'react'
import { Params, redirectDocument, type LoaderFunctionArgs } from 'react-router'
// These aren't lazy loaded since they are main layouts and related components
import ErrorElement from '~elements/Error'
import Layout from '~elements/Layout'
import { useAppEnv } from '~src/app-env'
import {
  fetchLegacyOrganization,
  fetchLegacyOrganizationElections,
  getVochainGatewayUrl,
} from '~src/legacy/vochain-archive'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { Routes } from '.'
import { Loading, SuspenseLoader } from '../SuspenseLoader'

// elements / pages
const NotFound = lazy(() => import('~elements/NotFound'))
const OrganizationView = lazy(() => import('~elements/organization/view'))
const PlansPublicPage = lazy(() => import('~elements/plans'))

const isSaasNotFoundError = (error: unknown) =>
  error instanceof VocdoniApiError && (error.status === 404 || error.status === 400)

const RootElements = (client: VocdoniApiClient, vochainGateway: string) => [
  {
    path: Routes.processes.view,
    id: 'process-view',
    handle: { hideNavbar: true },
    // A ballot must not inherit the dashboard's running analytics SDK. Hand it
    // to Vike in a fresh document, just like a direct public-page visit.
    //
    // Caveat: react-router builds the loader request from `stripHashFromPath`,
    // so `request.url` carries no fragment and this redirect drops it. The
    // shared-census ballot hash is load-bearing, so link to a ballot with
    // `reloadDocument` (see Home/SharedCensus) instead of relying on this
    // loader whenever the URL carries one.
    loader: ({ request }: LoaderFunctionArgs) => redirectDocument(request.url),
    HydrateFallback: Loading,
    errorElement: <ErrorElement />,
  },
  {
    path: Routes.organization,
    element: (
      <SuspenseLoader>
        <OrganizationView />
      </SuspenseLoader>
    ),
    HydrateFallback: Loading,
    // Addresses look the same in both eras: the SaaS API is authoritative and
    // the archive serves the addresses it doesn't know (legacy-only orgs).
    loader: async ({ params }: { params: Params<string> }) => {
      const address = params.address!

      try {
        return { era: 'saas', organization: await client.organizations.get(address) } as const
      } catch (error) {
        if (!isSaasNotFoundError(error)) throw error
      }

      const legacyOrganization = await fetchLegacyOrganization(vochainGateway, address)
      const legacyElectionsPage = await fetchLegacyOrganizationElections(vochainGateway, legacyOrganization.address, 0)

      return { era: 'archive', legacyOrganization, legacyElectionsPage } as const
    },
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
  const { VOCDONI_ENVIRONMENT } = useAppEnv()

  return {
    path: Routes.root,
    element: <Layout />,
    children: RootElements(client, getVochainGatewayUrl(VOCDONI_ENVIRONMENT)),
  }
}
