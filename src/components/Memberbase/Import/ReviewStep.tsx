import { Box, Button, Flex, Grid, Heading, Icon, Input, Stack, Table, Text, VisuallyHidden } from '@chakra-ui/react'
import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuCheck, LuMail, LuMessageSquare, LuTriangleAlert } from 'react-icons/lu'
import type { Table as FileTable } from '~components/Spreadsheet/readTable'
import { FilterPills } from '~components/ui/FilterPills'
import { SectionCard } from '~components/ui/SectionCard'
import { type MemberFieldId, useMemberFields } from '../fields'
import {
  countReadiness,
  type DuplicateGroup,
  type DuplicateKey,
  type IssueKind,
  type IssueReport,
  type MemberRecord,
  type RowIssue,
} from './detectIssues'
import type { DuplicateDecision } from './payload'

const PAGE = 50

type Filter = 'all' | 'problems'

type ReviewStepProps = {
  table: FileTable
  records: MemberRecord[]
  report: IssueReport
  /** The rows that will be imported, once duplicates are settled */
  included: number[]
  decisions: Record<string, DuplicateDecision>
  onDecide: (group: DuplicateGroup, decision: DuplicateDecision) => void
  onEdit: (row: number, field: MemberFieldId, value: string) => void
  onBack: () => void
  onSubmit: () => void
  submitting: boolean
}

const displayName = (record: MemberRecord) => [record.name, record.surname].filter(Boolean).join(' ')

/** The field a problem is fixed in, given what was typed: an email or mobile can fix "no contact". */
const fieldFor = (issue: RowIssue, value: string): MemberFieldId =>
  issue.kind === 'no_contact' && value && !value.includes('@') ? 'phone' : issue.field

export const ReviewStep = ({
  table,
  records,
  report,
  included,
  decisions,
  onDecide,
  onEdit,
  onBack,
  onSubmit,
  submitting,
}: ReviewStepProps) => {
  const { t, i18n } = useTranslation()
  const format = (value: number) => value.toLocaleString(i18n.resolvedLanguage)

  const issueRows = useMemo(() => included.filter((row) => report.rows[row].length > 0), [included, report.rows])
  const undecidedRows = report.duplicates
    .filter((group) => !decisions[group.id])
    .reduce((sum, group) => sum + group.rows.length, 0)
  const problemCount = issueRows.length + undecidedRows
  const readiness = useMemo(() => countReadiness(included.map((row) => records[row])), [included, records])

  const [filter, setFilter] = useState<Filter>(() => (problemCount > 0 ? 'problems' : 'all'))
  const [shown, setShown] = useState(PAGE)
  // Rows fixed since the last filter change: they stay listed, with a tick
  const [fixed, setFixed] = useState<Set<number>>(new Set())
  const [focusRow, setFocusRow] = useState<number | null>(null)
  const inputs = useRef(new Map<number, HTMLInputElement>())

  const changeFilter = (next: Filter) => {
    setFilter(next)
    setShown(PAGE)
    setFixed(new Set())
  }

  const problemList = useMemo(() => {
    const rows = new Set([...issueRows, ...fixed])
    return included.filter((row) => rows.has(row))
  }, [included, issueRows, fixed])
  const list = filter === 'problems' ? problemList : included
  const visible = list.slice(0, shown)

  useEffect(() => {
    if (focusRow === null) return
    const input = inputs.current.get(focusRow)
    input?.focus()
    input?.select()
    setFocusRow(null)
  }, [focusRow, visible])

  const commit = (row: number, issue: RowIssue, value: string, moveOn: boolean) => {
    const changed = value.trim() !== (records[row][issue.field] ?? '')
    if (changed) {
      onEdit(row, fieldFor(issue, value.trim()), value.trim())
      setFixed((previous) => new Set(previous).add(row))
    }
    if (!moveOn) return
    // The row's next problem first (a bad email fixed, a bad mobile left), then the next row's
    if (changed && report.rows[row].length > 1) {
      setFocusRow(row)
      return
    }
    const position = problemList.indexOf(row)
    const next = problemList.slice(position + 1).find((candidate) => report.rows[candidate].length > 0)
    if (next !== undefined) {
      if (problemList.indexOf(next) >= shown) setShown((count) => count + PAGE)
      setFocusRow(next)
    }
  }

  const whatToFix: Record<IssueKind, string> = {
    invalid_email: t('members.import.review.fix_email', {
      defaultValue: 'This email isn’t valid. Fix it, or they’re imported without it.',
    }),
    invalid_phone: t('members.import.review.fix_phone', {
      defaultValue: 'This mobile isn’t valid. Use digits, with the country code (+34…) if it’s from abroad.',
    }),
    no_contact: t('members.import.review.fix_contact', {
      defaultValue: 'Add an email or mobile, or they won’t get a voting code.',
    }),
    no_name: t('members.import.review.fix_name', { defaultValue: 'Add their name.' }),
  }
  const placeholders: Record<IssueKind, string> = {
    invalid_email: t('members.import.review.placeholder_email', { defaultValue: 'Email' }),
    invalid_phone: t('members.import.review.placeholder_phone', { defaultValue: 'Mobile' }),
    no_contact: t('members.import.review.placeholder_contact', { defaultValue: 'Email or mobile' }),
    no_name: t('members.import.review.placeholder_name', { defaultValue: 'Name' }),
  }

  const tiles = [
    {
      key: 'email',
      icon: LuMail,
      count: readiness.email,
      label: t('members.import.review.ready_email', { defaultValue: 'Can get a code by email' }),
    },
    {
      key: 'sms',
      icon: LuMessageSquare,
      count: readiness.sms,
      label: t('members.import.review.ready_sms', { defaultValue: 'By SMS only' }),
    },
    {
      key: 'none',
      icon: LuTriangleAlert,
      count: readiness.none,
      label: t('members.import.review.ready_none', { defaultValue: 'Neither yet' }),
    },
  ]

  return (
    <Stack
      as='form'
      gap={5}
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <Grid templateColumns={{ base: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }} gap={3}>
        {tiles.map((tile) => (
          <SectionCard key={tile.key} py={3}>
            <Flex align='center' gap={3}>
              <Icon
                as={tile.icon}
                boxSize={5}
                color={tile.key === 'none' && tile.count ? 'fg.warning' : 'fg.muted'}
                aria-hidden
              />
              <Box minW={0}>
                <Text fontSize='xl' fontWeight='bolder' fontVariantNumeric='tabular-nums' lineHeight='short'>
                  {format(tile.count)}
                </Text>
                <Text fontSize='sm' color='fg.muted'>
                  {tile.label}
                </Text>
              </Box>
            </Flex>
          </SectionCard>
        ))}
      </Grid>

      <FilterPills<Filter>
        label={t('members.import.review.filter_label', { defaultValue: 'Rows to show' })}
        current={filter}
        onSelect={changeFilter}
        items={[
          {
            value: 'all',
            label: t('members.import.review.all_rows', { defaultValue: 'All rows' }),
            count: format(included.length),
          },
          {
            value: 'problems',
            label: t('members.import.review.problem_rows', { defaultValue: 'Only rows with problems' }),
            count: format(problemCount),
          },
        ]}
      />

      {report.duplicates.length > 0 && (
        <Duplicates
          table={table}
          records={records}
          groups={report.duplicates}
          decisions={decisions}
          onDecide={onDecide}
        />
      )}

      {filter === 'problems' && problemList.length === 0 ? (
        <SectionCard>
          <Flex align='center' gap={2}>
            <Icon as={LuCheck} color='fg.success' aria-hidden />
            <Text fontSize='sm'>
              {t('members.import.review.no_problems', { defaultValue: 'No problems left in the rows.' })}
            </Text>
          </Flex>
        </SectionCard>
      ) : (
        <Box borderWidth='1px' borderColor='border' borderRadius='md' overflowX='auto'>
          {/* ph-no-capture: the rows are the members' own data */}
          {/* Phones: each row becomes a small card (number and name, then the value and what to fix) */}
          <Table.Root size='sm' className='ph-no-capture' display={{ base: 'block', md: 'table' }}>
            <VisuallyHidden as='caption'>
              {filter === 'problems'
                ? t('members.import.review.problem_rows', { defaultValue: 'Only rows with problems' })
                : t('members.import.review.all_rows', { defaultValue: 'All rows' })}
            </VisuallyHidden>
            <Table.Header display={{ base: 'none', md: 'table-header-group' }}>
              <Table.Row>
                <Table.ColumnHeader w='4.5rem'>
                  {t('members.import.review.row', { defaultValue: 'Row' })}
                </Table.ColumnHeader>
                <Table.ColumnHeader>{t('members.import.review.name', { defaultValue: 'Name' })}</Table.ColumnHeader>
                <Table.ColumnHeader minW='14rem'>
                  {t('members.import.review.value', { defaultValue: 'Value' })}
                </Table.ColumnHeader>
                <Table.ColumnHeader minW='14rem'>
                  {t('members.import.review.what_to_fix', { defaultValue: 'What to fix' })}
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body display={{ base: 'block', md: 'table-row-group' }}>
              {visible.map((row) => {
                const record = records[row]
                const [issue] = report.rows[row]
                const wasFixed = fixed.has(row) && !issue
                const field = issue?.field
                return (
                  <Table.Row
                    key={row}
                    display={{ base: 'grid', md: 'table-row' }}
                    gridTemplateColumns='auto minmax(0, 1fr)'
                    columnGap={2}
                    py={{ base: 2, md: 0 }}
                    borderBottomWidth={{ base: '1px', md: 0 }}
                    borderColor='border'
                  >
                    <Table.Cell
                      fontVariantNumeric='tabular-nums'
                      color='fg.muted'
                      borderBottomWidth={{ base: 0, md: '1px' }}
                    >
                      {table.rowNumbers[row]}
                    </Table.Cell>
                    <Table.Cell borderBottomWidth={{ base: 0, md: '1px' }}>
                      {displayName(record) || (
                        <Text as='span' fontSize='sm' color='fg.muted'>
                          {t('members.import.review.no_name', { defaultValue: 'No name' })}
                        </Text>
                      )}
                    </Table.Cell>
                    <Table.Cell gridColumn='1 / -1' borderBottomWidth={{ base: 0, md: '1px' }}>
                      {issue && field ? (
                        <Input
                          key={`${row}:${field}:${record[field] ?? ''}`}
                          ref={(element) => {
                            if (element) inputs.current.set(row, element)
                            else inputs.current.delete(row)
                          }}
                          size='sm'
                          fontSize={{ base: 'md', md: 'sm' }}
                          autoComplete='off'
                          defaultValue={record[field] ?? ''}
                          placeholder={placeholders[issue.kind]}
                          aria-label={t('members.import.review.edit_label', {
                            row: table.rowNumbers[row],
                            field: placeholders[issue.kind],
                            defaultValue: '{{field}}, row {{row}}',
                          })}
                          onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                            if (event.key !== 'Enter') return
                            event.preventDefault()
                            commit(row, issue, event.currentTarget.value, true)
                          }}
                          onBlur={(event) => commit(row, issue, event.currentTarget.value, false)}
                        />
                      ) : (
                        <Text as='span' fontSize='sm' color='fg.muted' truncate>
                          {record.email || record.phone || ''}
                        </Text>
                      )}
                    </Table.Cell>
                    <Table.Cell fontSize='sm' gridColumn='1 / -1' borderBottomWidth={{ base: 0, md: '1px' }}>
                      {issue ? (
                        report.rows[row].map((rowIssue) => (
                          <Text key={rowIssue.kind} fontSize='sm'>
                            {whatToFix[rowIssue.kind]}
                          </Text>
                        ))
                      ) : wasFixed ? (
                        <Flex align='center' gap={1.5} color='fg.success'>
                          <Icon as={LuCheck} aria-hidden />
                          {t('members.import.review.fixed', { defaultValue: 'Fixed' })}
                        </Flex>
                      ) : (
                        <Text as='span' fontSize='sm' color='fg.muted'>
                          {t('members.import.review.ok', { defaultValue: 'Ready' })}
                        </Text>
                      )}
                    </Table.Cell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table.Root>
          {list.length > shown && (
            <Flex justify='center' p={3} borderTopWidth='1px' borderColor='border'>
              <Button type='button' size='sm' variant='ghost' onClick={() => setShown((count) => count + PAGE)}>
                {t('members.import.review.show_more', {
                  count: Math.min(PAGE, list.length - shown),
                  defaultValue: 'Show {{count}} more',
                })}
              </Button>
            </Flex>
          )}
        </Box>
      )}

      <Flex direction={{ base: 'column-reverse', md: 'row' }} justify='space-between' align={{ md: 'center' }} gap={3}>
        <Button type='button' variant='outline' onClick={onBack} disabled={submitting}>
          {t('members.import.back', { defaultValue: 'Back' })}
        </Button>
        <Flex direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }} gap={3}>
          {issueRows.length > 0 && (
            <Text fontSize='sm' color='fg.muted'>
              {t('members.import.review.note', {
                defaultValue: 'Rows with problems are imported without the wrong value.',
              })}
            </Text>
          )}
          <Button type='submit' loading={submitting} disabled={!included.length}>
            {t('members.import.review.submit', {
              count: included.length,
              formattedCount: format(included.length),
              defaultValue_one: 'Import {{formattedCount}} member',
              defaultValue_other: 'Import {{formattedCount}} members',
            })}
          </Button>
        </Flex>
      </Flex>
    </Stack>
  )
}

type DuplicatesProps = {
  table: FileTable
  records: MemberRecord[]
  groups: DuplicateGroup[]
  decisions: Record<string, DuplicateDecision>
  onDecide: (group: DuplicateGroup, decision: DuplicateDecision) => void
}

const Duplicates = ({ table, records, groups, decisions, onDecide }: DuplicatesProps) => {
  const { t } = useTranslation()
  const fields = useMemberFields()
  const labelOf = (id: MemberFieldId) => fields.find((field) => field.id === id)?.label ?? id
  const keyLabels: Record<DuplicateKey, string> = {
    email: labelOf('email'),
    memberNumber: labelOf('memberNumber'),
    nationalId: labelOf('nationalId'),
  }
  const shownFields: MemberFieldId[] = ['email', 'phone', 'memberNumber', 'nationalId']

  return (
    <Stack gap={3} as='section' aria-labelledby='import-duplicates'>
      <Heading as='h2' id='import-duplicates' fontSize='md' fontWeight='bolder'>
        {t('members.import.review.duplicates_title', {
          count: groups.length,
          defaultValue_one: 'The same person twice?',
          defaultValue_other: 'The same person twice? ({{count}})',
        })}
      </Heading>
      {groups.map((group) => {
        const decision = decisions[group.id]
        const options: { value: DuplicateDecision; label: string }[] = [
          { value: 'first', label: t('members.import.review.keep_first', { defaultValue: 'Keep first' }) },
          { value: 'last', label: t('members.import.review.keep_last', { defaultValue: 'Keep last' }) },
          {
            value: 'both',
            label:
              group.rows.length > 2
                ? t('members.import.review.keep_all', { defaultValue: 'Keep all' })
                : t('members.import.review.keep_both', { defaultValue: 'Keep both' }),
          },
        ]
        return (
          <SectionCard key={group.id}>
            <Text fontSize='sm' mb={3}>
              {t('members.import.review.duplicate_same', {
                fields: group.keys.map((key) => keyLabels[key]).join(', '),
                defaultValue: 'Same {{fields}}',
              })}
            </Text>
            {/* ph-no-capture: both rows are the members' own data */}
            <Grid
              className='ph-no-capture'
              templateColumns={{ base: '1fr', md: `repeat(${Math.min(group.rows.length, 3)}, minmax(0, 1fr))` }}
              gap={3}
              mb={3}
            >
              {group.rows.map((row) => (
                <Box key={row} borderWidth='1px' borderColor='border' borderRadius='md' p={3} fontSize='sm' minW={0}>
                  <Text fontSize='sm' color='fg.muted' fontVariantNumeric='tabular-nums'>
                    {t('members.import.review.row_number', { row: table.rowNumbers[row], defaultValue: 'Row {{row}}' })}
                  </Text>
                  <Text fontSize='sm' fontWeight='bolder' truncate>
                    {displayName(records[row]) || '—'}
                  </Text>
                  {shownFields
                    .filter((field) => records[row][field])
                    .map((field) => (
                      <Text key={field} fontSize='sm' truncate>
                        <Text as='span' fontSize='sm' color='fg.muted'>
                          {labelOf(field)}:{' '}
                        </Text>
                        {records[row][field]}
                      </Text>
                    ))}
                </Box>
              ))}
            </Grid>
            <Flex
              gap={2}
              wrap='wrap'
              role='group'
              aria-label={t('members.import.review.keep_label', { defaultValue: 'Which to keep' })}
            >
              {options.map((option) => (
                <Button
                  type='button'
                  key={option.value}
                  size='xs'
                  variant={decision === option.value ? 'solid' : 'outline'}
                  aria-pressed={decision === option.value}
                  onClick={() => onDecide(group, option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </Flex>
          </SectionCard>
        )
      })}
    </Stack>
  )
}
