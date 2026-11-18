import { Box, Button, Card, Heading, Text } from '@chakra-ui/react'
import { resolveEndDate } from '@vocdoni/api-client'
import type { VotingProcessQuestion } from '@vocdoni/api-types'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { QuestionResultBars } from '~components/Process/Dashboard/QuestionResultBars'
import { useAppEnv } from '~src/app-env'
import { tallyIsPublic } from '~utils/question-tally'
import { percentOf } from '~utils/vote-state'
import { useVoterFlow } from '../flow-context'
import {
  formatVoteDay,
  formatVoteReturnDay,
  formatVoteTime,
  resultKind,
  resultsFinal,
  sentenceStop,
  textOf,
  voterTurnout,
  type Turnout,
} from '../format'
import { InlineAction, LocalText, NoticeCard, ScreenHeading, ScreenHelp, VoterScreenFrame } from '../parts/ScreenParts'
import { VoterActionBar } from '../parts/VoterActionBar'
import { VoteClosedLine, VoteStatusLine } from '../parts/VoteStatusLine'
import type { ResultsState } from '../voter-flow'

/**
 * "Han votat 184 persones." while open; once over, with the census size, "Han votat 221 de 312 persones, el 71%."
 * (boards M10, M11). Nothing when the deployment hides counts (the caller passes no turnout).
 */
const ResultsTurnout = ({ turnout, share }: { turnout: Turnout; share: boolean }) => {
  const { t } = useTranslation()
  const percent = share && turnout.total ? percentOf(turnout.count, turnout.total) : undefined
  return (
    // data-testid: the e2e observers read the live count from here; its English sentence starts with the number.
    <Text as='span' data-testid='process-vote-count'>
      {percent !== undefined
        ? t('voter.results.turnout_share', { count: turnout.count, total: turnout.total, percent })
        : t('voter.results.turnout', { count: turnout.count })}
    </Text>
  )
}

/** "Una opció", "Fins a 2 opcions", "Ordre de preferència, en punts": how the question was answered. */
const useKindLine = () => {
  const { t } = useTranslation()
  return (question: VotingProcessQuestion): string | null => {
    const kind = resultKind(question)
    if (!kind) return null
    switch (kind.key) {
      case 'single':
        return t('voter.results.kind_single')
      case 'multiple':
        return t('voter.results.kind_multiple', { count: kind.count })
      case 'approval':
        return t('voter.results.kind_approval')
      case 'ranked':
        return t('voter.results.kind_ranked')
    }
  }
}

/**
 * One question of the results card (board `.rq`): its title, how it was answered, then the organiser's result bars
 * as they are (rulings R6, R8). A tally the voter may not see yet (none, or secret until the chain publishes it) says
 * so instead. `final` follows the question's own tally, as the organiser's Resum does: the leading choice is set
 * apart only there, and nothing names a winner.
 */
const QuestionBlock = ({
  question,
  first,
  counting,
}: {
  question: VotingProcessQuestion
  first: boolean
  /** The vote is over and the count is not final: the last figures, nothing set apart; a secret tally is not counted. */
  counting: boolean
}) => {
  const { t } = useTranslation()
  const { election } = useVoterFlow()
  // The secret counting card (board 10c) is the title and "not counted yet", nothing more.
  const secretCounting = counting && !!question.secretUntilTheEnd && !tallyIsPublic(question)
  const kind = useKindLine()(question)
  const titleId = useId()
  return (
    <Box
      as='section'
      aria-labelledby={titleId}
      pt='4.5'
      px='5'
      pb='5'
      borderTopWidth={first ? undefined : 'hairline'}
      borderColor='border'
    >
      <Heading as='h2' id={titleId} textStyle='ballot-result-title'>
        {textOf(question.title as Parameters<typeof textOf>[0])}
      </Heading>
      {kind && !secretCounting ? (
        <Text textStyle='body' color='fg.subtle' mt='0.5'>
          {kind}
        </Text>
      ) : null}
      <Box mt={secretCounting ? '0.5' : '3'}>
        {tallyIsPublic(question) ? (
          <QuestionResultBars
            question={question}
            results={question.results}
            final={!counting && question.results?.finalResults === true}
            weighted={election.census?.weighted === true}
            layout='plain'
          />
        ) : (
          <Text textStyle='body' color='fg.subtle'>
            {question.results?.voteCount || secretCounting
              ? t('voter.results.not_counted')
              : t('voter.results.no_votes')}
          </Text>
        )}
      </Box>
    </Box>
  )
}

/**
 * The voter's results (boards V4VoterWideMore / M4VoterMore 9 to 11), reached from "Mostra els resultats" on
 * identify (public results), closed, the receipt and already-voted. `hidden`: secret until the end, when they come
 * and, for a voter who voted, "Ja has votat". `provisional`: the live figures of an open vote. `final`: the vote is
 * over; until the chain marks every tally final the heading says the votes are being counted. The process read
 * carries the figures and keeps polling, so every change shows with no reload.
 */
export const ResultsScreen = ({ state }: { state: ResultsState }) => {
  const { t, i18n } = useTranslation()
  const env = useAppEnv()
  const { election, facts, state: local, moved, showResults, checkReceipt } = useVoterFlow()
  const title = textOf(election.title as Parameters<typeof textOf>[0])
  const end = resolveEndDate(election)

  const actions = (
    <VoterActionBar
      secondary={
        <Button variant='outline' size='ballot' onClick={() => showResults(false)}>
          {t('voter.back')}
        </Button>
      }
      note={
        state === 'final' && !facts.connected ? (
          <InlineAction onClick={checkReceipt}>{t('voter.results.check_vote')}</InlineAction>
        ) : undefined
      }
    />
  )

  const hidden = state === 'hidden'
  const voted = facts.hasVoted || local.castDone
  const settled = state === 'final' && resultsFinal(election)
  const turnout = hidden ? null : voterTurnout(election, env)
  // The counting copy (boards 10b public, 10c secret) is chosen here only (ruling R5): a public vote keeps its last
  // live figures under a line that says they may still change; a secret one has nothing to show yet.
  const counting = state === 'final' && !settled
  const publicCounting = counting && election.questions.some((question) => !question.secretUntilTheEnd)
  const heading = hidden
    ? title
    : state === 'provisional'
      ? t('voter.results.provisional_title')
      : settled
        ? t('voter.results.final_title')
        : t('voter.results.counting_title')
  const note = hidden
    ? null
    : state === 'provisional'
      ? t('voter.results.provisional_note')
      : settled
        ? null
        : publicCounting
          ? t('voter.results.counting_help')
          : t('voter.results.counting_help_secret')

  return (
    <VoterScreenFrame kind='results'>
      {/* A live region for the status and heading only: a change from provisional to counting to final is announced
          and the focus never moves on it (ruling R1); the turnout below changes on every poll and stays quiet. */}
      <Box aria-live='polite'>
        {state === 'final' ? <VoteClosedLine /> : <VoteStatusLine />}
        <ScreenHeading focus={moved} mt='2.5'>
          {heading}
        </ScreenHeading>
      </Box>
      {hidden ? (
        end ? (
          <ScreenHelp>
            <LocalText>
              {t('voter.results.hidden_help', {
                date: formatVoteDay(end, i18n.language),
                time: formatVoteTime(end, i18n.language),
              })}
            </LocalText>
          </ScreenHelp>
        ) : null
      ) : (
        <ScreenHelp>
          {counting ? null : t('voter.results.of_vote', { title, stop: sentenceStop(title) })}
          {turnout && !counting ? (
            <>
              {' '}
              <ResultsTurnout turnout={turnout} share={state === 'final'} />
            </>
          ) : null}
          {note ? (counting ? note : ` ${note}`) : null}
        </ScreenHelp>
      )}
      {publicCounting ? (
        <Text textStyle='ballot-hint' color='fg.subtle' mt='5'>
          {t('voter.results.counting_last')}
        </Text>
      ) : null}
      {hidden ? (
        voted ? (
          <NoticeCard title={t('voter.voted.title')}>
            {end ? (
              <LocalText>
                {t('voter.results.hidden_card_body', { day: formatVoteReturnDay(end, i18n.language) })}
              </LocalText>
            ) : null}
          </NoticeCard>
        ) : null
      ) : (
        <Card.Root variant='ballot' mt={publicCounting ? '2' : '6'}>
          {election.questions.map((question, index) => (
            <QuestionBlock key={question.id} question={question} first={index === 0} counting={counting} />
          ))}
        </Card.Root>
      )}
      {actions}
    </VoterScreenFrame>
  )
}
