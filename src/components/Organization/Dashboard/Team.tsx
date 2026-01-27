import { Flex, Heading, Icon, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { LuUserPlus } from 'react-icons/lu'
import { InviteToTeamModal } from '~components/Organization/Invite'
import { OrganizationUsers } from '~components/Organization/Team'
import { DashboardBox } from '~shared/Dashboard/Contents'

const OrganizationTeam = () => {
  const { t } = useTranslation()
  return (
    <DashboardBox p={6}>
      <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
        <Flex flex={1} direction='column'>
          <Heading size='md'>{t('organization_settings.team.title', { defaultValue: 'Team Members' })}</Heading>
          <Text color='texts.subtle' fontSize='sm'>
            {t('organization_settings.team.subtitle', {
              defaultValue: "Manage your organization's team members and their permissions.",
            })}
          </Text>
        </Flex>
        <InviteToTeamModal leftIcon={<Icon mr={2} as={LuUserPlus} />} whiteSpace='normal'>
          {t('organization_settings.team.add_team_member', { defaultValue: 'Add team member' })}
        </InviteToTeamModal>
      </Flex>
      <OrganizationUsers />
    </DashboardBox>
  )
}

export default OrganizationTeam
