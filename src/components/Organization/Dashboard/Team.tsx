import { Flex, Icon } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { LuUserPlus } from 'react-icons/lu'
import { DashboardBox, SectionHeader, SectionHeading, SectionSubHeading } from '~components/Dashboard/Contents'
import { InviteToTeamModal } from '~components/Organization/Invite'
import { OrganizationUsers } from '~components/Organization/Team'

const OrganizationTeam = () => {
  const { t } = useTranslation()
  return (
    <DashboardBox p={6}>
      <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
        <SectionHeader>
          <SectionHeading>{t('organization_settings.team.title', { defaultValue: 'Team members' })}</SectionHeading>
          <SectionSubHeading>
            {t('organization_settings.team.subtitle', {
              defaultValue: "Manage your organization's team members and their permissions.",
            })}
          </SectionSubHeading>
        </SectionHeader>
        <InviteToTeamModal leftIcon={<Icon mr={2} as={LuUserPlus} />} whiteSpace='normal'>
          {t('organization_settings.team.add_team_member', { defaultValue: 'Add team member' })}
        </InviteToTeamModal>
      </Flex>
      <OrganizationUsers />
    </DashboardBox>
  )
}

export default OrganizationTeam
