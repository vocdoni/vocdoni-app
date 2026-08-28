import { lazy, useMemo } from 'react'
import { Navigate } from 'react-router'
import { parseProcessIds } from '~components/Home/SharedCensus'
import Layout from '~elements/Layout'
import SimpleLayout from '~elements/SimpleLayout'
import { useAppEnv, useCustomOrganizationDomains } from '~src/app-env'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { SuspenseLoader } from '../SuspenseLoader'

const SharedCensus = lazy(() => import('~components/Home/SharedCensus'))
const OrganizationView = lazy(() => import('~elements/organization/view'))

export const useHomeRoute = () => {
  const { client } = useApiClient()
  const { PROCESS_IDS } = useAppEnv()
  const domains = useCustomOrganizationDomains()
  const sharedCensusProcessIds = useMemo(() => parseProcessIds(PROCESS_IDS), [PROCESS_IDS])
  const shouldUseSharedCensus = sharedCensusProcessIds.length > 0
  const LayoutComponent = shouldUseSharedCensus ? SimpleLayout : Layout
  const homeIndexRoute = useMemo(() => {
    const domainForHost = domains[window.location.hostname]
    if (!domainForHost && !shouldUseSharedCensus) {
      return {
        index: true,
        element: <Navigate to='/admin' replace />,
      }
    }

    const homeContent = domainForHost ? <OrganizationView /> : <SharedCensus />

    return {
      index: true,
      element: <SuspenseLoader>{homeContent}</SuspenseLoader>,
      loader: async () => {
        if (domainForHost) {
          return client.organizations.get(domainForHost)
        }
        return null
      },
    }
  }, [client, domains, shouldUseSharedCensus])

  return {
    element: <LayoutComponent />,
    children: [homeIndexRoute],
  }
}
