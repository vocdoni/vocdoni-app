import { Alert, Button, Text } from '@chakra-ui/react'
import { useReactComponentsLocalize } from '@vocdoni/react-components'
import { useEffect, useId, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useVoterFlow } from '../flow-context'
import { describeAnswer } from '../format'
import { VOTER_CAST_ARM_MS } from '../live'
import { BallotAside } from '../parts/BallotAside'
import { PausedNotice } from '../parts/PausedNotice'
import { QuestionBody } from '../parts/QuestionBody'
import { RoomCastNotice } from '../parts/RoomCastNotice'
import { ScreenHint, ScreenKicker, VoterScreenFrame } from '../parts/ScreenParts'
import { VoterActionBar } from '../parts/VoterActionBar'

/**
 * Frame 2 of a question-by-question vote: the one open question the voter may vote, with "No votar aquesta pregunta"
 * (casts nothing, R12), "Enrere" to the room and "Emet el vot". Two or more open are `RoomSetScreen`. No review: the
 * note says it is final.
 */
export const RoomQuestionScreen = ({ index, paused }: { index: number; paused: boolean }) => {
  const { t } = useTranslation()
  const localize = useReactComponentsLocalize()
  const { election, facts, state, weight, weighted, lockedNotice, park, skip, castQuestion, casting } = useVoterFlow()
  const question = election.questions[index]
  const notice = lockedNotice(question.id)
  const answered = facts.answered[index] || !!notice
  const answer = notice
    ? ''
    : describeAnswer(question, state.answers[String(index)], { blank: t('voter.question.blank'), ranked: () => '' })
  const failed = state.castError !== null && state.castQuestionId === question.id
  // "Vota ara" sits where "Emet el vot" lands on a phone: off for a moment, so a double tap never casts (gate F1).
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setArmed(true), VOTER_CAST_ARM_MS)
    return () => clearTimeout(timer)
  }, [])

  const noteId = useId()
  const helpId = useId()
  const castLabel = failed ? t('voter.review.retry') : t('voter.review.cast')
  const reason = paused ? noteId : !answered ? helpId : undefined
  // Until the button is armed it shows the unavailable look too, so an answered ballot goes from off to primary and
  // never through a third grey.
  const primary =
    paused || !answered || !armed ? (
      <Button variant='off' size='ballot' aria-disabled aria-describedby={reason} data-testid='voter-cast'>
        {castLabel}
      </Button>
    ) : (
      // data-testid: the cast step e2e waits on, as on review.
      <Button
        size='ballot'
        data-testid='voter-cast'
        disabled={casting || facts.voting}
        loading={casting}
        onClick={() => void castQuestion(index)}
      >
        {castLabel}
      </Button>
    )

  return (
    <VoterScreenFrame kind='roomQuestion' privateContent>
      {paused && <PausedNotice />}
      <QuestionBody
        index={index}
        helpId={helpId}
        kicker={<ScreenKicker wide>{t('voter.room.open_label', { number: index + 1 })}</ScreenKicker>}
      />
      {answer ? (
        <ScreenHint>
          <Trans
            i18nKey='voter.room.will_vote'
            values={{ answer }}
            components={{ answer: <Text as='strong' color='fg' fontWeight='semibold' /> }}
          />
        </ScreenHint>
      ) : null}
      {failed && state.castUnconfirmed ? (
        <RoomCastNotice kind='unknown' />
      ) : failed ? (
        <Alert.Root status='error' layout='ballot' mt='6' role='alert'>
          <Alert.Content>
            <Alert.Description>{state.castError || localize('errors.vote_failed_unknown')}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      ) : null}
      {!notice && (
        <BallotAside>
          <Button variant='text-action' onClick={() => skip(index)}>
            {t('voter.room.skip')}
          </Button>
        </BallotAside>
      )}
      <VoterActionBar
        secondary={
          <Button variant='outline' size='ballot' onClick={() => park(index)}>
            {t('voter.back')}
          </Button>
        }
        primary={primary}
        note={
          <span id={noteId}>
            {paused
              ? t('voter.status.paused')
              : weighted && weight !== null
                ? t('voter.room.note_weighted', { weight })
                : t('voter.review.note')}
          </span>
        }
      />
    </VoterScreenFrame>
  )
}
