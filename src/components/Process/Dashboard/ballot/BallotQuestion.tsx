import { Box, Card, chakra, Tag, useSlotRecipe } from '@chakra-ui/react'
import type { VotingProcessQuestion } from '@vocdoni/api-types'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useVoteText } from '~i18n/use-vote-text'
import { questionRule } from './question-rule'

type BallotQuestionProps = {
  question: VotingProcessQuestion
  index: number
  /** Title and options alone, no mark, note or tag: the fallback when the rule cannot be drawn. */
  plain?: boolean
}

/**
 * One question as voters will read it: number, title, how it is answered (a sentence and a tag) and each option
 * with the empty mark the voter will fill.
 */
export const BallotQuestion = ({ question, index, plain = false }: BallotQuestionProps) => {
  const { t } = useTranslation()
  const { text } = useVoteText()
  const rule = useMemo(() => (plain ? null : questionRule(t, question)), [plain, t, question])
  const styles = useSlotRecipe({ key: 'ballotPaper' })({ kind: rule?.mark })
  const number = index + 1

  return (
    <Card.Root as='li' variant='frame' overflow='hidden'>
      <Box css={styles.head}>
        <chakra.span css={styles.number}>{number}</chakra.span>
        <chakra.h3 css={styles.title}>{text(question.title)}</chakra.h3>
        {rule && <chakra.p css={styles.note}>{rule.note}</chakra.p>}
        {rule && (
          <Tag.Root variant='kind' size='md' css={styles.tag}>
            <Tag.Label>{rule.tag}</Tag.Label>
          </Tag.Root>
        )}
      </Box>
      <chakra.ul
        aria-label={t('votes.ballot.options_label', { defaultValue: 'Options of question {{number}}', number })}
      >
        {question.choices.map((choice, position) => (
          <chakra.li key={`${choice.value}-${position}`} css={styles.option}>
            {rule && (
              <chakra.span aria-hidden css={styles.mark}>
                {rule.mark === 'points' ? 0 : null}
              </chakra.span>
            )}
            <span>{text(choice.title)}</span>
          </chakra.li>
        ))}
      </chakra.ul>
    </Card.Root>
  )
}
