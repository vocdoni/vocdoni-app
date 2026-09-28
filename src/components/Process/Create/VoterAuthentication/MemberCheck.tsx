import { Box, Button, HStack, Icon, Link, Spinner, Text } from '@chakra-ui/react'
import { forwardRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { LuCircleAlert, LuCircleCheck, LuExternalLink, LuTriangleAlert } from 'react-icons/lu'
import { Routes } from '~routes'
import { CensusCheckIssues, CensusCheckOutcome, CensusCheckStatus } from './useCensusCheck'

type MemberCheckProps = {
  status: CensusCheckStatus
  issues: CensusCheckIssues | null
  /** The last finished result, shown dimmed while a new check runs. */
  previous: CensusCheckOutcome | null
  /** What a member flagged as missing data lacks, e.g. "Member Number or Email". */
  missingFields: string
  /** What two flagged duplicates have in common, e.g. "Member Number and Email". */
  duplicateFields: string
  /** Which field each incomplete member lacks, once known; replaces the combined sentence. */
  missingByField?: { label: string; count: number }[] | null
  membersCount?: number
  /** Set when the admin tried to save without choosing anything. */
  emptyAttempt: boolean
  onRetry: () => void
}

type LineProps = { icon: ReactNode; busy?: boolean; color?: string; children: ReactNode }

// While a re-check runs, the spinner takes the icon's place.
const Line = ({ icon, busy, color, children }: LineProps) => (
  <HStack gap={2} align='start' fontSize='sm' color={color}>
    <Box as='span' flexShrink={0} mt={0.5} display='inline-flex'>
      {busy ? <Spinner size='xs' /> : icon}
    </Box>
    <Box>{children}</Box>
  </HStack>
)

/**
 * The outcome of checking the member list against the chosen details, said as
 * what it means for voting day. Lives in the dialog footer, beside the Save it
 * can block, so the verdict never scrolls out of view.
 *
 * It is the dialog's live region: focus moves here when Save is refused.
 */
export const MemberCheck = forwardRef<HTMLDivElement, MemberCheckProps>(
  (
    { status, issues, previous, missingFields, duplicateFields, missingByField, membersCount, emptyAttempt, onRetry },
    ref
  ) => {
    const { t } = useTranslation()

    // Re-checks keep the last result on screen (dimmed) rather than flickering
    // to a "checking" line; only the very first check says so.
    const shown = status === 'checking' ? previous : status === 'idle' ? null : { status, issues }
    const rechecking = status === 'checking' && !!previous

    let content: ReactNode = null
    if (!shown) {
      if (status === 'checking') {
        content = (
          <Line icon={<Spinner size='xs' />} color='fg.muted'>
            {t('voter_auth.status.checking', { defaultValue: 'Checking your member list…' })}
          </Line>
        )
      } else if (emptyAttempt) {
        content = (
          <Line icon={<Icon as={LuCircleAlert} boxSize={4} />} color='fg.error'>
            {t('voter_auth.status.empty', { defaultValue: 'Choose at least one detail or a code.' })}
          </Line>
        )
      }
    } else if (shown.status === 'valid') {
      content = (
        <Line icon={<Icon as={LuCircleCheck} boxSize={4} color='fg.success' />} busy={rechecking}>
          {membersCount
            ? t('voter_auth.status.valid_count', {
                defaultValue: 'All {{count}} members can sign in.',
                count: membersCount,
              })
            : t('voter_auth.status.valid', { defaultValue: 'All members can sign in.' })}
        </Line>
      )
    } else if (shown.status === 'unavailable') {
      content = (
        <Line icon={<Icon as={LuTriangleAlert} boxSize={4} color='fg.warning' />} busy={rechecking}>
          {t('voter_auth.status.unavailable', {
            defaultValue: "We couldn't check your member list. You can still save.",
          })}{' '}
          <Button variant='plain' size='xs' h='auto' p={0} textDecoration='underline' onClick={onRetry}>
            {t('voter_auth.status.retry', { defaultValue: 'Check again' })}
          </Button>
        </Line>
      )
    } else {
      // Counts come from the two issue lists only. `memberIds` lists the members
      // that PASS the check, so it is never a count of anything wrong. Both
      // lists are exact: a clashing pair lists both of its members.
      const missing = shown.issues?.missingData.length ?? 0
      const duplicates = shown.issues?.duplicates.length ?? 0

      // Facts only: what is wrong, and with how many members. Saving stays
      // blocked either way (a duplicate makes the backend refuse the whole
      // census), so no guessed consequence and no advice on what to pick.
      content = (
        <Line icon={<Icon as={LuCircleAlert} boxSize={4} color='fg.error' />} busy={rechecking}>
          {duplicates > 0 && (
            <Text as='span' fontSize='inherit' fontWeight='medium' color='fg.error'>
              {t('voter_auth.status.duplicated_members', {
                defaultValue: "{{count}} members share the same {{fields}}, so they can't be told apart.",
                count: duplicates,
                fields: duplicateFields,
              })}{' '}
            </Text>
          )}
          {missing > 0 &&
            (missingByField?.length ? missingByField : [{ label: missingFields, count: missing }]).map(
              ({ label, count }) => (
                <Text key={label} as='span' fontSize='inherit' fontWeight='medium' color='fg.error'>
                  {t('voter_auth.status.missing_members', {
                    defaultValue: '{{count}} members are missing {{fields}}.',
                    count,
                    fields: label,
                  })}{' '}
                </Text>
              )
            )}
          <Link href={Routes.dashboard.memberbase.base} target='_blank' rel='noopener noreferrer' fontWeight='medium'>
            {t('voter_auth.status.fix', { defaultValue: 'Fix your member list' })}
            <Icon as={LuExternalLink} boxSize={3} />
          </Link>
        </Line>
      )
    }

    return (
      <Box
        ref={ref}
        tabIndex={-1}
        role='status'
        aria-live='polite'
        aria-busy={status === 'checking'}
        outline='none'
        opacity={rechecking ? 0.6 : 1}
        transition='opacity 0.15s'
        data-testid='member-check'
        data-status={status}
      >
        {content}
      </Box>
    )
  }
)

MemberCheck.displayName = 'MemberCheck'
