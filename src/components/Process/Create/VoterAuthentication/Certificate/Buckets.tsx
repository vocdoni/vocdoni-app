import { Badge, Box, Button, Flex, Icon, Stack, Text } from '@chakra-ui/react'
import type { RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { LuChevronDown, LuCircleAlert, LuDownload } from 'react-icons/lu'
import { getAuthFieldLabel } from '~components/Process/CSP/fields'
import type { CertificateCoverage, InvalidReason } from '~src/queries/certificateAuth/warnings'
import { downloadCsv, toCsv } from './csv'
import { useBucketMembers } from './useBucketMembers'

// Rows shown before the "and N more in the CSV" overflow line.
const MAX_ROWS = 6
const ROWS_WHEN_OVERFLOW = 4

type BucketsProps = {
  coverage: CertificateCoverage
  groupId: string | undefined
  open: string[]
  onToggle: (id: string) => void
  attempted: boolean
  duplicatesToggleRef: RefObject<HTMLButtonElement | null>
}

type BucketShellProps = {
  id: string
  title: string
  count: number
  open: boolean
  onToggle: () => void
  /** Bucket blocks saving and the user tried to save; a 2px error border makes it unmissable. */
  flagged?: boolean
  toggleRef?: RefObject<HTMLButtonElement | null>
  children: React.ReactNode
}

const BucketShell = ({ id, title, count, open, onToggle, flagged, toggleRef, children }: BucketShellProps) => (
  <Box
    border={flagged ? '2px solid' : '1px solid'}
    borderColor={flagged ? 'border.error' : 'border'}
    bg='bg'
    borderRadius='md'
  >
    <Button
      ref={toggleRef}
      variant='plain'
      w='full'
      h='auto'
      px={3}
      py={3}
      justifyContent='start'
      alignItems='start'
      whiteSpace='normal'
      textAlign='left'
      aria-expanded={open}
      aria-controls={`bucket-${id}`}
      onClick={onToggle}
    >
      <Icon as={LuCircleAlert} color='fg.error' boxSize={4} mt='3px' />
      <Text fontSize='sm' fontWeight='semibold' lineHeight='1.4' flex='1' minW={0}>
        {title}
      </Text>
      <Badge variant='surface' colorPalette='red'>
        {count}
      </Badge>
      <Icon
        as={LuChevronDown}
        mt='3px'
        transform={open ? 'rotate(180deg)' : undefined}
        transition='transform 150ms ease'
        _motionReduce={{ transition: 'none' }}
      />
    </Button>
    {open && (
      <Box px={3} pb={3} id={`bucket-${id}`}>
        {children}
      </Box>
    )}
  </Box>
)

// ph-no-capture: member names and national IDs are never recorded in session replays
const Rows = ({ children }: { children: React.ReactNode }) => (
  <Stack gap={0} border='1px solid' borderColor='border' borderRadius='sm' bg='bg' className='ph-no-capture'>
    {children}
  </Stack>
)

const Row = ({ first, children }: { first?: boolean; children: React.ReactNode }) => (
  <Flex
    gap={{ base: 0, sm: 3 }}
    direction={{ base: 'column', sm: 'row' }}
    justify='space-between'
    px={3}
    py={2}
    borderTop={first ? undefined : '1px solid'}
    borderColor='border'
  >
    {children}
  </Flex>
)

type DownloadProps = { label: string; onClick: () => void }

const Download = ({ label, onClick }: DownloadProps) => (
  <Button variant='plain' size='sm' px={0} mt={2} h='auto' textDecoration='underline' onClick={onClick}>
    <Icon as={LuDownload} />
    {label}
  </Button>
)

// ---- missing bucket ----

type MissingBucketBodyProps = {
  ids: string[]
  groupId: string | undefined
  bucketOpen: boolean
}

const MissingBucketBody = ({ ids, groupId, bucketOpen }: MissingBucketBodyProps) => {
  const { t } = useTranslation()
  const { data: members, isLoading } = useBucketMembers(groupId, ids, bucketOpen)

  const handleDownload = () => {
    if (!members) return
    // Column labels come from the shared auth-field label helper so they stay consistent.
    const header = [
      getAuthFieldLabel(t, 'name'),
      getAuthFieldLabel(t, 'surname'),
      getAuthFieldLabel(t, 'memberNumber'),
      getAuthFieldLabel(t, 'nationalId'),
    ]
    const rows = ids.map((id) => {
      const m = members.get(id)
      return [m?.name ?? '', m?.surname ?? '', m?.memberNumber ?? '', m?.nationalId ?? '']
    })
    downloadCsv('members-without-dni-nie.csv', toCsv([header, ...rows]))
  }

  if (isLoading) {
    return (
      <Text fontSize='sm' color='fg.muted'>
        {t('voter_auth.certificate.loading_members', { defaultValue: 'Loading these members…' })}
      </Text>
    )
  }

  const displayIds = ids.length > MAX_ROWS ? ids.slice(0, ROWS_WHEN_OVERFLOW) : ids
  const moreCount = ids.length > MAX_ROWS ? ids.length - ROWS_WHEN_OVERFLOW : 0

  return (
    <>
      <Rows>
        {displayIds.map((id, i) => {
          const m = members?.get(id)
          return (
            <Row key={id} first={i === 0}>
              <Box flex='1' minW={0}>
                <Text fontSize='sm' lineHeight='1.5'>
                  {m?.name ? `${m.name}${m.surname ? ' ' + m.surname : ''}` : id}
                </Text>
              </Box>
              <Box flexShrink={0}>
                {m?.nationalId ? (
                  <Text fontSize='sm' fontFamily='mono' as='span'>
                    {m.nationalId}
                  </Text>
                ) : (
                  <Text fontSize='sm' color='fg.muted' as='span'>
                    {t('voter_auth.certificate.empty', { defaultValue: 'empty' })}
                  </Text>
                )}
              </Box>
            </Row>
          )
        })}
      </Rows>
      {moreCount > 0 && (
        <Text fontSize='xs' color='fg.muted' mt={2}>
          {t('voter_auth.certificate.more_in_csv', {
            defaultValue: 'and {{count}} more in the CSV',
            defaultValue_one: 'and {{count}} more in the CSV',
            defaultValue_other: 'and {{count}} more in the CSV',
            count: moreCount,
          })}
        </Text>
      )}
      <Download
        label={t('voter_auth.certificate.download', {
          defaultValue: 'Download {{file}}',
          file: 'members-without-dni-nie.csv',
        })}
        onClick={handleDownload}
      />
    </>
  )
}

// ---- invalid bucket ----

const reasonLabel = (t: ReturnType<typeof useTranslation>['t'], reason: InvalidReason): string =>
  reason === 'letter'
    ? t('voter_auth.certificate.reason_letter', { defaultValue: "Letter doesn't match" })
    : t('voter_auth.certificate.reason_not_dni', { defaultValue: 'Not a DNI or NIE' })

type InvalidBucketBodyProps = {
  entries: { memberId: string; reason: InvalidReason }[]
  groupId: string | undefined
  bucketOpen: boolean
}

const InvalidBucketBody = ({ entries, groupId, bucketOpen }: InvalidBucketBodyProps) => {
  const { t } = useTranslation()
  const ids = entries.map((e) => e.memberId)
  const { data: members, isLoading } = useBucketMembers(groupId, ids, bucketOpen)

  const handleDownload = () => {
    if (!members) return
    const header = [
      getAuthFieldLabel(t, 'name'),
      getAuthFieldLabel(t, 'surname'),
      getAuthFieldLabel(t, 'memberNumber'),
      getAuthFieldLabel(t, 'nationalId'),
      t('voter_auth.certificate.csv_reason', { defaultValue: 'Reason' }),
    ]
    const rows = entries.map(({ memberId, reason }) => {
      const m = members.get(memberId)
      return [m?.name ?? '', m?.surname ?? '', m?.memberNumber ?? '', m?.nationalId ?? '', reasonLabel(t, reason)]
    })
    downloadCsv('invalid-dni-nie.csv', toCsv([header, ...rows]))
  }

  if (isLoading) {
    return (
      <Text fontSize='sm' color='fg.muted'>
        {t('voter_auth.certificate.loading_members', { defaultValue: 'Loading these members…' })}
      </Text>
    )
  }

  const displayEntries = entries.length > MAX_ROWS ? entries.slice(0, ROWS_WHEN_OVERFLOW) : entries
  const moreCount = entries.length > MAX_ROWS ? entries.length - ROWS_WHEN_OVERFLOW : 0

  return (
    <>
      <Rows>
        {displayEntries.map(({ memberId, reason }, i) => {
          const m = members?.get(memberId)
          return (
            <Row key={memberId} first={i === 0}>
              <Box flex='1' minW={0}>
                <Text fontSize='sm' lineHeight='1.5'>
                  {m?.name ? `${m.name}${m.surname ? ' ' + m.surname : ''}` : memberId}
                </Text>
                <Text fontSize='xs' lineHeight='1.5' color='fg.muted' mt={0.5}>
                  {reasonLabel(t, reason)}
                </Text>
              </Box>
              <Box flexShrink={0}>
                {m?.nationalId ? (
                  <Text fontSize='sm' fontFamily='mono' as='span'>
                    {m.nationalId}
                  </Text>
                ) : (
                  <Text fontSize='sm' color='fg.muted' as='span'>
                    {t('voter_auth.certificate.empty', { defaultValue: 'empty' })}
                  </Text>
                )}
              </Box>
            </Row>
          )
        })}
      </Rows>
      {moreCount > 0 && (
        <Text fontSize='xs' color='fg.muted' mt={2}>
          {t('voter_auth.certificate.more_in_csv', {
            defaultValue: 'and {{count}} more in the CSV',
            defaultValue_one: 'and {{count}} more in the CSV',
            defaultValue_other: 'and {{count}} more in the CSV',
            count: moreCount,
          })}
        </Text>
      )}
      <Download
        label={t('voter_auth.certificate.download', {
          defaultValue: 'Download {{file}}',
          file: 'invalid-dni-nie.csv',
        })}
        onClick={handleDownload}
      />
    </>
  )
}

// ---- duplicates bucket ----

type DupBucketBodyProps = {
  ids: string[]
  groupId: string | undefined
  bucketOpen: boolean
}

const DupBucketBody = ({ ids, groupId, bucketOpen }: DupBucketBodyProps) => {
  const { t } = useTranslation()
  const { data: members, isLoading } = useBucketMembers(groupId, ids, bucketOpen)

  const handleDownload = () => {
    if (!members) return
    const header = [
      getAuthFieldLabel(t, 'name'),
      getAuthFieldLabel(t, 'surname'),
      getAuthFieldLabel(t, 'memberNumber'),
      getAuthFieldLabel(t, 'nationalId'),
    ]
    const rows = ids.map((id) => {
      const m = members.get(id)
      return [m?.name ?? '', m?.surname ?? '', m?.memberNumber ?? '', m?.nationalId ?? '']
    })
    downloadCsv('duplicate-dni-nie.csv', toCsv([header, ...rows]))
  }

  if (isLoading) {
    return (
      <Text fontSize='sm' color='fg.muted'>
        {t('voter_auth.certificate.loading_members', { defaultValue: 'Loading these members…' })}
      </Text>
    )
  }

  const displayIds = ids.length > MAX_ROWS ? ids.slice(0, ROWS_WHEN_OVERFLOW) : ids
  const moreCount = ids.length > MAX_ROWS ? ids.length - ROWS_WHEN_OVERFLOW : 0

  return (
    <>
      <Rows>
        {displayIds.map((id, i) => {
          const m = members?.get(id)
          return (
            <Row key={id} first={i === 0}>
              <Box flex='1' minW={0}>
                <Text fontSize='sm' lineHeight='1.5'>
                  {m?.name ? `${m.name}${m.surname ? ' ' + m.surname : ''}` : id}
                </Text>
              </Box>
              <Box flexShrink={0}>
                {m?.nationalId ? (
                  <Text fontSize='sm' fontFamily='mono' as='span'>
                    {m.nationalId}
                  </Text>
                ) : (
                  <Text fontSize='sm' color='fg.muted' as='span'>
                    {t('voter_auth.certificate.empty', { defaultValue: 'empty' })}
                  </Text>
                )}
              </Box>
            </Row>
          )
        })}
      </Rows>
      {moreCount > 0 && (
        <Text fontSize='xs' color='fg.muted' mt={2}>
          {t('voter_auth.certificate.more_in_csv', {
            defaultValue: 'and {{count}} more in the CSV',
            defaultValue_one: 'and {{count}} more in the CSV',
            defaultValue_other: 'and {{count}} more in the CSV',
            count: moreCount,
          })}
        </Text>
      )}
      <Download
        label={t('voter_auth.certificate.download', {
          defaultValue: 'Download {{file}}',
          file: 'duplicate-dni-nie.csv',
        })}
        onClick={handleDownload}
      />
    </>
  )
}

// ---- exported Buckets component ----

export const Buckets = ({ coverage, groupId, open, onToggle, attempted, duplicatesToggleRef }: BucketsProps) => {
  const { t } = useTranslation()
  const hasDuplicates = coverage.duplicates.length > 0

  return (
    <Stack gap={3}>
      <Text fontSize='sm' fontWeight='semibold' id='members-to-review'>
        {t('voter_auth.certificate.members_to_review', { defaultValue: 'Members to review' })}
      </Text>

      {hasDuplicates && (
        <BucketShell
          id='dup'
          title={t('voter_auth.certificate.bucket_duplicates', {
            defaultValue: 'Same DNI/NIE on more than one member: fix to save',
          })}
          count={coverage.duplicates.length}
          open={open.includes('dup')}
          onToggle={() => onToggle('dup')}
          flagged={attempted}
          toggleRef={duplicatesToggleRef}
        >
          <DupBucketBody ids={coverage.duplicates} groupId={groupId} bucketOpen={open.includes('dup')} />
        </BucketShell>
      )}

      {coverage.missing.length > 0 && (
        <BucketShell
          id='missing'
          title={t('voter_auth.certificate.bucket_missing', { defaultValue: "No DNI/NIE: can't sign in" })}
          count={coverage.missing.length}
          open={open.includes('missing')}
          onToggle={() => onToggle('missing')}
        >
          <MissingBucketBody ids={coverage.missing} groupId={groupId} bucketOpen={open.includes('missing')} />
        </BucketShell>
      )}

      {coverage.invalid.length > 0 && (
        <BucketShell
          id='invalid'
          title={t('voter_auth.certificate.bucket_invalid', { defaultValue: "Invalid DNI/NIE: can't sign in" })}
          count={coverage.invalid.length}
          open={open.includes('invalid')}
          onToggle={() => onToggle('invalid')}
        >
          <InvalidBucketBody entries={coverage.invalid} groupId={groupId} bucketOpen={open.includes('invalid')} />
        </BucketShell>
      )}
    </Stack>
  )
}
