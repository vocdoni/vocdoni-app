import { Alert, Box, Button, Text } from '@chakra-ui/react'
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
import { ScreenHeading, ScreenHint, ScreenKicker, VoterScreenFrame } from '../parts/ScreenParts'
import { VoterActionBar } from '../parts/VoterActionBar'

/**
 * The open set of a question-by-question vote, two or more questions (`roomSet`): every question on one screen, each
 * with what will be sent, "No votar aquestes preguntes" and "Enrere" to the room, and one "Emet el vot" that casts
 * them all. No review: the note says it is final.
 */
export const RoomSetScreen = ({ set, paused }: { set: readonly number[]; paused: boolean }) => {
  const { t } = useTranslation()
  const localize = useReactComponentsLocalize()
  const { election, facts, state, weight, weighted, moved, lockedNotice, park, skip, castQuestion, casting } =
    useVoterFlow()
  const allAnswered = set.every((index) => facts.answered[index])
  const failed = state.castError !== null && set.some((index) => election.questions[index].id === state.castQuestionId)
  // The help line of each question that still needs an answer is what the disabled cast points at.
  const baseId = useId()
  const helpIdOf = (index: number) => `${baseId}-help-${index}`
  // "Vota ara" sits where "Emet el vot" lands on a phone: off for a moment, so a double tap never casts (gate F1).
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setArmed(true), VOTER_CAST_ARM_MS)
    return () => clearTimeout(timer)
  }, [])

  const noteId = useId()
  const castLabel = failed ? t('voter.review.retry') : t('voter.review.cast')
  const reason = paused
    ? noteId
    : !allAnswered
      ? set
          .filter((index) => !facts.answered[index])
          .map(helpIdOf)
          .join(' ')
      : undefined
  // Until the button is armed it shows the unavailable look too, so an answered ballot goes from off to primary and
  // never through a third grey.
  const primary =
    paused || !allAnswered || !armed ? (
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
        onClick={() => void castQuestion(set[0])}
      >
        {castLabel}
      </Button>
    )

  return (
    <VoterScreenFrame kind='roomSet' privateContent>
      {paused && <PausedNotice />}
      <ScreenKicker>{t('voter.room.kicker_set')}</ScreenKicker>
      <ScreenHeading focus={moved}>{t('voter.room.open_title_set')}</ScreenHeading>
      {set.map((index) => {
        const question = election.questions[index]
        const notice = lockedNotice(question.id)
        const answer = notice
          ? ''
          : describeAnswer(question, state.answers[String(index)], {
              blank: t('voter.question.blank'),
              ranked: () => '',
            })
        return (
          <Box key={question.id} mt='10'>
            <QuestionBody
              index={index}
              inSet
              helpId={helpIdOf(index)}
              kicker={<ScreenKicker>{t('voter.room.open_label', { number: index + 1 })}</ScreenKicker>}
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
          </Box>
        )
      })}
      {failed && state.castUnconfirmed ? (
        <RoomCastNotice kind='unknown' />
      ) : failed ? (
        <Alert.Root status='error' layout='ballot' mt='6' role='alert'>
          <Alert.Content>
            <Alert.Description>{state.castError || localize('errors.vote_failed_unknown')}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      ) : null}
      {set.some((index) => !lockedNotice(election.questions[index].id)) && (
        <BallotAside>
          <Button variant='text-action' onClick={() => skip(set[0])}>
            {t('voter.room.skip_set')}
          </Button>
        </BallotAside>
      )}
      <VoterActionBar
        secondary={
          <Button variant='outline' size='ballot' onClick={() => park(set[0])}>
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
