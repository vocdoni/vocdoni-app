import { Box, Flex, Grid, HStack, Icon, Stack, Text } from '@chakra-ui/react'
import type { VotingProcessQuestion } from '@vocdoni/api-types'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { TurnoutBar } from '~components/ui/TurnoutBar'
import { useVoteText } from '~i18n/use-vote-text'
import { LockIcon } from '~theme/icons'
import { quantity } from '~utils/numbers'
import { percentOf } from '~utils/vote-state'
import { QuestionResultBars } from '../QuestionResultBars'
import { QuestionRowFrame } from './QuestionRow'
import { ProcessStatus } from '~components/ui/ProcessStatus'

export type ActiveQuestionRowProps = {
  question: VotingProcessQuestion
  number: number
  state: 'open' | 'paused' | 'held'
  electorate?: number
  weighted: boolean
  /** Pause and Close, or Resume and Close; none while the vote is paused as a whole. */
  buttons?: ReactNode
}

/**
 * An open, paused or held question: title and state, the question, "172 of 312 voted" over the bar, the provisional
 * bars when results are live, the note and the buttons. Desktop puts the buttons under the bar next to the note, the
 * tablet at the end of the row, the phone across the row in equal parts.
 */
export const ActiveQuestionRow = ({
  question,
  number,
  state,
  electorate,
  weighted,
  buttons,
}: ActiveQuestionRowProps) => {
  const { t } = useTranslation()
  const { text } = useVoteText()
  const count = question.results?.voteCount ?? 0
  const share = percentOf(count, electorate)
  const values = { voted: quantity(count), total: electorate ? quantity(electorate) : '' }
  // Without a known electorate the sentences leave the total out instead of printing a placeholder.
  const voted = electorate
    ? t('votes.manage.question_voted', { defaultValue: '{{voted}} of {{total}} voted', ...values })
    : t('votes.manage.question_voted_count', { defaultValue: '{{voted}} voted', ...values })
  const live = !question.secretUntilTheEnd
  const hasBars = live && !!question.results?.results?.length
  // What the board says under the bar, after a lock while results are secret (not on a held question). The board's
  // opening and pause times are not recorded by the API. The phone and tablet boards leave out the open question's.
  const note = {
    held: t('votes.manage.held_note', { defaultValue: 'Held by the pause of the vote.' }),
    paused: t('votes.manage.paused_note', { defaultValue: 'No one can vote on it.' }),
    open: live
      ? t('votes.manage.provisional', { defaultValue: 'Provisional result.' })
      : t('votes.manage.locked', { defaultValue: 'Results will show when the question closes.' }),
  }[state]
  const locked = !live && state !== 'held'
  const noteOnDesktopOnly = state === 'open'
  // The column under the title: head, bar, bars and, when shown there, the note. The tablet's buttons span it.
  const tabletRows = 2 + (hasBars ? 1 : 0) + (noteOnDesktopOnly ? 0 : 1)
  const wide = { base: '1', lg: '1 / -1' } as const

  return (
    <QuestionRowFrame number={number} active>
      <Grid
        templateColumns={{ base: '[minmax(0, 1fr)]', md: '[minmax(0, 1fr) auto]' }}
        columnGap={{ md: '2', lg: '3' }}
        rowGap='3'
        alignItems='center'
        minW='0'
      >
        <Stack gap={{ base: '0.5', lg: 'note' }} gridColumn={wide} minW='0'>
          <Flex
            direction={{ base: 'column', lg: 'row' }}
            align={{ base: 'flex-start', lg: 'baseline' }}
            justify='space-between'
            gap={{ base: '0.5', lg: '3' }}
          >
            <Text as='h3' textStyle='question-title'>
              {text(question.title)}
            </Text>
            <ProcessStatus kind='question' state={state === 'held' ? 'paused' : state} />
          </Flex>
          {question.description && (
            <Text textStyle='note' color='fg.subtle' display={{ base: 'none', lg: 'block' }}>
              {text(question.description)}
            </Text>
          )}
        </Stack>
        <TurnoutBar
          gridColumn={wide}
          maxW={{ md: 'turnout.max', lg: 'full' }}
          caption={voted}
          share={
            share !== undefined
              ? t('votes.manage.percent', { defaultValue: '{{percent}}%', percent: share })
              : undefined
          }
          value={count}
          max={electorate}
          label={
            electorate
              ? t('votes.manage.question_ruler', {
                  defaultValue: '{{voted}} of {{total}} people voted, {{percent}}%.',
                  ...values,
                  percent: share ?? 0,
                })
              : t('votes.manage.question_ruler_count', { defaultValue: '{{voted}} people voted.', ...values })
          }
          layout={{ base: 'scale', lg: 'compact' }}
        />
        {hasBars && (
          <Box gridColumn={wide}>
            <QuestionResultBars question={question} results={question.results} weighted={weighted} />
          </Box>
        )}
        {/* The board's footer line is a button's height from `lg`, buttons or not. */}
        <HStack
          gridColumn='1'
          gap='2'
          minH={{ lg: 'control.md' }}
          textStyle='note'
          color='fg.subtle'
          minW='0'
          display={noteOnDesktopOnly ? { base: 'none', lg: 'flex' } : 'flex'}
        >
          {locked && <Icon as={LockIcon} boxSize='3.5' flexShrink={0} />}
          <Text>{note}</Text>
        </HStack>
        {buttons && (
          <HStack
            gap='2'
            justify='flex-end'
            gridColumn={{ base: '1', md: '2' }}
            gridRow={{ base: 'auto', md: `1 / span ${tabletRows}`, lg: 'auto' }}
            mt={{ base: '1', md: '0' }}
          >
            {buttons}
          </HStack>
        )}
      </Grid>
    </QuestionRowFrame>
  )
}
