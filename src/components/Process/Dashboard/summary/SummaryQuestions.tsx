import { Card, Flex, Icon, Link, Text } from '@chakra-ui/react'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { generatePath, Link as RouterLink } from 'react-router'
import { Routes } from '~src/router/routes'
import { ChevronRightIcon, LockIcon } from '~theme/icons'
import { countQuestionStates } from '~utils/vote-state'
import { useManageText } from '../manage/use-manage-text'
import { AllAtOnceRow, ByQuestionRow, CompactQuestionRow } from './QuestionRows'
import { SummaryCardHeader } from './SummaryCardHeader'
import type { SummaryModel } from './use-summary-model'

/** The all-at-once card's last line: when the results show, and the way to the ballot. */
const ResultsLine = ({ model }: { model: SummaryModel }) => {
  const { t } = useTranslation()
  let line: string
  if (model.state === 'canceled')
    line = t('votes.summary.results_line.none', { defaultValue: 'There will be no results.' })
  else if (model.state === 'closed')
    line = t('votes.summary.results_line.public', { defaultValue: 'The results are public now.' })
  else if (model.secret)
    line = t('votes.summary.results_line.secret', { defaultValue: 'The results will show when the vote closes.' })
  else line = t('votes.summary.results_line.live', { defaultValue: 'The results show live, during the vote.' })

  return (
    <Flex
      align='center'
      gap='2'
      minH='11'
      py='2'
      px='card'
      borderTopWidth='hairline'
      borderColor='border'
      textStyle='body-sm'
      color='fg.subtle'
    >
      <Icon as={LockIcon} boxSize='3.5' flexShrink='0' />
      <Text flex='1'>{line}</Text>
      <Link asChild textStyle='control' gap='1'>
        <RouterLink to={generatePath(Routes.dashboard.processBallot, { id: model.election.id })}>
          {t('votes.summary.ballot_link', { defaultValue: 'Ballot' })}
          <Icon as={ChevronRightIcon} boxSize='3.5' />
        </RouterLink>
      </Link>
    </Flex>
  )
}

/**
 * The vote's questions. Question by question: one line each on the desktop with its result, votes and state, and
 * how many are in each state in the header. All at once: each question's turnout and blank votes, and when the
 * results show. A phone or tablet lists them with one quiet line each.
 */
export const SummaryQuestions = ({ model, desktop }: { model: SummaryModel; desktop: boolean }) => {
  const { t } = useTranslation()
  const manageText = useManageText()
  const titleId = useId()
  const { election, byQuestion, state, questionStates } = model

  let note: string | undefined
  if (byQuestion) {
    // The board counts states only once something has happened: not before the start, not after a cancel.
    if (state !== 'ready' && state !== 'canceled') note = manageText.counts(countQuestionStates(questionStates), 'card')
  } else {
    note = t('votes.summary.all_open', { defaultValue: 'All open at once' })
  }

  const manage = byQuestion ? (
    <Link asChild textStyle='control'>
      <RouterLink to={generatePath(Routes.dashboard.processManage, { id: election.id })}>
        {t('votes.summary.manage_link', { defaultValue: 'Manage questions' })}
      </RouterLink>
    </Link>
  ) : undefined

  return (
    <Card.Root variant='frame' as='section' aria-labelledby={titleId}>
      <SummaryCardHeader
        id={titleId}
        title={t('process.questions')}
        count={election.questions.length}
        note={note}
        noteAtEnd={!byQuestion}
        action={manage}
        desktop={desktop}
      />
      {election.questions.map((question, index) => {
        const row = { question, index, model, state: questionStates[index] }
        if (!desktop) return <CompactQuestionRow key={question.id} {...row} />
        return byQuestion ? <ByQuestionRow key={question.id} {...row} /> : <AllAtOnceRow key={question.id} {...row} />
      })}
      {desktop && !byQuestion && <ResultsLine model={model} />}
    </Card.Root>
  )
}
