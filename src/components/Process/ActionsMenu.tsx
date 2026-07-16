import { Button, Icon } from '@chakra-ui/react'
import { useElection } from '@vocdoni/react-components'
import { areEqualHexStrings, ensure0x, InvalidElection } from '@vocdoni/sdk'
import { useTranslation } from 'react-i18next'
import { FaCog } from 'react-icons/fa'
import { generatePath } from 'react-router-dom'
import { useAuth } from '~components/Auth/useAuth'
import { useProfile } from '~queries/account'
import { Routes } from '~routes'

/**
 * Admin shortcut shown on public process pages: it does not manage the process inline (a voter is
 * not the org signer, so those actions never worked here). Instead it links members of the
 * process' organization to the dashboard's process view, where the real controls live.
 */
export const ActionsMenu = () => {
  const { t } = useTranslation()
  const { election } = useElection()
  const { isAuthenticated } = useAuth()
  // Only members of an org can see it, so skip the request entirely for anonymous voters.
  const { data: profile } = useProfile({ enabled: isAuthenticated })

  if (!election || election instanceof InvalidElection) return null

  const isOrgMember = profile?.organizations?.some((membership) =>
    areEqualHexStrings(membership.organization.address, election.organizationId)
  )

  if (!isOrgMember) return null

  return (
    <Button asChild variant='surface' size='xs'>
      {/* Plain anchor (not a router Link): the public process view renders without a router context. */}
      <a href={generatePath(Routes.dashboard.process, { id: ensure0x(election.id) })}>
        <Icon as={FaCog} />
        {t('process_actions.manage', { defaultValue: 'Manage in dashboard' })}
      </a>
    </Button>
  )
}
