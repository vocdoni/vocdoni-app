import { Button, Card, Flex, Heading, Icon, Stack, Text } from '@chakra-ui/react'
import { useId, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useActions } from '~components/Actions/ActionsContext'
import { useVoteText } from '~i18n/use-vote-text'
import { InfoIcon } from '~theme/icons'
import { useCloneAsDraft } from '../use-clone-as-draft'
import type { SummaryModel } from './use-summary-model'

/**
 * Instead of the participation hero, an all-at-once vote that is ready or canceled says where it stands, with the
 * one thing to do next: duplicate it. Starting a scheduled vote early has no backend yet.
 */
export const SummaryIdle = ({ model }: { model: SummaryModel }) => {
  const { t } = useTranslation()
  const { dateAt } = useVoteText()
  const { canManage } = useActions()
  const { cloneAsDraft, isCloning } = useCloneAsDraft()
  const titleId = useId()
  const { election, state, total } = model

  let title = ''
  let body: string | null = null
  let hint: string | null = null
  let action: ReactNode = null
  switch (state) {
    case 'ready':
      // With no start date there is no day to give: say where it stands.
      title = election.startDate
        ? t('votes.summary.idle.ready_title', {
            defaultValue: 'Opens by itself {{date}}',
            date: dateAt(election.startDate),
          })
        : t('votes.summary.idle.not_started', { defaultValue: 'It has not started yet' })
      if (total !== undefined) {
        body = t('votes.summary.idle.ready_body', {
          defaultValue: '{{people}} in the census and {{questions}}, all open at once.',
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
        <Heading as='h2' id={titleId} textStyle='state-title'>
          {title}
        </Heading>
        {body && (
          <Text mt='1.5' maxW='lead' textStyle='state-body' color='fg.muted'>
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
