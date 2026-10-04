import { Stack, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '~components/Toast'
import { Banner } from '~components/ui/Banner'
import { ConfirmDialog } from '~components/ui/ConfirmDialog'
import { usePublicLanguage } from '~i18n/usePublicLanguage'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import { memberDisplayName } from '../People/display'
import type { SelectedMember } from '../People/useSelection'
import { PartialRemovalError, questionsEmptiedBy } from './censusEdits'
import { UsedByWarning } from './UsedBy'
import type { useCensusEditor } from './useCensusEditor'
import type { ResolvedCensusState } from './useResolvedCensus'

/** How long "Add them back" stays on offer. */
const UNDO_DURATION = 8000

type Step =
  | { name: 'confirm' }
  /** The API refused a batch: someone in it has already started voting */
  | { name: 'signed'; signed: string[]; remaining: string[] }

type RemovePeopleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  people: SelectedMember[]
  census: ResolvedCensusState
  editor: ReturnType<typeof useCensusEditor>
  name: string
  /** After people were removed (some or all) */
  onRemoved?: () => void
}

/**
 * Confirms taking people out of a census. They stay in the members. Refuses a removal that would leave
 * a question with nobody allowed to answer it. When someone has already started voting, the API removes
 * nobody: this says who, and offers to remove the others.
 */
export const RemovePeopleDialog = ({
  open,
  onOpenChange,
  people,
  census,
  editor,
  name,
  onRemoved,
}: RemovePeopleDialogProps) => {
  const { t, i18n } = useTranslation()
  const language = usePublicLanguage()
  const toast = useToast()
  const format = (value: number) => value.toLocaleString(i18n.resolvedLanguage)
  const [step, setStep] = useState<Step>({ name: 'confirm' })
  const [removed, setRemoved] = useState(0)
  const [blocked, setBlocked] = useState<string[]>([])
  // Exactly who went so far, for "Add them back"; null once that can't be told
  const [removedIds, setRemovedIds] = useState<string[] | null>([])
  const vote = census.kind === 'vote'
  const running = census.state === 'live' || census.state === 'paused' || census.state === 'scheduled'
  const ids = people.map((person) => person.id)
  const emptied = vote ? questionsEmptiedBy(census.process?.questions, ids, language) : []
  // The API also takes removed people off each question's list of who may answer it, and adding
  // them back doesn't put them there again: no "Add them back" then, as it would only half undo it
  const canUndo = !census.process?.questions?.some((question) => question.eligibleMemberIds?.length)

  useEffect(() => {
    if (!open) return
    setStep({ name: 'confirm' })
    setRemoved(0)
    setBlocked([])
    setRemovedIds([])
  }, [open])

  /** "Add them back": the people just removed go back in, the same way they went out. */
  const addBack = async (back: string[], countBefore: number) => {
    try {
      const { added } = await editor.add(back)
      if (vote)
        trackAnalyticsEvent({ name: AnalyticsEvents.VotersAdded, props: { count: added, surface: 'undo_remove' } })
      toast({
        title: vote
          ? t('census_detail.remove.undone_vote', {
              defaultValue: '{{before}} → {{after}} voters',
              before: format(countBefore),
              after: format(countBefore + added),
            })
          : t('census_detail.remove.undone', {
              defaultValue: '{{before}} → {{after}} people',
              before: format(countBefore),
              after: format(countBefore + added),
            }),
        description: t('census_detail.remove.undone_detail', { defaultValue: 'They were added back.' }),
        type: 'success',
        duration: 4000,
        isClosable: true,
      })
    } catch (error) {
      // The server's own words can name ids and addresses: the console keeps them, the toast says what to do
      console.error('Could not add them back', error)
      toast({
        title: t('census_detail.remove.undo_error', { defaultValue: "They couldn't be added back" }),
        description: vote
          ? t('census_detail.remove.undo_error_vote', {
              defaultValue: "They're still in your members. Select them in People and choose 'Add to a vote'.",
            })
          : t('census_detail.remove.undo_error_saved', {
              defaultValue: "They're still in your members. Select them in People and choose 'Add to a saved census'.",
            }),
        type: 'error',
        duration: 6000,
        isClosable: true,
      })
    }
  }

  const finish = (removedTotal: number, blockedIds: string[], gone: string[] | null) => {
    trackAnalyticsEvent({
      name: AnalyticsEvents.VotersRemoved,
      props: { requested: ids.length, removed: removedTotal, blocked: blockedIds.length },
    })
    if (removedTotal > 0) {
      const after = Math.max(census.count - removedTotal, 0)
      toast({
        title: vote
          ? t('census_detail.remove.done_vote', {
              defaultValue: '{{before}} → {{after}} voters',
              before: format(census.count),
              after: format(after),
            })
          : t('census_detail.remove.done', {
              defaultValue: '{{before}} → {{after}} people',
              before: format(census.count),
              after: format(after),
            }),
        description: t('census_detail.remove.done_detail', { defaultValue: 'They stay in your members.' }),
        type: 'success',
        duration: UNDO_DURATION,
        isClosable: true,
        action:
          canUndo && gone?.length
            ? {
                label: t('census_detail.remove.undo', { defaultValue: 'Add them back' }),
                onClick: () => void addBack(gone, after),
              }
            : undefined,
      })
      onRemoved?.()
    }
    onOpenChange(false)
  }

  const run = async (targets: string[]) => {
    try {
      const outcome = await editor.remove(targets)
      const removedTotal = removed + outcome.removed
      const gone = removedIds && outcome.removedIds ? [...removedIds, ...outcome.removedIds] : null
      setRemoved(removedTotal)
      setRemovedIds(gone)
      if (outcome.status === 'done') return finish(removedTotal, blocked, gone)
      const blockedIds = [...blocked, ...outcome.signed]
      setBlocked(blockedIds)
      if (!outcome.remaining.length) {
        toast({
          title: t('census_detail.remove.all_signed', {
            defaultValue: "Nobody else can be removed: they've all started voting.",
          }),
          type: 'warning',
          duration: 6000,
          isClosable: true,
        })
        return finish(removedTotal, blockedIds, gone)
      }
      setStep({ name: 'signed', signed: outcome.signed, remaining: outcome.remaining })
    } catch (error) {
      const removedTotal = removed + (error instanceof PartialRemovalError ? error.removed : 0)
      toast({
        title: removedTotal
          ? t('census_detail.remove.partial', {
              defaultValue: 'Stopped after removing {{removed}}',
              removed: format(removedTotal),
            })
          : t('census_detail.remove.error', { defaultValue: 'Nobody was removed' }),
        description: error instanceof Error ? error.message : undefined,
        type: 'error',
        duration: 6000,
        isClosable: true,
      })
      if (removedTotal) finish(removedTotal, blocked, null)
    }
  }

  if (step.name === 'signed') {
    const byId = new Map(people.map((person) => [person.id, person]))
    const first = byId.get(step.signed[0])
    const signedName =
      (first && memberDisplayName(first)) || t('census_detail.remove.someone', { defaultValue: 'Someone' })
    return (
      <ConfirmDialog
        open={open}
        onOpenChange={({ open: next }) => (next || !editor.busy ? onOpenChange(next) : undefined)}
        title={
          removed
            ? t('census_detail.remove.signed_title_partial', {
                defaultValue: '{{removed}} removed, the rest not yet',
                removed: format(removed),
              })
            : t('census_detail.remove.signed_title', { defaultValue: 'Nobody was removed' })
        }
        confirmText={t('census_detail.remove.retry', {
          count: step.remaining.length,
          formattedCount: format(step.remaining.length),
          defaultValue_one: 'Remove the other one',
          defaultValue_other: 'Remove the other {{formattedCount}}',
        })}
        loading={editor.busy}
        onConfirm={() => run(step.remaining)}
      >
        {/* ph-no-capture: a member's name */}
        <Text fontSize='sm' className='ph-no-capture'>
          {t('census_detail.remove.signed', {
            count: step.signed.length,
            name: signedName,
            others: step.signed.length - 1,
            defaultValue_one: '{{name}} has already started voting.',
            defaultValue_other: '{{name}} and {{others}} more have already started voting.',
          })}{' '}
          {t('census_detail.remove.retry_question', {
            count: step.remaining.length,
            formattedCount: format(step.remaining.length),
            defaultValue_one: 'Remove the other one?',
            defaultValue_other: 'Remove the other {{formattedCount}}?',
          })}
        </Text>
      </ConfirmDialog>
    )
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={({ open: next }) => (next || !editor.busy ? onOpenChange(next) : undefined)}
      title={
        vote
          ? t('census_detail.remove.title_vote', {
              count: ids.length,
              formattedCount: format(ids.length),
              vote: name,
              defaultValue_one: "Remove 1 voter from '{{vote}}'?",
              defaultValue_other: "Remove {{formattedCount}} voters from '{{vote}}'?",
            })
          : t('census_detail.remove.title', {
              count: ids.length,
              formattedCount: format(ids.length),
              census: name,
              defaultValue_one: "Remove 1 person from '{{census}}'?",
              defaultValue_other: "Remove {{formattedCount}} people from '{{census}}'?",
            })
      }
      confirmText={
        vote
          ? t('census_detail.remove.confirm_vote', {
              count: ids.length,
              formattedCount: format(ids.length),
              defaultValue_one: 'Remove 1 voter',
              defaultValue_other: 'Remove {{formattedCount}} voters',
            })
          : t('census_detail.remove.confirm', {
              count: ids.length,
              formattedCount: format(ids.length),
              defaultValue_one: 'Remove 1 person',
              defaultValue_other: 'Remove {{formattedCount}} people',
            })
      }
      loading={editor.busy}
      confirmDisabled={emptied.length > 0 || !ids.length}
      onConfirm={() => run(ids)}
    >
      <Stack gap={3}>
        <Text fontSize='sm'>
          {vote && running && (
            <>{t('census_detail.remove.no_vote', { defaultValue: "They can't vote in this vote anymore." })} </>
          )}
          {t('census_detail.remove.stay', { defaultValue: 'They stay in your members.' })}
        </Text>
        {emptied.length > 0 && (
          <Banner status='error'>
            {t('census_detail.remove.emptied', {
              count: emptied.length,
              questions: emptied.map((question) => `'${question}'`).join(', '),
              defaultValue_one:
                'This would leave nobody allowed to answer {{questions}}. Keep at least one of the people who can.',
              defaultValue_other:
                'This would leave nobody allowed to answer {{questions}}. Keep at least one of the people who can answer each.',
            })}
          </Banner>
        )}
        <UsedByWarning votes={census.sharedWith} />
      </Stack>
    </ConfirmDialog>
  )
}
