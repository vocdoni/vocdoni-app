import { Alert, Box, Button, Card, Heading, Status } from '@chakra-ui/react'
import type { VotingProcessQuestion } from '@vocdoni/api-types'
import { useId } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { QuestionResultBars } from '~components/Process/Dashboard/QuestionResultBars'
import { AgendaList } from '~components/ui/AgendaList'
import { SuccessDisc } from '~components/ui/SuccessDisc'
import { tallyIsPublic } from '~utils/question-tally'
import { useVoterFlow } from '../flow-context'
import { textOf } from '../format'
import { ReceiptCard } from '../parts/ReceiptCard'
import { RoomCastNotice } from '../parts/RoomCastNotice'
import { ScreenHeading, ScreenHelp, ScreenHint, ScreenKicker, VoterScreenFrame } from '../parts/ScreenParts'
import { VoterActionBar } from '../parts/VoterActionBar'
import { VoterMedia } from '../parts/VoterMedia'
import { roomNextIndex } from '../room'
import type { RoomMissedRecord, RoomRecord } from '../voter-flow'

// The question-by-question frames other than the ballot (boards V4VoterWideLive / M4VoterLive 0, 1, 3, 3b, 3c, 4).
// Each follows the process read the page polls: a question that opens replaces them by its ballot with no reload.

const useRoomTexts = () => {
  const { election, facts } = useVoterFlow()
  const titleOf = (index: number) => textOf(election.questions[index].title as Parameters<typeof textOf>[0])
  // "S'està preparant la pregunta següent": only while one is left to open (plan Q7).
  const hasNext = !!facts.room && roomNextIndex(facts.room) !== -1
  return { titleOf, hasNext, voteTitle: textOf(election.title as Parameters<typeof textOf>[0]) }
}

const Preparing = () => {
  const { t } = useTranslation()
  const { hasNext } = useRoomTexts()
  return hasNext ? <ScreenHint>{t('voter.room.preparing')}</ScreenHint> : null
}

/** Frame 0: open, no question opened yet. No button; below `lg` the questions are listed under the text. */
export const RoomNotStartedScreen = () => {
  const { t } = useTranslation()
  const { election, moved } = useVoterFlow()
  const { titleOf } = useRoomTexts()
  return (
    <VoterScreenFrame kind='roomNotStarted'>
      <ScreenHeading focus={moved}>{t('voter.room.not_started_title')}</ScreenHeading>
      <ScreenHelp>{t('voter.room.not_started_body')}</ScreenHelp>
      <VoterMedia />
      {/* From `lg` the rail lists them (board `.od.odm`). */}
      <Box hideFrom='lg'>
        <AgendaList
          label={t('voter.room.questions')}
          items={election.questions.map((question, index) => ({
            id: question.id,
            number: String(index + 1),
            title: titleOf(index),
          }))}
        />
      </Box>
    </VoterScreenFrame>
  )
}

/** Frame 1 (and 1b): a question is open and the voter left its ballot. "Vota ara" is the one button. */
export const RoomOpenScreen = ({ index }: { index: number }) => {
  const { t } = useTranslation()
  const { moved, resume, form } = useVoterFlow()
  const { titleOf } = useRoomTexts()
  // An open set waits together: every question of it, each in its card.
  const shown = form ?? [index]
  return (
    <VoterScreenFrame kind='roomOpen'>
      <ScreenKicker>{t(form ? 'voter.room.kicker_set' : 'voter.room.kicker')}</ScreenKicker>
      <ScreenHeading focus={moved}>{t(form ? 'voter.room.open_title_set' : 'voter.room.open_title')}</ScreenHeading>
      {shown.map((shownIndex) => (
        <Card.Root key={shownIndex} variant='ballot-feature' mt='6'>
          <Status.Root size='ballot' tone='success'>
            <Status.Indicator />
            {t('voter.room.open_label', { number: shownIndex + 1 })}
          </Status.Root>
          <Card.Title textStyle='ballot-open-title' mt='1.5'>
            {titleOf(shownIndex)}
          </Card.Title>
        </Card.Root>
      ))}
      <VoterActionBar
        primary={
          <Button size='ballot' onClick={() => resume(index)}>
            {t('voter.room.vote_now')}
          </Button>
        }
      />
    </VoterScreenFrame>
  )
}

/**
 * Frame 3: the open question is cast: the tick and the title, never the answer (gate-3 F1, owner ruling 2026-11-24: a
 * cast that started here is not the vote the chain holds when another device voted first). An anonymous census shows
 * the code to keep now (V4VoterWideMore 12's warning and card, plan Q9).
 * `authorised`: signed from another tab of an anonymous census (13's words, no tick). `lost`: signed and not on chain
 * with nothing to re-send (an error notice, no tick).
 */
export const RoomVotedScreen = ({ index, record }: { index: number; record: RoomRecord }) => {
  const { t } = useTranslation()
  const { election, moved, anonymous, voteIds, state } = useVoterFlow()
  const { titleOf } = useRoomTexts()
  const question = election.questions[index]
  if (record === 'authorised') {
    return (
      <VoterScreenFrame kind='roomVoted' privateContent>
        <ScreenHeading focus={moved}>{t('voter.voted.anonymous_title')}</ScreenHeading>
        <ScreenHelp>{t('voter.voted.anonymous_help')}</ScreenHelp>
        <Preparing />
      </VoterScreenFrame>
    )
  }
  if (record === 'lost') {
    return (
      <VoterScreenFrame kind='roomVoted' privateContent>
        <ScreenKicker wide>{t('voter.room.open_label', { number: index + 1 })}</ScreenKicker>
        <ScreenHeading focus={moved} mt={{ base: '0', lg: '2' }}>
          {titleOf(index)}
        </ScreenHeading>
        <RoomCastNotice kind='lost' />
        <Preparing />
      </VoterScreenFrame>
    )
  }
  const keepCode = anonymous && !!voteIds[question.id]
  return (
    <VoterScreenFrame kind='roomVoted' privateContent>
      <SuccessDisc />
      <ScreenHeading focus={moved} mt='5'>
        {t('voter.room.voted_title', { number: index + 1 })}
      </ScreenHeading>
      {/* "Emet el vot" found it already voted: the vote here is not the one on record (owner ruling 2026-11-24). */}
      {state.votedElsewhere === question.id && <ScreenHelp>{t('voter.room.voted_elsewhere')}</ScreenHelp>}
      {keepCode && (
        <>
          <Alert.Root status='warning' layout='ballot' mt='5' role='status'>
            <Alert.Content>
              <Alert.Description>
                <Trans i18nKey='voter.receipt.anonymous_warning' components={{ strong: <strong /> }} />
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>
          <ReceiptCard anonymous />
        </>
      )}
      <Preparing />
    </VoterScreenFrame>
  )
}

/** Frame 3b: skipped. Nothing was sent (R12), and the voter can still vote it while it stays open. */
export const RoomSkippedScreen = ({ index }: { index: number }) => {
  const { t } = useTranslation()
  const { moved, resume, form } = useVoterFlow()
  const number = index + 1
  return (
    <VoterScreenFrame kind='roomSkipped'>
      <ScreenKicker wide>{form ? t('voter.room.open_label_set') : t('voter.room.open_label', { number })}</ScreenKicker>
      <ScreenHeading focus={moved} mt={{ base: '0', lg: '2' }}>
        {form ? t('voter.room.skipped_title_set') : t('voter.room.skipped_title', { number })}
      </ScreenHeading>
      <ScreenHelp>{t(form ? 'voter.room.skipped_help_set' : 'voter.room.skipped_help')}</ScreenHelp>
      {/* In the column at every width, not in the action bar (board 3b). */}
      <Button variant='outline' size='ballot' mt='6' alignSelf='flex-start' onClick={() => resume(index)}>
        {form ? t('voter.room.vote_question_set') : t('voter.room.vote_question', { number })}
      </Button>
      <Preparing />
    </VoterScreenFrame>
  )
}

/**
 * 3d and 3e: the closed question's result as a card, until the next question opens. Only a tally the voter may see
 * (it has votes, and a secret one only once the chain made it final): else nothing. The bars are the organiser's as
 * they are, with only a sole leader set apart; nothing names a winner.
 */
const RoomResultCard = ({ question }: { question: VotingProcessQuestion }) => {
  const { t } = useTranslation()
  const { election } = useVoterFlow()
  const titleId = useId()
  if (!tallyIsPublic(question)) return null
  return (
    <Card.Root variant='ballot' mt='6'>
      <Box as='section' aria-labelledby={titleId} pt='4.5' px='5' pb='5'>
        <Heading as='h2' id={titleId} textStyle='ballot-result-title'>
          {t('voter.room.result_title')}
        </Heading>
        <Box mt='3'>
          <QuestionResultBars
            question={question}
            results={question.results}
            final
            weighted={election.census?.weighted === true}
            layout='plain'
          />
        </Box>
      </Box>
    </Card.Root>
  )
}

/**
 * Frame 3c: the question closed and the voter did not vote it: "No l'has votada." No result by default (R11). With
 * `result` (the creator shows it) it is 3d: the title and the result card alone, the rail saying the rest; the line
 * stays only while there is no card to show (owner ruling 2026-11-24). A vote that was cast but is not known to be on
 * chain is never told "No l'has votada" (gate-3 F2, F3): `lost` (signed, not on chain, nothing to re-send) gives an
 * error notice, as frame 3 does; `unknown` (no answer from the relay) a warning that it may have been recorded, with
 * the way to check, as the all-at-once closed screen does.
 */
export const RoomMissedScreen = ({
  index,
  result = false,
  record,
}: {
  index: number
  result?: boolean
  record?: RoomMissedRecord
}) => {
  const { t } = useTranslation()
  const { election, moved } = useVoterFlow()
  const number = index + 1
  const question = election.questions[index]
  const showCard = result && !!question && tallyIsPublic(question)
  return (
    <VoterScreenFrame kind='roomMissed' privateContent={!!record}>
      <ScreenKicker wide>{t('voter.room.closed_label', { number })}</ScreenKicker>
      <ScreenHeading focus={moved} mt={{ base: '0', lg: '2' }}>
        {t('voter.room.missed_title', { number })}
      </ScreenHeading>
      {record ? <RoomCastNotice kind={record} /> : !showCard && <ScreenHelp>{t('voter.room.missed_help')}</ScreenHelp>}
      {showCard && <RoomResultCard question={question} />}
      <Preparing />
    </VoterScreenFrame>
  )
}

/**
 * Frame 3e: the question closed after the voter voted it, and the creator shows its result: the title and the result
 * card ("Resultat"), with no sentence over it and never the answer (gate-3 F1, owner ruling 2026-11-24). While the
 * tally is not public there is no card, and a plain "Has votat." keeps the screen from being empty.
 */
export const RoomClosedVotedScreen = ({ index }: { index: number }) => {
  const { t } = useTranslation()
  const { election, moved } = useVoterFlow()
  const number = index + 1
  const question = election.questions[index]
  const showCard = !!question && tallyIsPublic(question)
  return (
    <VoterScreenFrame kind='roomClosedVoted' privateContent>
      <ScreenKicker wide>{t('voter.room.closed_label', { number })}</ScreenKicker>
      <ScreenHeading focus={moved} mt={{ base: '0', lg: '2' }}>
        {t('voter.room.closed_title', { number })}
      </ScreenHeading>
      {showCard ? <RoomResultCard question={question} /> : <ScreenHelp>{t('voter.room.closed_voted_help')}</ScreenHelp>}
      <Preparing />
    </VoterScreenFrame>
  )
}

/** Frame 4: none open. Nothing to do: it says so, names the next question, and has no button. */
export const RoomNoneScreen = () => {
  const { t } = useTranslation()
  const { election, facts, moved } = useVoterFlow()
  const { titleOf, voteTitle } = useRoomTexts()
  const next = facts.room ? roomNextIndex(facts.room) : -1
  return (
    <VoterScreenFrame kind='roomNone'>
      <ScreenKicker>{voteTitle}</ScreenKicker>
      <ScreenHeading focus={moved}>{t('voter.room.none_title')}</ScreenHeading>
      <ScreenHelp>{t('voter.room.none_body')}</ScreenHelp>
      {next !== -1 && (
        <AgendaList
          label={t('voter.room.next')}
          items={[{ id: election.questions[next].id, number: String(next + 1), title: titleOf(next) }]}
        />
      )}
    </VoterScreenFrame>
  )
}
