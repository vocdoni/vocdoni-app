import { Badge, Box, Flex, HStack, Icon, Link, List, Spinner, Stack, Text, VisuallyHidden } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { LuCircleCheck, LuExternalLink, LuIdCard, LuInfo, LuTriangleAlert } from 'react-icons/lu'
import type { CertificateCoverage } from '~src/queries/certificateAuth/warnings'
import { Routes } from '~routes'
import { getProtectionLevelTitle, protectionLevelPalettes } from './ProtectionLevel'
import type { CensusCheckStatus } from './useCensusCheck'

/** A finished check and the coverage it found. */
export type CoverageOutcome = {
  status: Exclude<CensusCheckStatus, 'idle' | 'checking'>
  coverage: CertificateCoverage
}

export type CertificateAuthSummaryProps = {
  membersCount: number
  status: CensusCheckStatus
  coverage: CertificateCoverage
  /** While checking: the last finished outcome, kept on screen until the new one lands. */
  previous?: CoverageOutcome | null
}

// Icon + children side-by-side, used for every row in the card body.
const Row = ({
  icon,
  iconColor = 'fg.muted',
  children,
}: {
  icon: ReactNode
  iconColor?: string
  children: ReactNode
}) => (
  <HStack gap={2} align='start'>
    <Flex as='span' aria-hidden flexShrink={0} mt={0.5} color={iconColor}>
      {icon}
    </Flex>
    <Box minW={0}>{children}</Box>
  </HStack>
)

// Members who can't sign in, accepted at save: orange means "worth fixing", not "blocking".
// The icon and copy carry the meaning; the tint is a secondary cue only.
const Notice = ({ children }: { children: ReactNode }) => (
  <Box bg='orange.subtle' borderRadius='l2' px={3} py={2.5}>
    <Row icon={<Icon as={LuTriangleAlert} boxSize={4} />} iconColor='orange.fg'>
      {children}
    </Row>
  </Box>
)

// Opens the memberbase so the admin can fix missing/invalid DNI/NIEs, then come back.
// The external-link icon and the screen-reader text both signal that this opens a new tab.
const FixMembersLink = () => {
  const { t } = useTranslation()
  return (
    <Link
      href={Routes.dashboard.memberbase.base}
      target='_blank'
      rel='noopener noreferrer'
      fontSize='sm'
      fontWeight='medium'
      color='fg'
    >
      {t('voter_auth.status.fix', { defaultValue: 'Fix your member list' })}
      <Icon as={LuExternalLink} boxSize={3} aria-hidden ms={1} />
      <VisuallyHidden>{t('voter_auth.summary.opens_new_tab', { defaultValue: '(opens in a new tab)' })}</VisuallyHidden>
    </Link>
  )
}

// Shown while the check is running over the previous verdict: the last result
// stays on screen, dimmed, so the admin doesn't lose context.
const Rechecking = () => {
  const { t } = useTranslation()
  return (
    <HStack gap={2} color='fg.muted'>
      <Spinner size='xs' />
      <Text fontSize='sm' lineHeight='1.5'>
        {t('voter_auth.summary.rechecking', { defaultValue: 'Checking your member list again…' })}
      </Text>
    </HStack>
  )
}

/**
 * The saved certificate sign-in summary in the Settings panel: method, grade, and
 * a live coverage verdict re-checked whenever the admin returns from fixing members.
 */
export const CertificateAuthSummary = ({ membersCount, status, coverage, previous }: CertificateAuthSummaryProps) => {
  const { t } = useTranslation()
  const titleId = 'cert-auth-summary'

  // A verdict is only ever drawn from a finished check: zero problems found and
  // no answer yet look the same in the coverage, and only one of them is green.
  const busy = status === 'checking'
  const isRechecking = busy && !!previous
  let shown: CoverageOutcome | null = null
  if (status === 'valid' || status === 'invalid' || status === 'rejected' || status === 'unavailable') {
    shown = { status, coverage }
  } else if (isRechecking) shown = previous!
  const displayed = shown?.coverage ?? coverage
  const verified = shown?.status === 'valid' || shown?.status === 'invalid'

  // Duplicates prevent reliable sign-in; the admin must fix the census itself.
  const isMismatch = shown?.status === 'rejected' || (verified && displayed.duplicates.length > 0)
  const isUnavailable = shown?.status === 'unavailable'

  const isAllCovered = verified && !isMismatch && displayed.cannotSignIn === 0
  // All problems are simply absent nationalIds: one sentence is enough.
  const isOnlyMissing =
    verified &&
    !isMismatch &&
    !isAllCovered &&
    displayed.counts.letter === 0 &&
    displayed.counts.otherId === 0 &&
    displayed.counts.missing > 0
  // Multiple problem kinds: show a total + one line per non-zero reason.
  const isMixed = verified && !isMismatch && !isAllCovered && !isOnlyMissing

  const restCanSignIn = membersCount - displayed.cannotSignIn

  return (
    <Box as='section' aria-labelledby={titleId} p={4} borderWidth='1px' borderColor='border' borderRadius='md'>
      <HStack justify='space-between' align='start' gap={3} mb={3}>
        <Text id={titleId} fontSize='md' fontWeight='semibold' lineHeight='1.5'>
          {t('voter_auth.summary.title', { defaultValue: 'Voter sign-in' })}
        </Text>
        <Badge colorPalette={protectionLevelPalettes.strong} flexShrink={0}>
          {getProtectionLevelTitle(t, 'strong')}
        </Badge>
      </HStack>

      <Stack gap={3}>
        <Row icon={<Icon as={LuIdCard} boxSize={4} />}>
          <Text fontSize='sm' fontWeight='semibold' lineHeight='1.5'>
            {t('voter_auth.summary.certificate_method', { defaultValue: 'Digital certificate (DNI/NIE)' })}
          </Text>
          <Text fontSize='sm' color='fg.muted' lineHeight='1.5'>
            {t('voter_auth.summary.certificate_matched', {
              defaultValue: 'Matched to the DNI/NIE in your member list.',
            })}
          </Text>
        </Row>

        {isRechecking && <Rechecking />}

        {/* The coverage verdict is live: a re-check result is announced once it settles.
            Counts only, never names or DNI/NIE values, so session recordings may keep it. */}
        <Stack
          gap={3}
          role='status'
          aria-live='polite'
          aria-busy={busy}
          opacity={isRechecking ? 0.6 : 1}
          transition='opacity 0.15s'
        >
          {busy && !shown && (
            <HStack gap={2} color='fg.muted'>
              <Spinner size='xs' />
              <Text fontSize='sm' lineHeight='1.5'>
                {t('voter_auth.status.checking', { defaultValue: 'Checking your member list…' })}
              </Text>
            </HStack>
          )}

          {isUnavailable && (
            <Row icon={<Icon as={LuInfo} boxSize={4} />}>
              <Text fontSize='sm' color='fg.muted' lineHeight='1.5'>
                {t('voter_auth.summary.unavailable', { defaultValue: "We couldn't check your member list." })}
              </Text>
            </Row>
          )}

          {isMismatch && (
            <HStack gap={2} align='start' color='fg.error'>
              <Flex as='span' aria-hidden flexShrink={0} mt={0.5}>
                <Icon as={LuTriangleAlert} boxSize={4} />
              </Flex>
              <Text fontSize='sm' lineHeight='1.5'>
                {t('voter_auth.summary.member_list_mismatch', {
                  defaultValue: "These settings don't fit your member list. Edit them to see why.",
                })}
              </Text>
            </HStack>
          )}

          {isAllCovered && (
            <Row icon={<Icon as={LuCircleCheck} boxSize={4} />} iconColor='fg.success'>
              <Text fontSize='sm' lineHeight='1.5'>
                {t('voter_auth.summary.certificate_all', {
                  count: membersCount,
                  defaultValue_one: 'All {{count}} member can sign in.',
                  defaultValue_other: 'All {{count}} members can sign in.',
                })}
              </Text>
            </Row>
          )}

          {isOnlyMissing && (
            <Notice>
              <Text fontSize='sm' fontWeight='semibold' color='orange.fg' lineHeight='1.5'>
                {t('voter_auth.summary.certificate_missing', {
                  count: displayed.counts.missing,
                  defaultValue_one: "{{count}} member is missing a DNI/NIE, so they can't sign in.",
                  defaultValue_other: "{{count}} members are missing a DNI/NIE, so they can't sign in.",
                })}
              </Text>
              {restCanSignIn > 0 && (
                <Text fontSize='sm' color='fg.muted' lineHeight='1.5' mb={1}>
                  {t('voter_auth.summary.certificate_rest', {
                    count: restCanSignIn,
                    defaultValue_one: 'The other {{count}} can.',
                    defaultValue_other: 'The other {{count}} can.',
                  })}
                </Text>
              )}
              <FixMembersLink />
            </Notice>
          )}

          {isMixed && (
            <Notice>
              <Text fontSize='sm' fontWeight='semibold' color='orange.fg' lineHeight='1.5'>
                {t('voter_auth.summary.certificate_mixed', {
                  count: displayed.cannotSignIn,
                  defaultValue_one: "{{count}} member has a missing or invalid DNI/NIE, so they can't sign in:",
                  defaultValue_other: "{{count}} members have a missing or invalid DNI/NIE, so they can't sign in:",
                })}
              </Text>
              <List.Root
                as='ul'
                ps={5}
                my={1}
                gap={0.5}
                fontSize='sm'
                lineHeight='1.5'
                listStyleType='disc'
                listStylePosition='outside'
              >
                {displayed.counts.missing > 0 && (
                  <List.Item>
                    {t('voter_auth.summary.certificate_mixed_missing', {
                      count: displayed.counts.missing,
                      defaultValue_one: '{{count}} has no DNI/NIE',
                      defaultValue_other: '{{count}} have no DNI/NIE',
                    })}
                  </List.Item>
                )}
                {displayed.counts.letter > 0 && (
                  <List.Item>
                    {t('voter_auth.summary.certificate_mixed_letter', {
                      count: displayed.counts.letter,
                      defaultValue_one: "{{count}} has a letter that doesn't match the number",
                      defaultValue_other: "{{count}} have a letter that doesn't match the number",
                    })}
                  </List.Item>
                )}
                {displayed.counts.otherId > 0 && (
                  <List.Item>
                    {t('voter_auth.summary.certificate_mixed_other', {
                      count: displayed.counts.otherId,
                      defaultValue_one: '{{count}} has another kind of ID, like a passport',
                      defaultValue_other: '{{count}} have another kind of ID, like a passport',
                    })}
                  </List.Item>
                )}
              </List.Root>
              {restCanSignIn > 0 && (
                <Text fontSize='sm' color='fg.muted' lineHeight='1.5' mb={1}>
                  {t('voter_auth.summary.certificate_rest', {
                    count: restCanSignIn,
                    defaultValue_one: 'The other {{count}} can.',
                    defaultValue_other: 'The other {{count}} can.',
                  })}
                </Text>
              )}
              <FixMembersLink />
            </Notice>
          )}
        </Stack>
      </Stack>
    </Box>
  )
}
