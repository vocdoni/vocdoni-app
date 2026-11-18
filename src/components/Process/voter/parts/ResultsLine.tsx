import { Box, Button } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useVoterFlow } from '../flow-context'

/**
 * A way to the results, on the receipt and already-voted screens. A secret open vote shows it too: the results screen
 * then says when they come (state `hidden`).
 */
export const ResultsLine = () => {
  const { t } = useTranslation()
  const { showResults } = useVoterFlow()
  return (
    <Box mt='6'>
      <Button variant='outline' size='ballot' onClick={() => showResults(true)}>
        {t('voter.results.show')}
      </Button>
    </Box>
  )
}
