import { Box, Flex, Grid, HStack, Icon, Stack, Text } from '@chakra-ui/react'
import type { VotingProcessQuestion } from '@vocdoni/api-types'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ProcessStatus } from '~components/ui/ProcessStatus'
import { TurnoutBar } from '~components/ui/TurnoutBar'
import { useVoteText } from '~i18n/use-vote-text'
import { LockIcon } from '~theme/icons'
import { percentOf } from '~utils/vote-state'
import { QuestionResultBars } from '../../QuestionResultBars'
import { QuestionRowFrame } from './QuestionRow'
import { useManageText } from './use-manage-text'

export type ActiveQuestionRowProps = {
  question: VotingProcessQuestion
  number: number
  state: 'open' | 'paused' | 'held'
  electorate?: number
  weighted: boolean
  /** Close, or Open and Close on a paused question; none while the vote is paused as a whole. */
  buttons?: ReactNode
}

/**
 * An open, paused or held question: title and state, the question and how it is answered, "Turnout: 172 of 312" over
 * the bar, the provisional bars when results are live, then a note on what it means and the buttons. From `lg` a
 * plain row (V4VoteOne); below `lg` a tinted block (M4VoteOne) with the buttons at the end of the row on a tablet and
 * across it in equal parts on a phone.
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
  const manageText = useManageText()
  const count = question.results?.voteCount ?? 0
  const share = percentOf(count, electorate)
  const live = !question.secretUntilTheEnd
  const hasBars = live && !!question.results?.results?.length
  // The note under the bar, after a lock while results are secret (not on a held question). The opening and pause
  // times the board adds are not recorded by the API.
  const footNote = {
    held: t('votes.manage.held_note', { defaultValue: 'Held by the pause of the vote.' }),
    paused: t('votes.manage.paused_note', { defaultValue: 'No one can vote on it.' }),
    open: live
      ? t('votes.manage.provisional', { defaultValue: 'Provisional result.' })
      : t('votes.manage.locked', { defaultValue: 'Results will show when the question closes.' }),
  }[state]
  const note = manageText.note(question)
  const locked = !live && state !== 'held'
  // The column under the title: head, bar, bars and the note. The tablet's buttons span it.
  const tabletRows = 3 + (hasBars ? 1 : 0)
  const wide = { base: '1', lg: '1 / -1' } as const

  return (
    <QuestionRowFrame number={number} active held={state === 'held'}>
      <Grid
        templateColumns={{ base: '[minmax(0, 1fr)]', md: '[minmax(0, 1fr) auto]' }}
        columnGap={{ md: '2', lg: '3' }}
        rowGap='3'
        alignItems='center'
        minW='0'
      >
        <Stack gap={{ base: '0', lg: 'note' }} gridColumn={wide} minW='0'>
          <Flex align='baseline' justify='space-between' gap='3'>
            <Text as='h3' textStyle='item-title'>
              {text(question.title)}
            </Text>
            <ProcessStatus kind='question' state={state === 'held' ? 'paused' : state} flexShrink={0} />
          </Flex>
          {note && (
            <Text textStyle='meta' color='fg.subtle' lineClamp={3}>
              {note}
            </Text>
          )}
        </Stack>
        <TurnoutBar
          gridColumn={wide}
          maxW={{ md: 'turnout.max', lg: 'full' }}
          caption={manageText.turnout(count, electorate)}
          share={
            share !== undefined
              ? t('votes.manage.percent', { defaultValue: '{{percent}}%', percent: share })
              : undefined
          }
          value={count}
          max={electorate}
          label={manageText.turnoutLabel(count, electorate, share)}
          layout='compact'
        />
        {hasBars && (
          <Box gridColumn={wide} maxW={{ md: 'results.detail', lg: 'full' }}>
            <QuestionResultBars question={question} results={question.results} weighted={weighted} />
          </Box>
        )}
        {/* From `lg` the note's line is a button's height, buttons or not. */}
        <HStack gridColumn='1' gap='1.5' minH={{ lg: 'control.md' }} textStyle='meta' color='fg.subtle' minW='0'>
          {locked && <Icon as={LockIcon} boxSize='3.5' flexShrink={0} />}
          <Text>{footNote}</Text>
        </HStack>
        {buttons && (
          <HStack
            gap='2'
            justify='flex-end'
            gridColumn={{ base: '1', md: '2' }}
            gridRow={{ base: 'auto', md: `1 / span ${tabletRows}`, lg: 'auto' }}
            mt={{ base: '1', md: '0' }}
            // The phone board's buttons span the row, under the number too (24px and its 8px gap).
            ms={{ base: '-8', md: '0' }}
          >
            {buttons}
          </HStack>
        )}
        {/* Without buttons the phone board keeps their 16px top margin under the note (its held row). */}
        {!buttons && <Box hideFrom='md' h='1' />}
      </Grid>
    </QuestionRowFrame>
  )
}
