import { useClient } from '@vocdoni/react-components'
import { lazy, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { parseProcessIds } from '~components/Home/SharedCensus'
import Layout from '~elements/Layout'
import SimpleLayout from '~elements/SimpleLayout'
import { SuspenseLoader } from '../SuspenseLoader'

const SharedCensus = lazy(() => import('~components/Home/SharedCensus'))
const OrganizationView = lazy(() => import('~elements/organization/view'))
const ProcessView = lazy(() => import('~elements/processes/view'))

export const useHomeRoute = () => {
  const { client } = useClient()
  const domains = useMemo(() => import.meta.env.CUSTOM_ORGANIZATION_DOMAINS || {}, [])
  const sharedCensusProcessIds = useMemo(() => parseProcessIds(import.meta.env.PROCESS_IDS), [])
  const singleProcessId = useMemo(() => import.meta.env.SINGLE_PROCESS_ID?.trim() || '', [])
  const shouldUseSharedCensus = sharedCensusProcessIds.length > 0
  const shouldUseSingleProcess = singleProcessId.length > 0
  const LayoutComponent = shouldUseSharedCensus ? SimpleLayout : Layout
  const homeIndexRoute = useMemo(() => {
    const domainForHost = domains[window.location.hostname]
    if (!domainForHost && !shouldUseSharedCensus) {
      return {
        index: true,
        element: <Navigate to='/admin' replace />,
      }
    }

    const homeContent = domainForHost ? (
      <OrganizationView />
    ) : shouldUseSingleProcess ? (
      <ProcessView />
    ) : (
      <SharedCensus />
    )

    return {
      index: true,
      element: <SuspenseLoader>{homeContent}</SuspenseLoader>,
      loader: async () => {
        if (shouldUseSingleProcess) {
          return client.fetchElection(singleProcessId)
        }
        if (domainForHost) {
          return client.fetchAccountInfo(domainForHost)
        }
        return null
      },
    }
  }, [client, domains, shouldUseSharedCensus, shouldUseSingleProcess, singleProcessId])

  return {
    element: <LayoutComponent />,
    children: [homeIndexRoute],
  }
}
