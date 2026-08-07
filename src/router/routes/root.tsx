import { VocdoniApiError, type VocdoniApiClient } from '@vocdoni/api-client'
import { lazy } from 'react'
import { Params } from 'react-router-dom'
// These aren't lazy loaded since they are main layouts and related components
import ErrorElement from '~elements/Error'
import Layout from '~elements/Layout'
import { useAppEnv } from '~src/app-env'
import {
  fetchLegacyElection,
  fetchLegacyOrganization,
  fetchLegacyOrganizationElections,
  getVochainGatewayUrl,
  isLegacyProcessId,
} from '~src/legacy/vochain-archive'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { Routes } from '.'
import { SuspenseLoader } from '../SuspenseLoader'

// elements / pages
const NotFound = lazy(() => import('~elements/NotFound'))
const Process = lazy(() => import('~elements/processes/view'))
const OrganizationView = lazy(() => import('~elements/organization/view'))
const PlansPublicPage = lazy(() => import('~elements/plans'))

const isSaasNotFoundError = (error: unknown) =>
  error instanceof VocdoniApiError && (error.status === 404 || error.status === 400)

const RootElements = (client: VocdoniApiClient, vochainGateway: string) => [
  {
    path: Routes.processes.view,
    id: 'process-view',
    handle: { hideNavbar: true },
    element: (
      <SuspenseLoader>
        <Process />
      </SuspenseLoader>
    ),
    // 64-hex vochain ids resolve against the read-only archive; Mongo ids against the SaaS API.
    loader: async ({ params }: { params: Params<string> }) => {
      const id = params.id!

      if (isLegacyProcessId(id)) {
        const legacyElection = await fetchLegacyElection(vochainGateway, id)
        const legacyOrganization = await fetchLegacyOrganization(vochainGateway, legacyElection.organizationId).catch(
          () => undefined
        )

        return { era: 'archive', legacyElection, legacyOrganization } as const
      }

      return { era: 'saas', election: await client.elections.get(id) } as const
    },
    errorElement: <ErrorElement />,
  },
  {
    path: Routes.organization,
    element: (
      <SuspenseLoader>
        <OrganizationView />
      </SuspenseLoader>
    ),
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
