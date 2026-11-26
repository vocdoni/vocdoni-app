import { Button } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useVoterFlow } from '../flow-context'

/**
 * The way to the results on the receipt, already-voted and closed screens, the screen's one button (it goes in the
 * action bar's `primary`). A secret open vote shows it too: the results screen then says when they come (state
 * `hidden`).
 */
const ShowResultsButton = () => {
  const { t } = useTranslation()
  const { showResults } = useVoterFlow()
  return (
    <Button size='ballot' onClick={() => showResults(true)}>
      {t('voter.results.show')}
    </Button>
  )
}

/** The results button, or nothing when the creator hid the results from voters. */
export const useShowResultsAction = () => {
  const { facts } = useVoterFlow()
  return facts.resultsShown ? <ShowResultsButton /> : undefined
}
