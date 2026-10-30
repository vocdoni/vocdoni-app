import { Icon } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { AddUserIcon } from '~theme/icons'
import { DashboardBox } from '~components/Dashboard/Contents'
import { SectionHeader } from '~components/ui/SectionHeader'
import { InviteToTeamModal } from '~components/Organization/Invite'
import { OrganizationUsers } from '~components/Organization/Team'

const OrganizationTeam = () => {
  const { t } = useTranslation()
  return (
    <DashboardBox size='md'>
      <SectionHeader
        title={t('organization_settings.team.title', { defaultValue: 'Team members' })}
        description={t('organization_settings.team.subtitle', {
          defaultValue: "Manage your organization's team members and their permissions.",
        })}
        actions={
          <InviteToTeamModal leftIcon={<Icon mr='2' as={AddUserIcon} />} whiteSpace='normal'>
            {t('organization_settings.team.add_team_member', { defaultValue: 'Add team member' })}
          </InviteToTeamModal>
        }
        size='md'
      />
      <OrganizationUsers />
    </DashboardBox>
  )
}

export default OrganizationTeam
