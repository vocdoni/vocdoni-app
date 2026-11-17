import { Span } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useVoteText } from '~i18n/use-vote-text'
import { quantity } from '~utils/numbers'
import type { QuestionOutcome } from '~utils/vote-outcome'

/**
 * A question's result for a row: the winning choice and its "198 to 7" in figures on a two-choice question, else the
 * outcome sentence ("Tie", "Most voted: X"). There is no approval semantic, so no "Approved".
 */
export const QuestionVerdict = ({ outcome }: { outcome: QuestionOutcome }) => {
  const { t } = useTranslation()
  const { text, outcome: describe } = useVoteText()
  if (outcome.kind !== 'pair') return <>{describe(outcome)}</>
  return (
    <>
      {text(outcome.winner.title)}{' '}
      <Span fontFamily='figure' letterSpacing='none'>
        {t('votes.summary.verdict_figures', {
          defaultValue: '{{winnerVotes}} to {{otherVotes}}',
          winnerVotes: quantity(outcome.winnerVotes),
          otherVotes: quantity(outcome.otherVotes),
        })}
      </Span>
    </>
  )
}
