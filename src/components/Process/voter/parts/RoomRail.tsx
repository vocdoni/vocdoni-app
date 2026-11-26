import { Button } from '@chakra-ui/react'
import type { TFunction } from 'i18next'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StepProgress } from '~components/ui/StepProgress'
import { StepRail, type StepRailItem } from '~components/ui/StepRail'
import { useVoterFlow } from '../flow-context'
import { textOf } from '../format'
import { roomProgress, roomRail, type RoomNote, type RoomProgress, type RoomRailExpanded } from '../room'

// Literal keys, so the extractor sees every one.
const noteText = (t: TFunction, note: RoomNote): string => {
  switch (note) {
    case 'waiting':
      return t('voter.room.state.waiting')
    case 'open':
      return t('voter.room.state.open')
    case 'openVoted':
      return t('voter.room.state.open_voted')
    case 'openSkipped':
      return t('voter.room.state.open_skipped')
    case 'openLost':
      return t('voter.room.state.open_lost')
    case 'notEligible':
      return t('voter.room.state.not_eligible')
    case 'paused':
      return t('voter.room.state.paused')
    case 'closed':
      return t('voter.room.state.closed')
    case 'closedVoted':
      return t('voter.room.state.closed_voted')
    case 'closedMissed':
      return t('voter.room.state.closed_missed')
    case 'closedLost':
      return t('voter.room.state.closed_lost')
    case 'closedUnknown':
      return t('voter.room.state.closed_unknown')
    case 'closedLate':
      return t('voter.room.state.closed_late')
    case 'canceled':
      return t('voter.room.state.canceled')
  }
}

/**
 * A question-by-question vote's agenda from `lg` (board V4VoterWideLive): each question's state for this voter, the
 * long agenda folded (1b). Not a navigation: the open question's ballot comes by itself.
 */
export const RoomRail = () => {
  const { t } = useTranslation()
  const { election, facts, state } = useVoterFlow()
  const [expanded, setExpanded] = useState<RoomRailExpanded>({ closed: false, more: false })
  if (!facts.room) return null
  const items: StepRailItem[] = roomRail(facts.room, state.skipped, expanded).map((entry) => {
    if (entry.kind === 'closed') {
      return {
        id: 'fold-closed',
        number: '',
        title: t('voter.room.fold_closed', { from: entry.from, to: entry.to }),
        state: 'done',
        detail: (
          <>
            {t('voter.room.fold_closed_note')}{' '}
            <Button variant='text-action' onClick={() => setExpanded((open) => ({ ...open, closed: true }))}>
              {t('voter.room.show_them')}
            </Button>
          </>
        ),
      }
    }
    if (entry.kind === 'more') {
      return {
        id: 'fold-more',
        number: `+${entry.count}`,
        title: t('voter.room.fold_more', { count: entry.count }),
        state: 'more',
        detail: (
          <>
            {t('voter.room.fold_more_note', { from: entry.from, to: entry.to })}{' '}
            <Button variant='text-action' onClick={() => setExpanded((open) => ({ ...open, more: true }))}>
              {t('voter.room.show_them')}
            </Button>
          </>
        ),
      }
    }
    const question = election.questions[entry.index]
    return {
      id: question.id,
      number: String(entry.index + 1),
      title: textOf(question.title as Parameters<typeof textOf>[0]),
      state: entry.state,
      detail: noteText(t, entry.note),
    }
  })
  return <StepRail items={items} />
}

const progressLabel = (t: TFunction, progress: RoomProgress): string => {
  const { current, total, closed } = progress
  switch (progress.kind) {
    case 'notStarted':
      return t('voter.progress.room_not_started')
    case 'open':
      return t('voter.progress.room_open', { current, total })
    case 'paused':
      return t('voter.progress.question', { current, total })
    case 'voted':
      return t('voter.progress.room_voted', { current, total })
    case 'lost':
      return t('voter.progress.room_lost', { current, total })
    case 'notEligible':
      return t('voter.progress.room_not_eligible', { current, total })
    case 'skipped':
      return t('voter.progress.room_skipped', { current, total })
    case 'none':
      return t('voter.progress.room_none', { count: closed, total })
  }
}

/** The strip's label and line below `lg` on a question-by-question vote (R6, R7). */
export const RoomStepProgress = () => {
  const { t } = useTranslation()
  const { facts, screen } = useVoterFlow()
  const progress = facts.room ? roomProgress(facts.room, screen) : null
  if (!progress) return null
  return <StepProgress label={progressLabel(t, progress)} value={progress.value} total={progress.total} />
}
