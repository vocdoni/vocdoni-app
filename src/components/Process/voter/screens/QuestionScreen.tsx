import { Alert, Box, Button } from '@chakra-ui/react'
import { BallotType, questionSelectionRange, tryInferQuestionBallotType } from '@vocdoni/ballot'
import { ElectionQuestion, useQuestionsForm, useReactComponentsLocalize } from '@vocdoni/react-components'
import type { VotingProcessQuestion } from '@vocdoni/api-types'
import type { TFunction } from 'i18next'
import { useFormState } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Markdown } from '~components/ui/Markdown'
import { useVoterFlow } from '../flow-context'
import { textOf } from '../format'
import { PausedNotice } from '../parts/PausedNotice'
import { ScreenHeading, ScreenHelp, ScreenKicker, VoterScreenFrame } from '../parts/ScreenParts'
import { VoterActionBar } from '../parts/VoterActionBar'
import { QuestionErrorLine, questionTitleId } from '../voter-components'

/** "Tria una resposta.", "Tria fins a 2 opcions."…: how to answer, from the question's ballot type. */
const helpFor = (t: TFunction, question: VotingProcessQuestion): string => {
  const type = tryInferQuestionBallotType(question as Parameters<typeof tryInferQuestionBallotType>[0])
  if (type === undefined) return ''
  if (type === BallotType.Ranked) return t('voter.question.help_ranked')
  if (type === BallotType.Approval) return t('voter.question.help_approval')
  if (type !== BallotType.MultiChoice) return t('voter.question.help_single')
  const { min, max } = questionSelectionRange(question as Parameters<typeof questionSelectionRange>[0])
  if (min === max) return t('voter.question.help_exact', { count: max })
  if (min <= 1) return t('voter.question.help_multiple', { count: max })
  return t('voter.question.help_range', { min, max })
}

// The SDK's form errors that stop a cast, unlike its selection checks (required, min, max, a ranking not finished),
// which the hint and the off "Continua" already say: a ballot type this app cannot cast, and a choice it cannot encode.
const castBlockers = new Set(['unsupported', 'encode'])

/**
 * One question (boards V4VoterWide 4 to 6; paused mid-ballot V4VoterWideMore 2). The SDK renders its fields, with
 * its own validation and ids, through the voter's slots; "Continua" is the flow's (audit F4).
 */
export const QuestionScreen = ({ index, paused }: { index: number; paused: boolean }) => {
  const { t } = useTranslation()
  const localize = useReactComponentsLocalize()
  const { election, facts, moved, lockedNotice, next, back } = useVoterFlow()
  const question = election.questions[index]
  const total = election.questions.length
  const notice = lockedNotice(question.id)
  // A question whose vote is already on its way has nothing left to answer: it never blocks "Continua" (F14).
  const answered = facts.answered[index] || !!notice
  const ballotType = tryInferQuestionBallotType(question as Parameters<typeof tryInferQuestionBallotType>[0])
  const ranked = ballotType === BallotType.Ranked
  const description = textOf(question.description as Parameters<typeof textOf>[0])
  const help = helpFor(t, question)
  // The voter's error slot hides every field error, as it cannot tell these from a selection check (same props), so
  // the screen shows them, from the error's type: the unsupported notice the SDK draws for a question with no ballot
  // type, and the errors the SDK's vote sets (`unsupported`, `encode`).
  const { fmethods } = useQuestionsForm()
  const { errors } = useFormState({ control: fmethods.control, name: String(index) })
  const fieldError = (errors as Record<string, { type?: unknown; message?: unknown } | undefined>)[String(index)]
  // Budget and quadratic questions cannot be cast here (the SDK would draw them as a single choice): the notice
  // replaces their ballot (gate F10).
  const castable = ballotType !== BallotType.Budget && ballotType !== BallotType.Quadratic
  const blocker =
    ballotType === undefined || !castable
      ? localize('errors.question_unsupported')
      : fieldError && castBlockers.has(String(fieldError.type)) && fieldError.message
        ? String(fieldError.message)
        : null

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
      {total > 1 && <ScreenKicker wide>{t('voter.progress.question', { current: index + 1, total })}</ScreenKicker>}
      <ScreenHeading focus={moved} id={questionTitleId(String(index))} mt={total > 1 ? { base: '0', lg: '2' } : '0'}>
        {textOf(question.title as Parameters<typeof textOf>[0])}
      </ScreenHeading>
      {description ? (
        <Box textStyle='ballot-body' color='fg.muted' mt='2.5'>
          <Markdown>{description}</Markdown>
        </Box>
      ) : null}
      {help ? <ScreenHelp>{help}</ScreenHelp> : null}
      {notice ? (
        <Alert.Root status='info' layout='ballot' mt='6'>
          <Alert.Content>
            <Alert.Description>{localize(notice)}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      ) : (
        <>
          {castable && <ElectionQuestion index={String(index)} question={question} />}
          {blocker && <QuestionErrorLine>{blocker}</QuestionErrorLine>}
        </>
      )}
      <VoterActionBar
        secondary={
          index > 0 ? (
            <Button variant='outline' size='ballot' onClick={() => back(index)}>
              {t('voter.back')}
            </Button>
          ) : undefined
        }
        primary={primary}
        // While paused the note says so in the bar's own quiet style; the notice above carries the warning (D-19).
        note={paused ? t('voter.status.paused') : undefined}
      />
    </VoterScreenFrame>
  )
}
