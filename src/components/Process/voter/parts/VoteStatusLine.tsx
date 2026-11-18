import { Status } from '@chakra-ui/react'
import { resolveEndDate } from '@vocdoni/api-client'
import { useTranslation } from 'react-i18next'
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
  // In the strip and rail the paused state shows in the notice and the note: the head keeps the open-until line.
  if (facts.status === 'PAUSED' && context === 'screen') {
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
