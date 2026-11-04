import { Box, HStack, Icon, Link, Spinner, Stack, Text } from '@chakra-ui/react'
import type { RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { LuBan, LuCircleAlert, LuCircleCheck, LuLaptop, LuRotateCcw } from 'react-icons/lu'
import type { CertificateCoverage } from '~src/queries/certificateAuth/warnings'
import {
  getProtectionLevelTitle,
  protectionLevelPalettes,
} from '~components/Process/Create/VoterAuthentication/ProtectionLevel'
import type { CensusCheckStatus } from '~components/Process/Create/VoterAuthentication/useCensusCheck'
import { Buckets } from './Buckets'

// Step label shared with the sub-components in this file.
const StepHeading = ({ children, id }: { children: React.ReactNode; id?: string }) => (
  <Text id={id} fontSize='sm' fontWeight='semibold'>
    {children}
  </Text>
)

// Certificate sign-in always rates as Strong: the certificate proves the holder's identity.
const CertificateProtection = () => {
  const { t } = useTranslation()
  const palette = protectionLevelPalettes['strong']
  return (
    <Box>
      <HStack gap={2} fontSize='sm' w='full'>
        <Text fontSize='inherit' color='fg.muted'>
          {t('voter_auth.protection.label', { defaultValue: 'Protection' })}
        </Text>
        <HStack gap={0.5} flex='1' aria-hidden>
          {[0, 1, 2].map((segment) => (
            <Box key={segment} flex='1' h={1} borderRadius='full' bg={`${palette}.solid`} />
          ))}
        </HStack>
        <Text fontSize='inherit' fontWeight='semibold' color={`${palette}.fg`}>
          {getProtectionLevelTitle(t, 'strong')}
        </Text>
      </HStack>
    </Box>
  )
}

const TellMembers = () => {
  const { t } = useTranslation()
  return (
    <Stack gap={2}>
      <StepHeading>{t('voter_auth.certificate.tell_heading', { defaultValue: 'Tell your members' })}</StepHeading>
      {(
        [
          [
            LuLaptop,
            t('voter_auth.certificate.tell_installed', {
              defaultValue: 'Voters need a certificate already installed.',
            }),
          ],
          [
            LuBan,
            t('voter_auth.certificate.tell_not_certificates', {
              defaultValue: "The idCAT Mòbil app and Cl@ve are not certificates and won't work.",
            }),
          ],
        ] as const
      ).map(([IconComp, line]) => (
        <HStack key={line} align='start' gap={2}>
          <Icon as={IconComp} boxSize={4} mt='3px' color='fg.muted' flexShrink={0} />
          <Text fontSize='sm' lineHeight='1.5'>
            {line}
          </Text>
        </HStack>
      ))}
    </Stack>
  )
}

type CleanCoverageProps = { membersCount: number }

const CleanCoverage = ({ membersCount }: CleanCoverageProps) => {
  const { t } = useTranslation()
  return (
    <Box borderWidth='1px' borderColor='border' borderRadius='md' p={4}>
      <HStack align='start' gap={2}>
        <Icon as={LuCircleCheck} boxSize={4} color='fg.success' mt='3px' flexShrink={0} />
        <Box>
          <Text fontSize='sm' fontWeight='semibold' lineHeight='1.5'>
            {t('voter_auth.status.valid_count', {
              defaultValue: 'All {{count}} members can sign in.',
              count: membersCount,
            })}
          </Text>
          <Text fontSize='sm' lineHeight='1.5' color='fg.muted' mt={1}>
            {t('voter_auth.certificate.all_valid', { defaultValue: 'Every member has a valid DNI/NIE.' })}
          </Text>
        </Box>
      </HStack>
    </Box>
  )
}

type IssuesReviewProps = {
  coverage: CertificateCoverage
  groupId: string | undefined
  open: string[]
  onToggle: (id: string) => void
  attempted: boolean
  duplicatesToggleRef: RefObject<HTMLButtonElement | null>
}

/** Summary of who cannot sign in and why, before the per-bucket detail. */
const Coverage = ({ coverage }: { coverage: CertificateCoverage }) => {
  const { t } = useTranslation()
  const hasDuplicates = coverage.duplicates.length > 0
  const hasIssues = coverage.cannotSignIn > 0

  return (
    <Stack borderWidth='1px' borderColor='border' borderRadius='md' p={4} gap={3}>
      {hasDuplicates && (
        <HStack align='start' gap={2}>
          <Icon as={LuCircleAlert} boxSize={4} color='fg.error' mt='3px' flexShrink={0} />
          <Box>
            <Text fontSize='sm' fontWeight='semibold' lineHeight='1.5' css={{ textWrap: 'pretty' }}>
              {t('voter_auth.status.duplicated_members', {
                defaultValue_one: "{{count}} member shares the same {{fields}}, so they can't be told apart.",
                defaultValue_other: "{{count}} members share the same {{fields}}, so they can't be told apart.",
                count: coverage.duplicates.length,
                fields: 'DNI/NIE',
              })}
            </Text>
            <Text fontSize='sm' lineHeight='1.5' color='fg.muted' mt={1}>
              {t('voter_auth.certificate.duplicates_body', {
                defaultValue: "Give each one their own DNI/NIE in your member list. You can save once it's fixed.",
              })}{' '}
              <Link href='#members-to-review' fontWeight='medium' color='fg'>
                {t('voter_auth.certificate.review', {
                  defaultValue: 'Review these {{count}}',
                  count: coverage.duplicates.length,
                  defaultValue_one: 'Review this member',
                  defaultValue_other: 'Review these {{count}}',
                })}
              </Link>
            </Text>
          </Box>
        </HStack>
      )}
      {hasIssues && (
        <HStack align='start' gap={2}>
          <Icon as={LuCircleAlert} boxSize={4} color='fg.error' mt='3px' flexShrink={0} />
          <Box>
            <Text fontSize='sm' fontWeight='semibold' lineHeight='1.5' css={{ textWrap: 'pretty' }}>
              {t('voter_auth.certificate.missing_title', {
                defaultValue: "{{count}} members are missing a valid DNI/NIE and can't sign in.",
                defaultValue_one: "{{count}} member is missing a valid DNI/NIE and can't sign in.",
                defaultValue_other: "{{count}} members are missing a valid DNI/NIE and can't sign in.",
                count: coverage.cannotSignIn,
              })}
            </Text>
            <Text fontSize='sm' lineHeight='1.5' color='fg.muted' mt={1}>
              {t('voter_auth.certificate.missing_body', {
                defaultValue: "Fix their DNI/NIE in your member list. If you save now, they won't be able to sign in.",
              })}{' '}
              <Link href='#members-to-review' fontWeight='medium' color='fg'>
                {t('voter_auth.certificate.review', {
                  defaultValue: 'Review these {{count}}',
                  count: coverage.cannotSignIn,
                  defaultValue_one: 'Review this member',
                  defaultValue_other: 'Review these {{count}}',
                })}
              </Link>
            </Text>
          </Box>
        </HStack>
      )}
    </Stack>
  )
}

const IssuesReview = ({ coverage, groupId, open, onToggle, attempted, duplicatesToggleRef }: IssuesReviewProps) => (
  <>
    <Coverage coverage={coverage} />
    <Buckets
      coverage={coverage}
      groupId={groupId}
      open={open}
      onToggle={onToggle}
      attempted={attempted}
      duplicatesToggleRef={duplicatesToggleRef}
    />
  </>
)

export type CertificateStepsProps = {
  coverage: CertificateCoverage | null
  membersCount?: number
  groupId?: string
  status: CensusCheckStatus
  open: string[]
  onToggle: (id: string) => void
  attempted: boolean
  duplicatesToggleRef: RefObject<HTMLButtonElement | null>
  onRetry: () => void
}

export const CertificateSteps = ({
  coverage,
  membersCount = 0,
  groupId,
  status,
  open,
  onToggle,
  attempted,
  duplicatesToggleRef,
  onRetry,
}: CertificateStepsProps) => {
  const { t } = useTranslation()
  const isClean = coverage !== null && coverage.cannotSignIn === 0 && coverage.duplicates.length === 0

  let body: React.ReactNode = null

  if (status === 'checking' && coverage === null) {
    body = (
      <HStack gap={2} fontSize='sm' color='fg.muted'>
        <Spinner size='xs' />
        <Text fontSize='inherit'>
          {t('voter_auth.status.checking', { defaultValue: 'Checking your member list…' })}
        </Text>
      </HStack>
    )
  } else if (status === 'unavailable') {
    body = (
      <HStack gap={2} fontSize='sm' color='fg.muted'>
        <Text fontSize='inherit'>
          {t('voter_auth.status.unavailable', {
            defaultValue: "We couldn't check your member list. You can still save.",
          })}{' '}
        </Text>
        <Link as='button' onClick={onRetry} fontWeight='medium' fontSize='sm'>
          {t('voter_auth.status.retry', { defaultValue: 'Check again' })}
        </Link>
      </HStack>
    )
  } else if (status === 'rejected') {
    body = (
      <Text fontSize='sm' color='fg.error'>
        {t('voter_auth.status.rejected', { defaultValue: "This sign-in can't be used with your member list." })}
      </Text>
    )
  } else if (coverage !== null) {
    body = isClean ? (
      <CleanCoverage membersCount={membersCount} />
    ) : (
      <IssuesReview
        coverage={coverage}
        groupId={groupId}
        open={open}
        onToggle={onToggle}
        attempted={attempted}
        duplicatesToggleRef={duplicatesToggleRef}
      />
    )
  }

  return (
    <>
      <Stack gap={3}>
        <StepHeading>{t('voter_auth.certificate.heading', { defaultValue: '2. Who can sign in?' })}</StepHeading>
        {body}
      </Stack>
      <CertificateProtection />
      <TellMembers />
    </>
  )
}
