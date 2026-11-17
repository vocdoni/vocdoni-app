import { Button, Card, Flex, Heading, Icon, Stack, Text } from '@chakra-ui/react'
import { useId, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { generatePath, Link as RouterLink } from 'react-router'
import { useActions } from '~components/Actions/ActionsContext'
import { ProcessStatus } from '~components/ui/ProcessStatus'
import { useVoteText } from '~i18n/use-vote-text'
import { Routes } from '~src/router/routes'
import { ForwardIcon, InfoIcon } from '~theme/icons'
import { useCloneAsDraft } from '../use-clone-as-draft'
import type { SummaryModel } from './use-summary-model'

// The board's 26px padding and 60px footer, on the card's 22px inner edge.
const PAD_26 = '[calc({spacing.card} + {spacing.1})]'
const FOOTER_60 = '[calc({sizes.14} + {sizes.1})]'

/**
 * Instead of the participation hero, an all-at-once vote that is ready, ended or canceled says where it stands, with
 * the one thing to do next: see the results, or duplicate it. Starting a scheduled vote early has no backend yet.
 */
export const SummaryIdle = ({ model }: { model: SummaryModel }) => {
  const { t } = useTranslation()
  const { dateAt } = useVoteText()
  const { canManage } = useActions()
  const { cloneAsDraft, isCloning } = useCloneAsDraft()
  const titleId = useId()
  const { election, state, count, total, percent } = model

  let title = ''
  let body: string | null = null
  let hint: string | null = null
  let action: ReactNode = null
  switch (state) {
    case 'ready':
      title = t('votes.summary.idle.ready_title', {
        defaultValue: 'Opens by itself {{date}}',
        date: dateAt(election.startDate),
      })
      if (total !== undefined) {
        body = t('votes.summary.idle.ready_body', {
          defaultValue: '{{people}} in the census and {{questions}}, all open at once.',
          people: t('votes.summary.fact.census', {
            defaultValue_one: '{{count}} person',
            defaultValue_other: '{{count}} people',
            count: total,
          }),
          questions: t('votes.summary.idle.questions', {
            defaultValue_one: '{{count}} question',
            defaultValue_other: '{{count}} questions',
            count: election.questions.length,
          }),
        })
      }
      break
    case 'closed':
      title = t('votes.summary.idle.ended_title', {
        defaultValue_one: 'Vote ended with {{count}} vote',
        defaultValue_other: 'Vote ended with {{count}} votes',
        count,
      })
      body = [
        percent !== undefined &&
          t('votes.summary.idle.ended_turnout', { defaultValue: '{{percent}}% of the census voted.', percent }),
        t('votes.summary.idle.ended_final', { defaultValue: 'The results are final and voters can already see them.' }),
      ]
        .filter(Boolean)
        .join(' ')
      hint = t('votes.summary.idle.ended_hint', { defaultValue: "Each question's results are on the results page." })
      action = (
        <Button asChild variant='solid'>
          <RouterLink to={generatePath(Routes.dashboard.processResults, { id: election.id })}>
            {t('votes.summary.idle.show_results', { defaultValue: 'Show the results' })}
            <Icon as={ForwardIcon} />
          </RouterLink>
        </Button>
      )
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
      <Stack gap='0' px={{ base: '4', md: 'card', lg: '6' }} py={{ base: '4.5', md: 'card', lg: PAD_26 }}>
        <ProcessStatus state={state} alignSelf='flex-start' />
        <Heading
          as='h2'
          id={titleId}
          mt='2.5'
          textStyle='status-title'
          letterSpacing='heading.section'
          lineHeight='shorter'
        >
          {title}
        </Heading>
        {body && (
          <Text mt='1.5' maxW='xl' textStyle='control' color='fg.muted'>
            {body}
          </Text>
        )}
      </Stack>
      {(hint || action) && (
        <Flex
          align='center'
          wrap='wrap'
          gap='2'
          minH={FOOTER_60}
          ps={{ base: '4', md: 'card', lg: '6' }}
          pe={{ base: '4', md: 'card', lg: '3' }}
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
