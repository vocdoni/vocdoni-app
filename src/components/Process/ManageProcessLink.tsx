import { Icon, IconButton } from '@chakra-ui/react'
import { useElection } from '@vocdoni/react-components'
import { ensure0x, InvalidElection } from '@vocdoni/sdk'
import { useTranslation } from 'react-i18next'
import { FaCog } from 'react-icons/fa'
import { generatePath } from 'react-router-dom'
import { useAuth } from '~components/Auth/useAuth'
import { RouterAwareLink } from '~components/RouterAwareLink'
import { useProfile } from '~queries/account'
import { Routes } from '~routes'
import { sameAddress } from '~utils/address'

/**
 * Admin shortcut shown on public process pages: it does not manage the process inline (a voter is
 * not the org signer, so those actions never worked here). Instead it links members of the
 * process' organization to the dashboard's process view, where the real controls live.
 */
export const ManageProcessLink = () => {
  const { t } = useTranslation()
  const { election } = useElection()
  const { isAuthenticated } = useAuth()
  const hasElection = !!election && !(election instanceof InvalidElection)
  // Only members of an org can see it, so skip the request for anonymous voters and until a valid
  // election is loaded (the component renders nothing in those cases anyway).
  const { data: profile } = useProfile({ enabled: isAuthenticated && hasElection })

  if (!election || election instanceof InvalidElection) return null

  // The public pages still serve legacy elections (organizationId, 0x-prefixed) while the
  // dashboard serves the new process model (orgAddress, unprefixed) — tolerate both.
  const electionOrgAddress =
    (election as { organizationId?: string }).organizationId ?? (election as { orgAddress?: string }).orgAddress

  // Gate on isAuthenticated too, not just the query `enabled`: a disabled query still returns
  // cached profile data, so a logged-out visitor could otherwise keep a stale membership match.
  const isOrgMember =
    isAuthenticated &&
    profile?.organizations?.some((membership) => sameAddress(membership.organization.address, electionOrgAddress))

  if (!isOrgMember) return null

  // New-model ids are Mongo ObjectIDs (exactly 24 hex chars) and must pass through untouched;
  // legacy election ids are vochain hex, which the dashboard route expects 0x-prefixed.
  const dashboardId = /^[0-9a-f]{24}$/i.test(election.id) ? election.id : ensure0x(election.id)
  const manageLabel = t('process_actions.manage', { defaultValue: 'Manage in dashboard' })

  return (
    <IconButton asChild variant='surface' size='xs' title={manageLabel} aria-label={manageLabel}>
      {/* RouterAwareLink keeps client-side navigation when rendered inside the SPA (home / org
          pages) and falls back to a plain anchor on the SSR voting page, which has no router. */}
      <RouterAwareLink to={generatePath(Routes.dashboard.process, { id: dashboardId })}>
        <Icon as={FaCog} />
      </RouterAwareLink>
    </IconButton>
  )
}
