import { Box, Button, Card, Text } from '@chakra-ui/react'
import { ElectionResults } from '@vocdoni/react-components'
import { useTranslation } from 'react-i18next'
import { useAppEnv } from '~src/app-env'
import { useVoterFlow } from '../flow-context'
import { textOf, voterTurnout } from '../format'
import { InlineAction, ScreenHeading, ScreenKicker, VoterScreenFrame } from '../parts/ScreenParts'
import { VoterActionBar } from '../parts/VoterActionBar'
import type { ResultsState } from '../voter-flow'
import { TurnoutLine } from './StateScreens'

/**
 * The interim results view (until SP5 draws its own): today's `ElectionResults` content inside the voter shell,
 * reached from "Mostra els resultats" on identify, closed, the receipt and already-voted.
 */
export const ResultsScreen = ({ state }: { state: ResultsState }) => {
  const { t } = useTranslation()
  const env = useAppEnv()
  const { election, facts, moved, showResults, checkReceipt } = useVoterFlow()
  const turnout = voterTurnout(election, env)
  return (
    <VoterScreenFrame kind='results'>
      <ScreenKicker>{t('voter.results.kicker')}</ScreenKicker>
      <ScreenHeading focus={moved}>{textOf(election.title as Parameters<typeof textOf>[0])}</ScreenHeading>
      {turnout ? (
        <Text as='p' textStyle='ballot-body' color='fg.muted' mt='2.5'>
          <TurnoutLine turnout={turnout} />
        </Text>
      ) : null}
      <Card.Root variant='ballot' mt='6'>
        <Box px='4.5' py='3.5'>
          <ElectionResults />
        </Box>
      </Card.Root>
      <VoterActionBar
        secondary={
          <Button variant='outline' size='ballot' onClick={() => showResults(false)}>
            {t('voter.back')}
          </Button>
        }
        note={
          state === 'final' && !facts.connected ? (
            <InlineAction onClick={checkReceipt}>{t('voter.results.check_vote')}</InlineAction>
          ) : undefined
        }
      />
    </VoterScreenFrame>
  )
}
