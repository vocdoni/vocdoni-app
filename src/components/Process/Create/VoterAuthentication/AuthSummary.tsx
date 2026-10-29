import { Card, HStack, Icon, Stack, Text } from '@chakra-ui/react'
import type { TFunction } from 'i18next'
import type { IconType } from 'react-icons'
import { useTranslation } from 'react-i18next'
import { LuIdCard, LuKeyRound, LuMail, LuMessagesSquare, LuSmartphone, LuTriangleAlert, LuUnlink } from 'react-icons/lu'
import { useAnonymityLabels } from '~components/Process/anonymityLabels'
import { StatusBadge } from '~components/ui/StatusBadge'
import { getAuthFieldLabel } from '~components/Process/CSP/fields'
import { Census } from '../common'
import { getProtectionLevel, getProtectionLevelTitle, protectionLevelTones } from './ProtectionLevel'
import { CensusCheckStatus } from './useCensusCheck'
import { CodeMethod, fromCensus } from './utils'

const codeIcons: Record<CodeMethod, IconType> = {
  none: LuKeyRound,
  email: LuMail,
  sms: LuSmartphone,
  voter_choice: LuMessagesSquare,
}

export const getCodeMethodSummary = (t: TFunction, method: CodeMethod) => {
  switch (method) {
    case 'email':
      return t('voter_auth.summary.code_email', { defaultValue: 'One-time code by email' })
    case 'sms':
      return t('voter_auth.summary.code_sms', { defaultValue: 'One-time code by SMS' })
    case 'voter_choice':
      return t('voter_auth.summary.code_choice', { defaultValue: 'One-time code by email or SMS' })
    default:
      return t('voter_auth.summary.code_none', { defaultValue: 'No one-time code' })
  }
}

type AuthSummaryProps = {
  census: Census
  anonymousVoting: boolean
  checkStatus: CensusCheckStatus
}

/** The saved sign-in settings as they read in the Settings panel, graded like the modal grades them. */
export const AuthSummary = ({ census, anonymousVoting, checkStatus }: AuthSummaryProps) => {
  const { t } = useTranslation()
  const anonymity = useAnonymityLabels(anonymousVoting).title
  const { credentials, codeMethod } = fromCensus(census)
  const level = getProtectionLevel(credentials, codeMethod)

  return (
    <Card.Root variant='section' size='sm'>
      <HStack justify='space-between' mb={3}>
        <Text fontWeight='semibold'>{t('voter_auth.summary.title', { defaultValue: 'Voter sign-in' })}</Text>
        <StatusBadge tone={protectionLevelTones[level]}>{getProtectionLevelTitle(t, level)}</StatusBadge>
      </HStack>
      <Stack gap={2} fontSize='sm'>
        {credentials.length > 0 && (
          <HStack gap={2} align='start'>
            <Icon as={LuIdCard} color='fg.muted' mt={0.5} />
            <Text fontSize='inherit'>
              {t('voter_auth.summary.details', {
                defaultValue: 'Voters type: {{fields}}',
                fields: credentials.map((field) => getAuthFieldLabel(t, field)).join(', '),
              })}
            </Text>
          </HStack>
        )}
        <HStack gap={2}>
          <Icon as={codeIcons[codeMethod]} color='fg.muted' />
          <Text fontSize='inherit'>{getCodeMethodSummary(t, codeMethod)}</Text>
        </HStack>
        {/* Neutral, and deliberately outside the protection grade: anonymity is a
            different axis from how strongly a voter is identified, not a further
            rung of it. Set in the settings panel, echoed here so the census reads
            whole. */}
        <HStack gap={2}>
          <Icon as={LuUnlink} color='fg.muted' />
          <Text color='fg.muted' fontSize='inherit'>
            {t('voter_auth.anonymity', {
              defaultValue: 'Ballot anonymity: {{ mode }}',
              mode: anonymity,
            })}
          </Text>
        </HStack>
        {/* Re-checked whenever the group or the chosen details change after
            saving: the settings were only ever validated against the old ones. */}
        {(checkStatus === 'invalid' || checkStatus === 'rejected') && (
          <HStack gap={2} align='start' color='fg.error'>
            <Icon as={LuTriangleAlert} mt={0.5} />
            <Text fontSize='inherit'>
              {t('voter_auth.summary.member_list_mismatch', {
                defaultValue: "These settings don't fit your member list. Edit them to see why.",
              })}
            </Text>
          </HStack>
        )}
      </Stack>
    </Card.Root>
  )
}
