import { Alert } from '@chakra-ui/react'
import type { VotingProcessQuestion } from '@vocdoni/api-types'
import { BallotType, questionSelectionRange, tryInferQuestionBallotType } from '@vocdoni/ballot'
import { ElectionQuestion, useQuestionsForm, useReactComponentsLocalize } from '@vocdoni/react-components'
import type { TFunction } from 'i18next'
import type { ReactNode } from 'react'
import { useFormState } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Markdown } from '~components/ui/Markdown'
import { useVoterFlow } from '../flow-context'
import { textOf } from '../format'
import { approvalCap } from '../voter-flow'
import { QuestionErrorLine, questionTitleId } from '../voter-components'
import { ScreenHeading, ScreenHelp } from './ScreenParts'
import { VoterDescription } from './VoterDescription'

/** "Tria una resposta.", "Tria entre 1 i 2 opcions."…: how to answer, from the question's ballot type. */
const helpFor = (t: TFunction, question: VotingProcessQuestion): string => {
  const type = tryInferQuestionBallotType(question as Parameters<typeof tryInferQuestionBallotType>[0])
  if (type === undefined) return ''
  if (type === BallotType.Ranked) return t('voter.question.help_ranked')
  if (type === BallotType.Approval) {
    const cap = approvalCap(question as Parameters<typeof approvalCap>[0])
    return cap === undefined ? t('voter.question.help_approval') : t('voter.question.help_approval_cap', { count: cap })
  }
  if (type !== BallotType.MultiChoice) return t('voter.question.help_single')
  const { min, max } = questionSelectionRange(question as Parameters<typeof questionSelectionRange>[0])
  if (min === max) return t('voter.question.help_exact', { count: max })
  // "Tria fins a N" only when nothing is a valid answer (a blank vote); otherwise both ends ("Tria entre 1 i 5").
  if (min === 0) return t('voter.question.help_multiple', { count: max })
  return t('voter.question.help_range', { min, max })
}

// The SDK's form errors that stop a cast, unlike its selection checks (required, min, max, a ranking not finished),
// which the hint and the off "Continua" already say: a ballot type this app cannot cast, and a choice it cannot encode.
const castBlockers = new Set(['unsupported', 'encode'])

/**
 * A question as both modes draw it (boards V4VoterWide 4 to 6, V4VoterWideLive 2): the kicker, the title (the
 * screen's h1, focused after a screen change), its description, how to answer, and the SDK's fields through the
 * voter's slots, or the notice that replaces them (a vote on its way, a ballot type that cannot be cast).
 */
export const QuestionBody = ({ index, kicker, helpId }: { index: number; kicker?: ReactNode; helpId?: string }) => {
  const { t } = useTranslation()
  const localize = useReactComponentsLocalize()
  const { election, moved, lockedNotice } = useVoterFlow()
  const question = election.questions[index]
  const notice = lockedNotice(question.id)
  const ballotType = tryInferQuestionBallotType(question as Parameters<typeof tryInferQuestionBallotType>[0])
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

  return (
    <>
      {kicker}
      <ScreenHeading focus={moved} id={questionTitleId(String(index))} mt={kicker ? { base: '0', lg: '2' } : '0'}>
        {textOf(question.title as Parameters<typeof textOf>[0])}
      </ScreenHeading>
      {description ? (
        // The vote's description look (`VoterMedia`); the help sits 10px below.
        <VoterDescription mt='2.5'>
          <Markdown>{description}</Markdown>
        </VoterDescription>
      ) : null}
      {help ? <ScreenHelp id={helpId}>{help}</ScreenHelp> : null}
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
    </>
  )
}
