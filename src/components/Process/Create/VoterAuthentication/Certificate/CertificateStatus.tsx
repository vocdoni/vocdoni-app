import { Box, HStack, Icon, Link, Stack, Text, VisuallyHidden } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { LuCircleAlert, LuCircleCheck, LuExternalLink } from 'react-icons/lu'
import { Routes } from '~routes'
import type { CertificateCoverage } from '~src/queries/certificateAuth/warnings'

type CertificateStatusProps = {
  coverage: CertificateCoverage
  membersCount: number
  attempted: boolean
}

/**
 * Footer status line beside the Save button for a certificate census.
 * Clean: green check. Issues: red alert with link. Duplicates: live hint.
 */
export const CertificateStatus = ({ coverage, membersCount, attempted }: CertificateStatusProps) => {
  const { t } = useTranslation()
  const isClean = coverage.cannotSignIn === 0 && coverage.duplicates.length === 0
  const hasDuplicates = coverage.duplicates.length > 0

  if (isClean) {
    return (
      <HStack gap={2} fontSize='sm'>
        <Icon as={LuCircleCheck} boxSize={4} color='fg.success' flexShrink={0} />
        <Text fontSize='inherit'>
          {t('voter_auth.status.valid_count', {
            defaultValue: 'All {{count}} members can sign in.',
            count: membersCount,
          })}
        </Text>
      </HStack>
    )
  }

  return (
    <Stack gap={1}>
      <HStack gap={2} align='start' fontSize='sm'>
        <Icon as={LuCircleAlert} boxSize={4} color='fg.error' mt={0.5} flexShrink={0} />
        <Box>
          {hasDuplicates && (
            <Text as='span' fontSize='inherit' fontWeight='medium' color='fg.error'>
              {t('voter_auth.status.duplicated_members', {
                defaultValue_one: "{{count}} member shares the same {{fields}}, so they can't be told apart.",
                defaultValue_other: "{{count}} members share the same {{fields}}, so they can't be told apart.",
                count: coverage.duplicates.length,
                fields: 'DNI/NIE',
              })}{' '}
            </Text>
          )}
          {coverage.cannotSignIn > 0 && (
            <Text as='span' fontSize='inherit' fontWeight='medium' color='fg.error'>
              {t('voter_auth.certificate.status_missing', {
                defaultValue: "{{count}} members can't sign in: missing a valid DNI/NIE.",
                defaultValue_one: "{{count}} member can't sign in: missing a valid DNI/NIE.",
                defaultValue_other: "{{count}} members can't sign in: missing a valid DNI/NIE.",
                count: coverage.cannotSignIn,
              })}{' '}
            </Text>
          )}
          <Link href={Routes.dashboard.memberbase.base} target='_blank' rel='noreferrer' fontWeight='medium'>
            {t('voter_auth.status.fix', { defaultValue: 'Fix your member list' })}
            <Icon as={LuExternalLink} boxSize={3} />
            <VisuallyHidden>
              {t('voter_auth.certificate.opens_new_tab', { defaultValue: '(opens in a new tab)' })}
            </VisuallyHidden>
          </Link>
        </Box>
      </HStack>
      <Box role='status' id='voter-auth-certificate-hint'>
        {hasDuplicates && (
          <Text
            key={attempted ? 'attempted' : 'idle'}
            fontSize='sm'
            ps={6}
            color={attempted ? 'fg.error' : 'fg.muted'}
            fontWeight={attempted ? 'medium' : undefined}
          >
            {attempted
              ? t('voter_auth.certificate.hint_attempted', {
                  defaultValue: 'To save, give the {{count}} members who share a DNI/NIE their own.',
                  defaultValue_one: 'To save, give the {{count}} member who shares a DNI/NIE their own.',
                  defaultValue_other: 'To save, give the {{count}} members who share a DNI/NIE their own.',
                  count: coverage.duplicates.length,
                })
              : t('voter_auth.certificate.hint_blocked', {
                  defaultValue: 'You can save once each member has their own DNI/NIE.',
                })}
          </Text>
        )}
      </Box>
    </Stack>
  )
}
