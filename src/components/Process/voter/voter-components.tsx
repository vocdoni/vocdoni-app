import { Box, chakra, Text, useSlotRecipe, VisuallyHidden } from '@chakra-ui/react'
import {
  composeComponents,
  defineComponent,
  type ComponentsDefinition,
  type ComponentsPartialDefinition,
} from '@vocdoni/react-components'
import { BallotType, questionSelectionRange, tryInferQuestionBallotType } from '@vocdoni/ballot'
import { useEffect, useId, useRef, type ComponentProps, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Markdown } from '~components/ui/Markdown'
import { RankBadge } from '~components/ui/RankBadge'
import { uiScaffoldComponents } from '~theme/react-components'
import { ChoiceCard } from '~theme/react-components/election'
import { useVoterFlow } from './flow-context'
import { allowsBlankVote } from './voter-flow'

/** A question's error as the voter page draws it: under the options, in the error colour, announced. */
export const QuestionErrorLine = ({ children }: { children: ReactNode }) => (
  <Text as='p' textStyle='ballot-hint' color='status.error.fg' mt='3.5' role='alert'>
    {children}
  </Text>
)

/** The id of a question's heading on the voter page: its options group is labelled by it. */
export const questionTitleId = (index: string) => `voter-question-${index}-title`

type QuestionProps = ComponentProps<ComponentsDefinition['ElectionQuestion']>
type RankProps = ComponentProps<ComponentsDefinition['QuestionRankChoice']>

/** "1 of 2 chosen. You can leave it like this." or "1 left.": the board's hint under the options, from the flow's answer. */
const VoterHint = ({ question, index }: Pick<QuestionProps, 'question' | 'index'>) => {
  const { t } = useTranslation()
  const { state } = useVoterFlow()
  const answer = state.answers[index]
  const values = Array.isArray(answer) ? answer.filter((value) => value !== '') : []
  const type = tryInferQuestionBallotType(question as Parameters<typeof tryInferQuestionBallotType>[0])
  let text = ''
  if (type === BallotType.MultiChoice && values.length > 0) {
    const { min, max } = questionSelectionRange(question as Parameters<typeof questionSelectionRange>[0])
    text = t('voter.question.chosen', { count: values.length, max })
    if (values.length >= min && values.length < max) text = `${text} ${t('voter.question.can_leave')}`
  } else if (type === BallotType.Ranked) {
    const missing = question.choices.length - values.length
    if (missing > 0) text = t('voter.question.missing', { count: missing })
  }
  if (!text) return null
  return (
    <Text as='p' textStyle='ballot-hint' color='fg.muted' mt='3.5' aria-live='polite'>
      {text}
    </Text>
  )
}

/** The blank vote row, a quiet option, for a multiple choice question that allows choosing nothing. */
const BlankVote = ({ question: _question, index }: Pick<QuestionProps, 'question' | 'index'>) => {
  const { t } = useTranslation()
  const { state, facts, chooseBlank } = useVoterFlow()
  const answer = state.answers[index]
  const chosen = Array.isArray(answer) && answer.length === 0
  const label = t('voter.question.blank')
  return (
    <ChoiceCard
      context='voter'
      quiet
      choice={{ title: { default: label }, value: -1 } as QuestionProps['question']['choices'][number]}
      value='blank'
      label={label}
      compact
      hasImage={false}
      canOpenImageModal={false}
      presentation='basic'
      selectionMode='multiple'
      controlType='checkbox'
      selected={chosen}
      disabled={!facts.isAbleToVote || facts.status !== 'ONGOING'}
      dataAttrs={{
        'data-choice-card': '',
        'data-choice-control': '',
        'data-choice-id-base': `question-${index}-choice-blank`,
      }}
      onSelect={(checked) => chooseBlank(Number(index), checked)}
    />
  )
}

/**
 * The voter page's slots (spec D4, audit F3). The review screen is the confirmation: `ConfirmShell` renders the
 * prompt bare while it is open and `QuestionsConfirmation` confirms once on mount, so the SDK's own `vote()` casts
 * with no dialog. The question, its options and its errors take the voter look; the dashboard preview, the summary
 * and the archive keep the app-wide slots, which this set is composed over.
 */
export const voterComponents: ComponentsPartialDefinition = {
  ConfirmShell: defineComponent<'ConfirmShell'>(({ isOpen, content }) => (isOpen ? <>{content}</> : null)),
  QuestionsConfirmation: defineComponent<'QuestionsConfirmation'>(({ onConfirm }) => {
    const confirmed = useRef(false)
    useEffect(() => {
      if (confirmed.current) return
      confirmed.current = true
      onConfirm()
    }, [onConfirm])
    return null
  }),
  // The screen draws the heading, the help and the description; the slot draws the options, labelled by the heading.
  ElectionQuestion: defineComponent<'ElectionQuestion'>(({ question, index, fields, selectionMode }) => {
    const styles = useSlotRecipe({ key: 'ElectionQuestions' })({ layout: 'voter' })
    return (
      <Box css={styles.container}>
        <Box
          role={selectionMode === 'single' ? 'radiogroup' : 'group'}
          aria-labelledby={questionTitleId(index)}
          css={styles.stack}
        >
          {fields}
          {allowsBlankVote(question) && <BlankVote question={question} index={index} />}
        </Box>
        <VoterHint question={question} index={index} />
      </Box>
    )
  }),
  QuestionChoice: defineComponent<'QuestionChoice'>((props) => <ChoiceCard {...props} context='voter' />),
  // Tap to rank (board V4VoterWide 6): an option takes the next free place, a second tap gives it back. The SDK's
  // ordering and its swap rule stay the SDK's: the slot only calls `onRank`. The button is named by what it shows
  // (the badge is hidden from assistive tech), and the place it holds or would take is its description: a name that
  // did not contain the visible label failed axe's label-content-name-mismatch.
  QuestionRankChoice: defineComponent<'QuestionRankChoice'>(
    ({ value, label, description, dataAttrs, position, options, disabled, onRank }: RankProps) => {
      const { t } = useTranslation()
      const placeId = useId()
      const styles = useSlotRecipe({ key: 'QuestionChoice' })({ layout: 'list', context: 'voter' })
      const ranked = position !== null && position !== undefined
      const nextFree = options.find((option) => !option.taken)?.position ?? options.length
      const shown = ranked ? position : nextFree
      return (
        <>
          <chakra.button
            type='button'
            css={styles.wrapper}
            w='full'
            textAlign='start'
            data-state={ranked ? 'checked' : 'unchecked'}
            data-disabled={disabled ? 'true' : undefined}
            data-choice-card={dataAttrs?.['data-choice-card']}
            data-choice-value={value}
            aria-pressed={ranked}
            aria-describedby={placeId}
            disabled={disabled}
            onClick={() => onRank(ranked ? null : shown)}
          >
            <RankBadge value={String(shown)} set={ranked} />
            <Box data-choice-body={dataAttrs?.['data-choice-body']}>
              <Text css={styles.label} data-choice-label=''>
                {label}
              </Text>
              {description ? (
                <Box css={styles.description}>
                  <Markdown>{description}</Markdown>
                </Box>
              ) : null}
            </Box>
          </chakra.button>
          {/* Out of the button, so it is not read twice as part of its name; out of the flow, so the column's gap
              ignores it. */}
          <VisuallyHidden id={placeId}>
            {ranked
              ? t('voter.question.rank_position', { position: shown, total: options.length })
              : t('voter.question.rank_unranked', { position: shown })}
          </VisuallyHidden>
        </>
      )
    }
  ),
  // A question's field validation says nothing here: the hint and the off "Continua" already do. The SDK's locked
  // question notices come through this slot as `variant='field'` too, but carry the question's id, so they stay. The
  // unsupported-question notice and a choice that cannot be encoded arrive with the same props as a selection check,
  // so the question screen shows those itself, from the form error's type (`QuestionScreen`).
  QuestionsError: defineComponent<'QuestionsError'>(({ error, variant, ...props }) => {
    const locked = 'data-question-id' in props
    if (variant === 'field' && !locked) return null
    return <QuestionErrorLine>{error}</QuestionErrorLine>
  }),
}

/** The voter page's `ComponentsProvider` set: the app's slots with the voter's over them (a nested provider does not merge). */
export const VOTER_COMPONENTS = composeComponents(uiScaffoldComponents, voterComponents)
