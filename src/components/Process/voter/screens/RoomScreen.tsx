import { Box, Card, Heading, Status } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { AgendaList } from '~components/ui/AgendaList'
import { useNow } from '~utils/use-now'
import { deriveQuestionState, deriveVoteState, type QuestionState } from '~utils/vote-state'
import { useVoterFlow } from '../flow-context'
import { textOf } from '../format'
import { VOTER_POLL_MS } from '../live'
import { ScreenHeading, ScreenHelp, VoterScreenFrame } from '../parts/ScreenParts'
import { VoterMedia } from '../parts/VoterMedia'
import { VoteLiveLine } from '../parts/VoteStatusLine'

const STATE_KEY: Record<QuestionState, string> = {
  open: 'voter.room.state.open',
  paused: 'voter.room.state.paused',
  closed: 'voter.room.state.closed',
  canceled: 'voter.room.state.canceled',
  toOpen: 'voter.room.state.waiting',
  notOpened: 'voter.room.state.waiting',
}

/**
 * The waiting room of a question-by-question vote (board V4VoterWideLive 1 and 4, M4VoterLive), read only until the SDK
 * can cast one question (vocdoni-integrator-sdk#111). It reads every question's state from the process read the page
 * polls, so a question that opens or closes updates it with no reload. Nobody is identified: nothing can be voted.
 */
export const RoomScreen = () => {
  const { t } = useTranslation()
  const { election, moved } = useVoterFlow()
  const now = useNow(VOTER_POLL_MS)
  const titleOf = (question: (typeof election.questions)[number]) =>
    textOf(question.title as Parameters<typeof textOf>[0])

  const states = election.questions.map((question) => deriveQuestionState(question, election, now))
  // Not started: no question has opened yet (the backend reports them all as paused).
  const voteState = deriveVoteState(election, now)
  const notStarted = voteState === 'ready'
  const openIndex = states.indexOf('open')
  const nextIndex = states.indexOf('toOpen')

  return (
    <VoterScreenFrame kind='room'>
      <VoteLiveLine state={voteState} />
      <ScreenHeading focus={moved} mt='2.5'>
        {textOf(election.title as Parameters<typeof textOf>[0])}
      </ScreenHeading>
      <VoterMedia />
      <AgendaList
        label={t('voter.agenda')}
        items={election.questions.map((question, index) => ({
          id: question.id,
          number: String(index + 1),
          title: titleOf(question),
          note: t(STATE_KEY[states[index]]),
        }))}
      />
      {openIndex !== -1 ? (
        <Card.Root variant='ballot-notice' mt='6' data-testid='voter-room-open'>
          <Status.Root size='ballot' tone='success'>
            <Status.Indicator />
            {t('voter.room.open_label', { number: openIndex + 1 })}
          </Status.Root>
          <Card.Title textStyle='ballot-open-title' mt='1.5'>
            {titleOf(election.questions[openIndex])}
          </Card.Title>
          <Card.Description mt='2.5'>{t('voter.room.not_votable')}</Card.Description>
        </Card.Root>
      ) : (
        <Box mt='6' data-testid='voter-room-none'>
          <Heading as='h2' textStyle='ballot-lead' fontWeight='semibold'>
            {t(notStarted ? 'voter.room.not_started_title' : 'voter.room.none_title')}
          </Heading>
          <ScreenHelp>{t(notStarted ? 'voter.room.not_started_body' : 'voter.room.none_body')}</ScreenHelp>
          {!notStarted && nextIndex !== -1 && (
            <AgendaList
              label={t('voter.room.next')}
              items={[
                {
                  id: election.questions[nextIndex].id,
                  number: String(nextIndex + 1),
                  title: titleOf(election.questions[nextIndex]),
                },
              ]}
            />
          )}
        </Box>
      )}
    </VoterScreenFrame>
  )
}
