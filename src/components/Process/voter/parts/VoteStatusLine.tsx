import { Status } from '@chakra-ui/react'
import { resolveEndDate } from '@vocdoni/api-client'
import { useTranslation } from 'react-i18next'
import { closedAt, type VoteState } from '~utils/vote-state'
import { useVoterFlow } from '../flow-context'
import { formatVoteDay, formatVoteTime } from '../format'
import { LocalText } from './ScreenParts'

/**
 * The vote's status line (conformance LV / ST): "Oberta fins dijous 12 a les 20:00" while open, "En pausa" or
 * "Cancel·lada". The date is in the visitor's zone, so `LocalText` swaps the server's text after hydration.
 */
export const VoteStatusLine = ({ context = 'screen' }: { context?: 'head' | 'screen' }) => {
  const { t, i18n } = useTranslation()
  const { election, facts } = useVoterFlow()
  if (facts.status === 'CANCELED') {
    return (
      <Status.Root size='ballot' tone='danger'>
        <Status.Indicator />
        {t('voter.status.canceled')}
      </Status.Root>
    )
  }
  // The paused state shows in both the head and the screen: the open-until line gives way to the paused indicator.
  if (facts.status === 'PAUSED') {
    return (
      <Status.Root size='ballot' tone='warning'>
        <Status.Indicator />
        {t('voter.status.paused')}
      </Status.Root>
    )
  }
  // An ended vote (reached by "Comprova el teu vot") is not "open until" anything (gate F7).
  if (facts.endedBySchedule || facts.status === 'ENDED' || facts.status === 'RESULTS') return null
  const end = resolveEndDate(election)
  if (!end) return null
  return (
    <Status.Root size='ballot' tone='success'>
      <Status.Indicator />
      <LocalText>
        {t('voter.status.open_until', {
          date: formatVoteDay(end, i18n.language),
          time: formatVoteTime(end, i18n.language),
        })}
      </LocalText>
    </Status.Root>
  )
}

/** "Tancada dijous 12 de març a les 20:00": an ended vote's status line on its results (board M11). */
export const VoteClosedLine = () => {
  const { t, i18n } = useTranslation()
  const { election } = useVoterFlow()
  // When it closed, not its schedule: a question-by-question vote ended early shows the early close.
  const end = closedAt(election)
  return (
    <Status.Root size='ballot' tone='closed'>
      <Status.Indicator />
      {end ? (
        <LocalText>
          {t('voter.results.closed_on', {
            date: formatVoteDay(end, i18n.language),
            time: formatVoteTime(end, i18n.language),
          })}
        </LocalText>
      ) : (
        t('voter.results.closed')
      )}
    </Status.Root>
  )
}

/**
 * The room's line (board V4VoterWideLive 4) from the vote's derived state, the organiser's rule: "En directe.
 * S'actualitza sola." once a question has opened, "Encara no ha començat" while none has (the backend reports every
 * unopened question as paused), and the paused line only when a question that was open is held.
 */
export const VoteLiveLine = ({ state }: { state: VoteState }) => {
  const { t } = useTranslation()
  if (state === 'paused') return <VoteStatusLine />
  if (state === 'ready') {
    return (
      <Status.Root size='ballot' tone='gray'>
        <Status.Indicator />
        {t('voter.room.not_started_line')}
      </Status.Root>
    )
  }
  return (
    <Status.Root size='ballot' tone='success'>
      <Status.Indicator />
      {t('voter.room.live')}
    </Status.Root>
  )
}
