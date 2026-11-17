import { Button, Card, Flex, Heading, Icon, Stack, Text } from '@chakra-ui/react'
import { isBeforeStart } from '@vocdoni/api-client'
import { useId, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useActions } from '~components/Actions/ActionsContext'
import { useVoteText } from '~i18n/use-vote-text'
import { InfoIcon } from '~theme/icons'
import { useCloneAsDraft } from '../use-clone-as-draft'
import type { SummaryModel } from './use-summary-model'

/**
 * Instead of the turnout card, a vote that is ready or canceled says where it stands, in either mode, with the one
 * thing to do next for a canceled one: duplicate it. Starting a scheduled vote early has no backend yet.
 */
export const SummaryIdle = ({ model }: { model: SummaryModel }) => {
  const { t } = useTranslation()
  const { dateAt } = useVoteText()
  const { canManage } = useActions()
  const { cloneAsDraft, isCloning } = useCloneAsDraft()
  const titleId = useId()
  const { election, byQuestion, state, total, now } = model

  let title = ''
  let body: string | null = null
  let hint: string | null = null
  let action: ReactNode = null
  switch (state) {
    case 'ready':
      if (byQuestion) {
        // Ready until a question opens: before the start it waits for the clock, after it for the organiser.
        const started = !isBeforeStart(election.startDate, now)
        title = started
          ? t('votes.summary.idle.by_question_started_title', { defaultValue: 'No question is open yet' })
          : t('votes.summary.idle.not_started', { defaultValue: 'It has not started yet' })
        body = started
          ? t('votes.summary.idle.by_question_started_body', {
              defaultValue: 'Open the first question to start the vote.',
            })
          : t('votes.summary.idle.by_question_body', {
              defaultValue: 'When it starts, the questions start closed and you open them one at a time.',
            })
        break
      }
      // With no start date there is no day to give: say where it stands.
      title = election.startDate
        ? t('votes.summary.idle.ready_title', {
            defaultValue: 'Opens by itself {{date}}',
            date: dateAt(election.startDate),
          })
        : t('votes.summary.idle.not_started', { defaultValue: 'It has not started yet' })
      if (total !== undefined) {
        body = t('votes.summary.idle.ready_body', {
          defaultValue_one: '{{people}} in the census and {{questions}}.',
          defaultValue_other: '{{people}} in the census and {{questions}}, all open at once.',
          count: election.questions.length,
          people: t('votes.summary.fact.census', {
            defaultValue_one: '{{count, number}} person',
            defaultValue_other: '{{count, number}} people',
            count: total,
          }),
          questions: t('votes.summary.idle.questions', {
            defaultValue_one: '{{count, number}} question',
            defaultValue_other: '{{count, number}} questions',
            count: election.questions.length,
          }),
        })
      }
      break
    case 'canceled':
      title = t('votes.summary.idle.canceled_title', { defaultValue: 'Vote canceled' })
      body = t('votes.summary.idle.canceled_body', {
        defaultValue: 'The votes cast were discarded. There are no results.',
      })
      if (canManage) {
        hint = t('votes.summary.idle.canceled_hint', { defaultValue: 'You can duplicate it to call it again.' })
        action = (
          <Button variant='outline' loading={isCloning} onClick={() => void cloneAsDraft(election)}>
            {t('votes.summary.idle.duplicate', { defaultValue: 'Duplicate it' })}
          </Button>
        )
      }
      break
  }

  return (
    <Card.Root variant='frame' as='section' aria-labelledby={titleId}>
      <Stack gap='0' px={{ base: '4', md: 'card', lg: '6' }} py={{ base: '4.5', md: 'card', lg: 'idle' }}>
        {/* The header already names the vote's state: the card goes straight to what it means. */}
        <Heading as='h2' id={titleId} textStyle='feature-title'>
          {title}
        </Heading>
        {body && (
          <Text mt='1.5' maxW='lead' textStyle='control-touch' color='fg.muted'>
            {body}
          </Text>
        )}
      </Stack>
      {(hint || action) && (
        <Flex
          align='center'
          wrap='wrap'
          gap='2'
          minH='actionbar'
          ps={{ base: '4', md: 'card', lg: '6' }}
          pe={{ base: '4', md: 'card', lg: 'idle.end' }}
          py={{ base: '3', lg: '0' }}
          borderTopWidth='hairline'
          borderColor='border.muted'
          textStyle='body-sm'
          color='fg.subtle'
        >
          <Icon as={InfoIcon} boxSize='3.5' />
          <Text flex='1' minW='0'>
            {hint}
          </Text>
          {action}
        </Flex>
      )}
    </Card.Root>
  )
}
