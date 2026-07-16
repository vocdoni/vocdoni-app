import { Icon, IconButton } from '@chakra-ui/react'
import { useElection } from '@vocdoni/react-components'
import { areEqualHexStrings, ensure0x, InvalidElection } from '@vocdoni/sdk'
import { useTranslation } from 'react-i18next'
import { FaCog } from 'react-icons/fa'
import { generatePath } from 'react-router-dom'
import { useAuth } from '~components/Auth/useAuth'
import { RouterAwareLink } from '~components/RouterAwareLink'
import { useProfile } from '~queries/account'
import { Routes } from '~routes'

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

  const isOrgMember = profile?.organizations?.some((membership) =>
    areEqualHexStrings(membership.organization.address, election.organizationId)
  )

  if (!isOrgMember) return null

  const manageLabel = t('process_actions.manage', { defaultValue: 'Manage in dashboard' })

  return (
    <IconButton asChild variant='surface' size='xs' title={manageLabel} aria-label={manageLabel}>
      {/* RouterAwareLink keeps client-side navigation when rendered inside the SPA (home / org
          pages) and falls back to a plain anchor on the SSR voting page, which has no router. */}
      <RouterAwareLink to={generatePath(Routes.dashboard.process, { id: ensure0x(election.id) })}>
        <Icon as={FaCog} />
      </RouterAwareLink>
    </IconButton>
  )
}
