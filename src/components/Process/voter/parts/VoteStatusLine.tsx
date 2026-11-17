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
export const VoteStatusLine = () => {
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
  if (facts.status === 'PAUSED') {
    return (
      <Status.Root size='ballot' tone='warning'>
        <Status.Indicator />
        {t('voter.status.paused')}
      </Status.Root>
    )
  }
  const end = resolveEndDate(election)
  if (!end) return null
  return (
    <Status.Root size='ballot' tone='success'>
      <Status.Indicator />
      <LocalText>
        {t('voter.status.open_until', {
          date: formatVoteDay(end, i18n.language, { month: false }),
          time: formatVoteTime(end, i18n.language),
        })}
      </LocalText>
    </Status.Root>
  )
}
