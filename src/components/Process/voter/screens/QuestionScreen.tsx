import { Button } from '@chakra-ui/react'
import { BallotType, tryInferQuestionBallotType } from '@vocdoni/ballot'
import { useTranslation } from 'react-i18next'
import { useVoterFlow } from '../flow-context'
import { PausedNotice } from '../parts/PausedNotice'
import { QuestionBody } from '../parts/QuestionBody'
import { ScreenKicker, VoterScreenFrame } from '../parts/ScreenParts'
import { VoterActionBar } from '../parts/VoterActionBar'

/**
 * One question (boards V4VoterWide 4 to 6; paused mid-ballot V4VoterWideMore 2). The SDK renders its fields, with
 * its own validation and ids, through the voter's slots; "Continua" is the flow's (audit F4).
 */
export const QuestionScreen = ({ index, paused }: { index: number; paused: boolean }) => {
  const { t } = useTranslation()
  const { election, facts, lockedNotice, next, back } = useVoterFlow()
  const question = election.questions[index]
  const total = election.questions.length
  const notice = lockedNotice(question.id)
  // A question whose vote is already on its way has nothing left to answer: it never blocks "Continua" (F14).
  const answered = facts.answered[index] || !!notice
  const ranked =
    tryInferQuestionBallotType(question as Parameters<typeof tryInferQuestionBallotType>[0]) === BallotType.Ranked

  const primary = paused ? (
    <Button variant='off' size='ballot' aria-disabled data-testid='voter-continue'>
      {t('voter.continue')}
    </Button>
  ) : (
    // data-testid: "Continua" changes its words on a ranked question and moves between screens; e2e needs one handle.
    <Button
      variant={answered ? 'solid' : 'off'}
      size='ballot'
      aria-disabled={answered ? undefined : true}
      data-testid='voter-continue'
      onClick={() => next(index)}
    >
      {!answered && ranked ? t('voter.question.rank_all') : t('voter.continue')}
    </Button>
  )

  return (
    <VoterScreenFrame kind='question' privateContent>
      {paused && <PausedNotice />}
      <QuestionBody
        index={index}
        kicker={
          total > 1 ? (
            <ScreenKicker wide>{t('voter.progress.question', { current: index + 1, total })}</ScreenKicker>
          ) : undefined
        }
      />
      <VoterActionBar
        // The first question goes back to the welcome screen (`back` decides): a phone has no rail to go there by.
        secondary={
          <Button variant='outline' size='ballot' onClick={() => back(index)}>
            {t('voter.back')}
          </Button>
        }
        primary={primary}
        // While paused the note says so in the bar's own quiet style; the notice above carries the warning (D-19).
        note={paused ? t('voter.status.paused') : undefined}
      />
    </VoterScreenFrame>
  )
}
