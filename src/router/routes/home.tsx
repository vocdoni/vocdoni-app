import { useClient } from '@vocdoni/react-components'
import { lazy, useMemo } from 'react'
import { AppEnv, getCustomOrganizationDomainsEnv } from '~src/app-env'
import { parseProcessIds } from '~components/Home/SharedCensus'
import Layout from '~elements/Layout'
import SimpleLayout from '~elements/SimpleLayout'
import { AppNavigate } from '../appNavigation'
import { SuspenseLoader } from '../SuspenseLoader'

const SharedCensus = lazy(() => import('~components/Home/SharedCensus'))
const OrganizationView = lazy(() => import('~elements/organization/view'))

export const useHomeRoute = () => {
  const { client } = useClient()
  const domains = useMemo(() => getCustomOrganizationDomainsEnv(), [])
  const sharedCensusProcessIds = useMemo(() => parseProcessIds(AppEnv.PROCESS_IDS), [])
  const shouldUseSharedCensus = sharedCensusProcessIds.length > 0
  const LayoutComponent = shouldUseSharedCensus ? SimpleLayout : Layout
  const homeIndexRoute = useMemo(() => {
    const domainForHost = domains[window.location.hostname]
    if (!domainForHost && !shouldUseSharedCensus) {
      return {
        index: true,
        element: <AppNavigate to='/admin' replace />,
      }
    }

    const homeContent = domainForHost ? <OrganizationView /> : <SharedCensus />

    return {
      index: true,
      element: <SuspenseLoader>{homeContent}</SuspenseLoader>,
      loader: async () => {
        if (domainForHost) {
          return client.fetchAccountInfo(domainForHost)
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
