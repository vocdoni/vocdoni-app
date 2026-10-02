import { Box, Flex, Heading, Icon, Link } from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuArrowLeft } from 'react-icons/lu'
import { generatePath, Link as RouterLink, useNavigate, useSearchParams } from 'react-router'
import { useAuth } from '~components/Auth/useAuth'
import type { Table } from '~components/Spreadsheet/readTable'
import { useToast } from '~components/Toast'
import { Routes } from '~routes'
import { useAddMembers } from '~src/queries/members'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import { type MemberFieldId, useMemberFields } from '../fields'
import { getStoredImportJobId, readAccountId, setStoredImportJobId } from '../importJobStorage'
import { autoMatch, type ColumnTarget } from './autoMatch'
import { detectIssues, type DuplicateGroup } from './detectIssues'
import { DoneStep, type NextAction } from './DoneStep'
import { MatchStep } from './MatchStep'
import { buildMembersPayload, type DuplicateDecision, includedRows, type RowEdits, toRecords } from './payload'
import { buildReceipt } from './receipt'
import { returnToKind, safeReturnTo } from './returnTo'
import { ReviewStep } from './ReviewStep'
import { type ImportStep, Stepper } from './Stepper'
import { LARGE_FILE_ROWS, UploadStep } from './UploadStep'

type Submitted = {
  jobId: string | null
  sent: number
  sourceRows: number[]
  europeanDates: number
}

/** Asks before leaving while there's a matched or reviewed file that hasn't been sent. */
const useLeaveGuard = (active: boolean) => {
  useEffect(() => {
    if (!active) return
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      // Older browsers show the prompt only when a value is set
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [active])
}

/**
 * The member import, a full page in four steps: upload a file, match its columns, review the rows'
 * problems, and a receipt of what happened.
 */
export const MembersImport = () => {
  const { t } = useTranslation()
  const toast = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { currentAddress } = useAuth()
  const fields = useMemberFields()
  const addMembers = useAddMembers(true)
  const returnTo = safeReturnTo(params.get('returnTo'))
  const membersPath = generatePath(Routes.dashboard.memberbase.members, { page: '1' })

  const [step, setStep] = useState<ImportStep>('upload')
  const [table, setTable] = useState<Table>()
  const [autoTargets, setAutoTargets] = useState<ColumnTarget[]>([])
  const [targets, setTargets] = useState<ColumnTarget[]>([])
  const [isTemplate, setIsTemplate] = useState(false)
  const [edits, setEdits] = useState<RowEdits>({})
  const [decisions, setDecisions] = useState<Record<string, DuplicateDecision>>({})
  const [submitted, setSubmitted] = useState<Submitted>()

  useLeaveGuard(step === 'match' || step === 'review')

  const labels = useMemo(
    () => Object.fromEntries(fields.map((field) => [field.id, field.label])) as Record<MemberFieldId, string>,
    [fields]
  )

  const records = useMemo(() => (table ? toRecords(table, targets, edits) : []), [table, targets, edits])
  const report = useMemo(() => detectIssues(records), [records])
  const included = useMemo(
    () => includedRows(records.length, report.duplicates, decisions),
    [records.length, report.duplicates, decisions]
  )

  const onTable = useCallback(
    (next: Table) => {
      const match = autoMatch(next.header, labels)
      setTable(next)
      setAutoTargets(match.targets)
      setTargets(match.targets)
      setIsTemplate(match.isTemplate)
      setEdits({})
      setDecisions({})
      // A big file stays on the upload step, where a call with our team is offered
      if (next.rows.length <= LARGE_FILE_ROWS) setStep('match')
    },
    [labels]
  )

  const leaveMatch = () => {
    if (!table) return
    const matched = autoTargets.filter((target) => target !== 'skip').length
    trackAnalyticsEvent({
      name: AnalyticsEvents.MembersImportMapped,
      props: {
        auto_pct: table.header.length ? Math.round((matched / table.header.length) * 100) : 0,
        is_template: isTemplate,
        extra_columns: targets.filter((target) => target === 'extra').length,
      },
    })
    setStep('review')
  }

  const submit = async () => {
    if (!table) return
    const payload = buildMembersPayload(table, targets, records, included)
    try {
      trackAnalyticsEvent({
        name: AnalyticsEvents.MembersImportStarted,
        props: { total_rows: payload.members.length, method: 'file' },
      })
      const response = await addMembers.mutateAsync(payload.members)
      const jobId = response?.jobId ?? null
      if (jobId) setStoredImportJobId(jobId, readAccountId(currentAddress))
      setSubmitted({
        jobId,
        sent: payload.members.length,
        sourceRows: payload.sourceRows,
        europeanDates: payload.europeanDates,
      })
      setStep('done')
    } catch (error) {
      console.error(error)
      toast({
        type: 'error',
        title: t('members.import.failed', { defaultValue: 'The import couldn’t start' }),
        description: error instanceof Error ? error.message : undefined,
      })
    }
  }

  // The receipt now tells how the job went, so the People tab needn't follow it too
  const onSettled = useCallback(() => {
    const account = readAccountId(currentAddress)
    if (submitted?.jobId && getStoredImportJobId(account) === submitted.jobId) setStoredImportJobId(null, account)
  }, [currentAddress, submitted?.jobId])

  const onNext = (next: NextAction) => {
    trackAnalyticsEvent({ name: AnalyticsEvents.MembersImportNextClicked, props: { next } })
    if (next === 'create_vote') navigate(generatePath(Routes.processes.create))
    else if (next === 'return' && returnTo) navigate(returnTo)
    else navigate(membersPath)
  }

  const receipt = useMemo(() => {
    if (!table || !submitted) return []
    const fixes = [...table.fixes]
    if (submitted.europeanDates) fixes.push({ kind: 'european_dates', count: submitted.europeanDates })
    return buildReceipt({
      header: table.header,
      autoTargets,
      targets,
      fixes,
      duplicatesLeftOut: records.length - included.length,
    })
  }, [table, submitted, autoTargets, targets, records.length, included.length])

  const decide = (group: DuplicateGroup, decision: DuplicateDecision) =>
    setDecisions((previous) => ({ ...previous, [group.id]: decision }))
  const edit = (row: number, field: MemberFieldId, value: string) =>
    setEdits((previous) => ({ ...previous, [row]: { ...previous[row], [field]: value } }))

  return (
    // data-step: the e2e suite's copy-free way to know which step is showing
    <Box maxW='72rem' w='full' mx='auto' data-step={step}>
      <Link asChild fontSize='sm' color='fg.muted' mb={3}>
        <RouterLink to={membersPath}>
          <Icon as={LuArrowLeft} />
          {t('memberbase.title', { defaultValue: 'Members' })}
        </RouterLink>
      </Link>
      <Flex
        direction={{ base: 'column', md: 'row' }}
        align={{ base: 'flex-start', md: 'center' }}
        justify='space-between'
        gap={4}
        mb={6}
      >
        <Heading as='h1' size='2xl' fontWeight='bold'>
          {t('members.import.title', { defaultValue: 'Import members' })}
        </Heading>
        <Stepper current={step} onBack={step === 'done' ? undefined : setStep} />
      </Flex>

      {step === 'upload' && <UploadStep table={table} onTable={onTable} onContinue={() => setStep('match')} />}
      {step === 'match' && table && (
        <MatchStep
          table={table}
          targets={targets}
          autoMatched={autoTargets.filter((target) => target !== 'skip').length}
          onChange={setTargets}
          onBack={() => setStep('upload')}
          onContinue={leaveMatch}
        />
      )}
      {step === 'review' && table && (
        <ReviewStep
          table={table}
          records={records}
          report={report}
          included={included}
          decisions={decisions}
          onDecide={decide}
          onEdit={edit}
          onBack={() => setStep('match')}
          onSubmit={submit}
          submitting={addMembers.isPending}
        />
      )}
      {step === 'done' && table && submitted && (
        <DoneStep
          jobId={submitted.jobId}
          table={table}
          records={records}
          sent={submitted.sent}
          sourceRows={submitted.sourceRows}
          receipt={receipt}
          returnTo={returnTo ? returnToKind(returnTo) : null}
          onNext={onNext}
          onSettled={onSettled}
        />
      )}
    </Box>
  )
}
