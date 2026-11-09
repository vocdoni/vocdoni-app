import { Box, Button, Flex, Heading, Icon, List, Progress, Stack, Text } from '@chakra-ui/react'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { LuCircleCheck, LuDownload, LuSparkles } from 'react-icons/lu'
import type { Table } from '~components/Spreadsheet/readTable'
import { Banner } from '~components/ui/Banner'
import { SectionCard } from '~components/ui/SectionCard'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import { csvBlob, downloadBlob } from '~utils/download'
import { type FailedRow, type JobError, failedRowsSheet, mapFailedRows } from './failedRows'
import type { MemberRecord } from './detectIssues'
import type { ReceiptItem } from './receipt'
import type { ReturnToKind } from './returnTo'
import { useImportJob } from './useImportJob'

/** How many failed rows the receipt lists before pointing to the download */
const LISTED_FAILURES = 10

export type NextAction = 'create_vote' | 'return' | 'members'

type DoneStepProps = {
  jobId: string | null
  table: Table
  records: MemberRecord[]
  /** How many members were sent */
  sent: number
  sourceRows: number[]
  receipt: ReceiptItem[]
  returnTo: ReturnToKind | null
  onNext: (next: NextAction) => void
  /** The job ended: it no longer needs following from the People tab */
  onSettled: () => void
}

export const DoneStep = ({
  jobId,
  table,
  records,
  sent,
  sourceRows,
  receipt,
  returnTo,
  onNext,
  onSettled,
}: DoneStepProps) => {
  const { t, i18n } = useTranslation()
  const format = (value: number) => value.toLocaleString(i18n.resolvedLanguage)
  const job = useImportJob(jobId)
  // Without a job the members were added as the request returned
  const completed = !jobId || job.completed
  const added = jobId ? (job.data?.result?.added ?? 0) : sent
  const failures = useMemo(() => mapFailedRows(job.errors, sourceRows, table), [job.errors, sourceRows, table])

  useEffect(() => {
    if (completed || job.failed) onSettled()
  }, [completed, job.failed, onSettled])

  const describe = (error: JobError) => {
    switch (error.reason) {
      case 'email':
        return t('members.import.done.failed_email', { defaultValue: 'The email isn’t valid, so it was left out.' })
      case 'phone':
        return t('members.import.done.failed_phone', { defaultValue: 'The mobile isn’t valid, so it was left out.' })
      case 'birth_date':
        return t('members.import.done.failed_birth_date', {
          defaultValue: 'The birth date isn’t one we can read, so it was left out.',
        })
      default:
        return error.message
    }
  }

  const downloadFailures = () => {
    const sheet = failedRowsSheet(
      table,
      failures.rows,
      t('members.import.done.problem_column', { defaultValue: 'Problem' }),
      describe
    )
    downloadBlob(csvBlob(sheet), 'members-import-problems.csv')
    trackAnalyticsEvent({
      name: AnalyticsEvents.MembersImportErrorsDownloaded,
      props: { count: failures.rows.length },
    })
  }

  const nameOf = (row: FailedRow) =>
    [records[row.tableRow]?.name, records[row.tableRow]?.surname].filter(Boolean).join(' ') ||
    t('members.import.review.no_name', { defaultValue: 'No name' })

  const returnLabel =
    returnTo === 'draft'
      ? t('members.import.done.back_to_draft', { defaultValue: 'Back to your draft' })
      : returnTo === 'vote'
        ? t('members.import.done.back_to_vote', { defaultValue: 'Back to the vote' })
        : t('members.import.done.back', { defaultValue: 'Go back' })

  if (job.failed) {
    return (
      <Stack gap={5}>
        <Banner status='error'>
          {t('members.import.done.job_failed', {
            defaultValue: 'The import didn’t finish. Try again, or talk to us if it keeps happening.',
          })}
        </Banner>
        <Flex>
          <Button variant='outline' onClick={() => onNext('members')}>
            {t('members.import.done.back_to_members', { defaultValue: 'Back to members' })}
          </Button>
        </Flex>
      </Stack>
    )
  }

  if (!completed) {
    return (
      <SectionCard p={6}>
        <Stack gap={4} maxW='32rem'>
          <Heading as='h2' fontSize='lg' fontWeight='bolder'>
            {t('members.import.done.importing', {
              count: sent,
              formattedCount: format(sent),
              defaultValue_one: 'Importing {{formattedCount}} member…',
              defaultValue_other: 'Importing {{formattedCount}} members…',
            })}
          </Heading>
          <Progress.Root
            value={job.progress}
            aria-label={t('members.import.banner.label', { defaultValue: 'Import progress' })}
          >
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
          <Text fontSize='sm' color='fg.muted'>
            {t('members.import.done.leave', {
              defaultValue: 'You can leave this page: we’ll email you when it’s done.',
            })}
          </Text>
          <Box>
            <Button variant='outline' onClick={() => onNext('members')}>
              {t('members.import.done.back_to_members', { defaultValue: 'Back to members' })}
            </Button>
          </Box>
        </Stack>
      </SectionCard>
    )
  }

  const receiptText = (item: ReceiptItem) => {
    const list = (columns: string[]) => columns.map((column) => `“${column}”`).join(', ')
    switch (item.kind) {
      case 'matched':
        return t('members.import.done.receipt_matched', {
          matched: item.matched,
          total: item.total,
          columns: list(item.columns),
          defaultValue: 'Matched {{matched}} of {{total}} columns: {{columns}}.',
        })
      case 'encoding':
        return t('members.import.done.receipt_encoding', {
          defaultValue: 'Read the accents in your file correctly (it was saved in an older Windows format).',
        })
      case 'title_rows':
        return t('members.import.done.receipt_title_rows', {
          count: item.count,
          defaultValue_one: 'Skipped the title row above your column names.',
          defaultValue_other: 'Skipped the {{count}} title rows above your column names.',
        })
      case 'trimmed':
        return t('members.import.done.receipt_trimmed', {
          count: item.count,
          formattedCount: format(item.count),
          defaultValue_one: 'Removed extra spaces from one cell.',
          defaultValue_other: 'Removed extra spaces from {{formattedCount}} cells.',
        })
      case 'leading_zeros':
        return t('members.import.done.receipt_leading_zeros', {
          count: item.count,
          formattedCount: format(item.count),
          defaultValue_one: 'Kept the leading zeros of one value, like 00123.',
          defaultValue_other: 'Kept the leading zeros of {{formattedCount}} values, like 00123.',
        })
      case 'european_dates':
        return t('members.import.done.receipt_dates', {
          count: item.count,
          formattedCount: format(item.count),
          defaultValue_one: 'Read one birth date written day first (31/12/1990).',
          defaultValue_other: 'Read {{formattedCount}} birth dates written day first (31/12/1990).',
        })
      case 'duplicates':
        return t('members.import.done.receipt_duplicates', {
          count: item.count,
          defaultValue_one: 'Left out one repeated row, as you chose.',
          defaultValue_other: 'Left out {{count}} repeated rows, as you chose.',
        })
      case 'left_out':
        return t('members.import.done.receipt_left_out', {
          columns: list(item.columns),
          defaultValue: 'Left out {{columns}}, as you chose.',
        })
      case 'kept_extra':
        return t('members.import.done.receipt_extra', {
          columns: list(item.columns),
          defaultValue: 'Kept {{columns}} as extra info.',
        })
    }
  }

  const failedCount = failures.rows.length + failures.unplaced.length

  return (
    <Stack gap={5}>
      <Flex align='center' gap={3} role='status'>
        <Icon as={LuCircleCheck} boxSize={8} color='fg.success' aria-hidden />
        <Box>
          <Heading as='h2' fontSize='xl' fontWeight='bolder'>
            {t('members.import.done.added', {
              count: added,
              formattedCount: format(added),
              defaultValue_one: '{{formattedCount}} member added',
              defaultValue_other: '{{formattedCount}} members added',
            })}
          </Heading>
          <Text color='fg.muted' fontSize='sm'>
            {t('members.import.done.from_file', { file: table.fileName, defaultValue: 'From {{file}}' })}
          </Text>
        </Box>
      </Flex>

      {receipt.length > 0 && (
        <SectionCard>
          <Heading as='h3' fontSize='sm' fontWeight='bolder' display='flex' alignItems='center' gap={2} mb={3}>
            <Icon as={LuSparkles} color='fg.muted' aria-hidden />
            {t('members.import.done.receipt_title', { defaultValue: 'What we did for you' })}
          </Heading>
          {/* ph-no-capture: column names can be personal ("Jordi's notes") */}
          <List.Root className='ph-no-capture' ps={5} gap={1.5} fontSize='sm'>
            {receipt.map((item, index) => (
              <List.Item key={`${item.kind}-${index}`}>{receiptText(item)}</List.Item>
            ))}
          </List.Root>
        </SectionCard>
      )}

      {failedCount > 0 && (
        <SectionCard
          title={t('members.import.done.failed_title', {
            count: failedCount,
            defaultValue_one: 'One row was imported without a value we couldn’t use',
            defaultValue_other: '{{count}} rows were imported without a value we couldn’t use',
          })}
          action={
            failures.rows.length > 0 && (
              <Button size='sm' variant='outline' onClick={downloadFailures}>
                <Icon as={LuDownload} />
                {t('members.import.done.download_failed', {
                  count: failures.rows.length,
                  defaultValue_one: 'Download the row',
                  defaultValue_other: 'Download the {{count}} rows',
                })}
              </Button>
            )
          }
        >
          {/* ph-no-capture: names and the backend's messages quote the members' data */}
          <List.Root className='ph-no-capture' ps={5} gap={1.5} fontSize='sm'>
            {failures.rows.slice(0, LISTED_FAILURES).map((row) => (
              <List.Item key={row.tableRow}>
                <Text as='span' fontSize='sm' fontVariantNumeric='tabular-nums' color='fg.muted'>
                  {t('members.import.review.row_number', { row: row.rowNumber, defaultValue: 'Row {{row}}' })}
                </Text>{' '}
                · {nameOf(row)} · {row.reasons.map(describe).join(' ')}
              </List.Item>
            ))}
            {failures.unplaced.slice(0, LISTED_FAILURES).map((error, index) => (
              <List.Item key={`unplaced-${index}`}>{error.message}</List.Item>
            ))}
          </List.Root>
          {failures.rows.length > LISTED_FAILURES && (
            <Text fontSize='sm' color='fg.muted' mt={2}>
              {t('members.import.done.more_failed', {
                count: failures.rows.length - LISTED_FAILURES,
                defaultValue: 'And {{count}} more in the download.',
              })}
            </Text>
          )}
        </SectionCard>
      )}

      <Flex gap={3} wrap='wrap'>
        <Button onClick={() => onNext('create_vote')}>
          {t('members.import.done.create_vote', { defaultValue: 'Create a vote with everyone' })}
        </Button>
        {returnTo && (
          <Button variant='outline' onClick={() => onNext('return')}>
            {returnLabel}
          </Button>
        )}
        <Button variant='outline' onClick={() => onNext('members')}>
          {t('members.import.done.back_to_members', { defaultValue: 'Back to members' })}
        </Button>
      </Flex>
    </Stack>
  )
}
