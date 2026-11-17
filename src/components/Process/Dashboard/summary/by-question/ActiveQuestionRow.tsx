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
  /** Pause and Close, or Resume and Close; none while the vote is paused as a whole. */
  buttons?: ReactNode
  desktop: boolean
}

/**
 * An open, paused or held question. From `lg` (V4VoteOne): title and state, the question and how it is answered,
 * "Turnout: 172 of 312" over the bar, the provisional bars when results are live, then the note and the buttons.
 * Below `lg` (M4VoteOne) a tinted block: title, one line of state and kind, the bar with its scale and the buttons,
 * at the end of the row on a tablet and across it in equal parts on a phone.
 */
export const ActiveQuestionRow = ({
  question,
  number,
  state,
  electorate,
  weighted,
  buttons,
  desktop,
}: ActiveQuestionRowProps) => {
  const { t } = useTranslation()
  const { text } = useVoteText()
  const manageText = useManageText()
  const count = question.results?.voteCount ?? 0
  const share = percentOf(count, electorate)
  const live = !question.secretUntilTheEnd
  const hasBars = live && !!question.results?.results?.length
  // The desktop board's note under the bar, after a lock while results are secret (not on a held question). The
  // opening and pause times it adds are not recorded by the API.
  const footNote = {
    held: t('votes.manage.held_note', { defaultValue: 'Held by the pause of the vote.' }),
    paused: t('votes.manage.paused_note', { defaultValue: 'No one can vote on it.' }),
    open: live
      ? t('votes.manage.provisional', { defaultValue: 'Provisional result.' })
      : t('votes.manage.locked', { defaultValue: 'Results will show when the question closes.' }),
  }[state]
  // The touch boards' line under the title: the state (none while open) and how it is answered.
  const kind = manageText.note(question, false)
  const touchState = {
    held: t('votes.manage.meta.held', { defaultValue: 'Held with the vote.' }),
    paused: t('votes.manage.paused_note', { defaultValue: 'No one can vote on it.' }),
    open: '',
  }[state]
  const touchNote = touchState && kind ? `${touchState} ${kind}` : touchState || kind
  const note = desktop ? manageText.note(question) : touchNote
  const locked = !live && state !== 'held'
  // The column under the title: head, bar and bars. The tablet's buttons span it.
  const tabletRows = 2 + (hasBars ? 1 : 0)
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
            <Text as='h3' textStyle='question-head'>
              {text(question.title)}
            </Text>
            <ProcessStatus
              kind='question'
              state={state === 'held' ? 'paused' : state}
              display={{ base: 'none', lg: 'inline-flex' }}
            />
          </Flex>
          {note && (
            <Text textStyle='note' color='fg.subtle'>
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
          layout={{ base: 'scale', lg: 'compact' }}
        />
        {hasBars && (
          <Box gridColumn={wide} maxW={{ md: 'results.detail', lg: 'full' }}>
            <QuestionResultBars
              question={question}
              results={question.results}
              weighted={weighted}
              layout={desktop ? 'indented' : 'plain'}
            />
          </Box>
        )}
        {/* The desktop board's footer line is a button's height, buttons or not. */}
        <HStack
          gridColumn='1'
          gap='1.5'
          minH='control.md'
          textStyle='note'
          color='fg.subtle'
          minW='0'
          display={{ base: 'none', lg: 'flex' }}
        >
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
        {/* Without buttons the phone board keeps their 16px top margin under the bar (its held row). */}
        {!buttons && <Box hideFrom='md' h='1' />}
      </Grid>
    </QuestionRowFrame>
  )
}
