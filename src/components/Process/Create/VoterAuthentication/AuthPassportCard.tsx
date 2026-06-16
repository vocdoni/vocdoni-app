import { Box, Button, HStack, Icon, Text, VStack } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { LuCircleCheck, LuMail, LuPencil, LuPhone, LuShield, LuSmartphone, LuUsers } from 'react-icons/lu'
import { Census } from '../common'
import { useCredentialMeta } from './credentialMeta'
import { EASE, popIn } from './motion'
import { TwoFAMethod } from './utils'

export type AuthPassportCardProps = {
  census: Census
  groupName?: string
  groupMembersCount?: number
  onEdit: () => void
}

const methodMeta = (method: TwoFAMethod) =>
  method === 'sms'
    ? { icon: LuPhone, key: 'voter_auth.method.sms_label', fallback: 'SMS code' }
    : method === 'voter_choice'
      ? { icon: LuSmartphone, key: 'voter_auth.method.choice_label', fallback: "Member's choice" }
      : { icon: LuMail, key: 'voter_auth.method.email_label', fallback: 'Email code' }

/**
 * The payoff: a compact "voter pass" shown in the sidebar once authentication is
 * configured. Stamps in on first appearance so completing the wizard feels
 * rewarding, and summarises exactly what was set up.
 */
export const AuthPassportCard = ({ census, groupName, groupMembersCount, onEdit }: AuthPassportCardProps) => {
  const { t } = useTranslation()
  const { byId } = useCredentialMeta()
  const method = methodMeta(census.use2FAMethod)

  return (
    <Box
      borderWidth='1px'
      borderColor='table.border'
      borderRadius='xl'
      overflow='hidden'
      bg='auth.card.bg'
      css={{ animation: `${popIn} 0.28s ${EASE} both` }}
    >
      <HStack px={4} py={3} gap={2} bg='auth.bg'>
        <Icon as={LuCircleCheck} color='green.500' boxSize={4} />
        <Text fontWeight='semibold' fontSize='sm'>
          {t('voter_auth.passport.configured', { defaultValue: 'Voter access ready' })}
        </Text>
      </HStack>

      {/* perforated divider */}
      <Box borderTopWidth='1px' borderStyle='dashed' borderColor='table.border' />

      <VStack align='stretch' gap={2.5} p={4}>
        {groupName && (
          <HStack gap={2} fontSize='sm'>
            <Icon as={LuUsers} boxSize={3.5} color='texts.subtle' flexShrink={0} />
            <Text>
              {t('voter_auth.passport.voters', {
                defaultValue: '{{name}} · {{count}} voters',
                name: groupName,
                count: groupMembersCount ?? census.size ?? 0,
              })}
            </Text>
          </HStack>
        )}

        {census.credentials?.length > 0 && (
          <HStack gap={2} fontSize='sm' align='start'>
            <Icon as={LuShield} boxSize={3.5} color='texts.subtle' flexShrink={0} mt={0.5} />
            <Text>{census.credentials.map((id) => byId(id).label).join(' + ')}</Text>
          </HStack>
        )}

        {census.use2FA && (
          <HStack gap={2} fontSize='sm'>
            <Icon as={method.icon} boxSize={3.5} color='texts.subtle' flexShrink={0} />
            <Text>{t(method.key, { defaultValue: method.fallback })}</Text>
          </HStack>
        )}

        <Button variant='outline' size='sm' w='full' mt={1} onClick={onEdit}>
          <Icon as={LuPencil} boxSize={3.5} />
          {t('voter_auth.passport.edit', { defaultValue: 'Edit voter access' })}
        </Button>
      </VStack>
    </Box>
  )
}
