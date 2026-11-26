import { Box, Button } from '@chakra-ui/react'
import { resolveEndDate } from '@vocdoni/api-client'
import { useTranslation } from 'react-i18next'
import { useVoterFlow } from '../flow-context'
import { formatVoteDay, formatVoteTime } from '../format'
import { LocalText, ScreenHint } from './ScreenParts'

/**
 * Where the results are, on the receipt and already-voted screens: when they will be published if they are secret
 * until the end, else a way to them.
 */
export const ResultsLine = () => {
  const { t, i18n } = useTranslation()
  const { election, facts, showResults } = useVoterFlow()
  if (facts.secretUntilTheEnd && facts.status !== 'ENDED' && facts.status !== 'RESULTS' && !facts.endedBySchedule) {
    const end = resolveEndDate(election)
    if (!end) return null
    return (
      <ScreenHint>
        <LocalText>
          {t('voter.receipt.results_later', {
            date: formatVoteDay(end, i18n.language),
            time: formatVoteTime(end, i18n.language),
          })}
        </LocalText>
      </ScreenHint>
    )
  }
  return (
    <Box mt='6'>
      <Button variant='outline' size='ballot' onClick={() => showResults(true)}>
        {t('voter.results.show')}
      </Button>
    </Box>
  )
}
