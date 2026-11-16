import { Flex, Progress, Stack, Text } from '@chakra-ui/react'
import type { QuestionResults, VotingProcessQuestion } from '@vocdoni/api-types'
import { decodeQuestionResults, tryInferQuestionBallotType, type DecodedChoiceResult } from '@vocdoni/ballot'
import { useTranslation } from 'react-i18next'
import { useVoteText } from '~i18n/use-vote-text'
import { quantity } from '~utils/numbers'

export type QuestionResultBarsProps = {
  question: VotingProcessQuestion
  results?: QuestionResults
}

/** One bar per choice of a question, with its votes and share. No winner highlight: there is no approval semantic. */
export const QuestionResultBars = ({ question, results }: QuestionResultBarsProps) => {
  const { t } = useTranslation()
  const { text } = useVoteText()
  if (!results?.results?.length || !tryInferQuestionBallotType(question)) return null

  let tallies: DecodedChoiceResult[]
  try {
    tallies = decodeQuestionResults(question, results.results).filter(
      (entry): entry is DecodedChoiceResult => entry.choice !== 'abstain'
    )
  } catch {
    return null
  }
  const total = tallies.reduce((sum, entry) => sum + entry.votes, 0)

  return (
    <Stack gap='3'>
      {question.choices.map((choice) => {
        const votes = tallies.find((entry) => entry.choice === choice.value)?.votes ?? 0
        const percent = total > 0 ? Math.round((votes / total) * 100) : 0
        const title = text(choice.title)
        const figure = t('votes.manage.result_figure', {
          defaultValue: '{{votes}} · {{percent}}%',
          votes: quantity(votes),
          percent,
        })
        return (
          <Stack key={String(choice.value)} gap='1'>
            <Flex justify='space-between' gap='3'>
              <Text textStyle='body-sm'>{title}</Text>
              <Text textStyle='figure'>{figure}</Text>
            </Flex>
            <Progress.Root variant='results' value={percent} translations={{ value: () => `${title}, ${figure}` }}>
              <Progress.Track>
                <Progress.Range />
              </Progress.Track>
            </Progress.Root>
          </Stack>
        )
      })}
    </Stack>
  )
}
