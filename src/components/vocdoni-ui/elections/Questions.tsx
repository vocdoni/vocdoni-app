import {
  Alert,
  Box,
  Button,
  chakra,
  Checkbox,
  CloseButton,
  Dialog,
  Field,
  RadioGroup,
  Skeleton,
  Stack,
  Text,
  Tooltip,
  useDisclosure,
  useSlotRecipe,
} from '@chakra-ui/react'
import { useClient, useElection } from '@vocdoni/react-providers'
import { ElectionResultsTypeNames, ElectionStatus, PublishedElection, type IChoice, type IQuestion } from '@vocdoni/sdk'
import { createContext, useContext, useEffect, useState, type ComponentProps, type ReactNode } from 'react'
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useConfirm } from '../confirm/useConfirm'
import { environment } from '../environment'

type QuestionsFormContextState = {
  fmethods: ReturnType<typeof useForm>
  vote: (values: Record<string, any>) => Promise<false | void>
}

type QuestionLayout = 'list' | 'grid'

const QuestionsFormContext = createContext<QuestionsFormContextState | undefined>(undefined)

export const useQuestionsForm = () => {
  const context = useContext(QuestionsFormContext)
  if (!context) {
    throw new Error('useQuestionsForm must be used within a QuestionsFormProvider')
  }
  return context
}

export type QuestionsFormProviderProps = {
  confirmContents?: (election: PublishedElection, answers: Record<string, any>) => ReactNode
}

export const QuestionsFormProvider = ({
  confirmContents,
  children,
}: QuestionsFormProviderProps & { children: ReactNode }) => {
  const fmethods = useForm()
  const { confirm } = useConfirm()
  const { election, client, vote: baseVote, connected } = useElection()

  const vote = async (values: Record<string, any>) => {
    if (!election || !(election instanceof PublishedElection)) {
      console.warn('vote attempt with no valid election defined')
      return false
    }
    if (
      client.wallet &&
      !(await confirm(
        typeof confirmContents === 'function' ? (
          confirmContents(election, values)
        ) : (
          <QuestionsConfirmation election={election} answers={values} />
        )
      ))
    ) {
      return false
    }
    let results: number[] = []
    switch (election.resultsType.name) {
      case ElectionResultsTypeNames.SINGLE_CHOICE_MULTIQUESTION:
        results = election.questions.map((_, k) => parseInt(values[k.toString()], 10))
        break
      case ElectionResultsTypeNames.MULTIPLE_CHOICE: {
        const selected = Object.values(values).pop() as string[]
        results = selected.map((v) => parseInt(v, 10))
        if (
          results.includes(-1) ||
          (election.resultsType.properties.canAbstain && (!values || results.length < election.voteType.maxCount))
        ) {
          if (results.includes(-1)) {
            results.splice(results.indexOf(-1), 1)
          }
          let abs = 0
          while (results.length < (election.voteType.maxCount || 1)) {
            results.push(parseInt(election.resultsType.properties.abstainValues[abs++], 10))
          }
        }
        break
      }
      case ElectionResultsTypeNames.APPROVAL:
        results = election.questions[0].choices.map((_choice, k) => (values[0].includes(k.toString()) ? 1 : 0))
        break
      default:
        throw new Error('Unknown or invalid election type')
    }
    return baseVote(results)
  }

  useEffect(() => {
    if (connected || !election || !(election instanceof PublishedElection) || !election?.questions) return
    fmethods.reset({
      ...election.questions.reduce((acc, _question, index) => ({ ...acc, [index]: '' }), {}),
    })
  }, [election, fmethods, connected])

  return (
    <FormProvider {...fmethods}>
      <QuestionsFormContext.Provider value={{ fmethods, vote }}>{children}</QuestionsFormContext.Provider>
    </FormProvider>
  )
}

export const QuestionTip = () => {
  const recipe = useSlotRecipe({ key: 'QuestionsTip' })
  const styles = recipe()
  const {
    fmethods: { getValues },
  } = useQuestionsForm()
  const { election, localize } = useElection()
  if (!election || !(election instanceof PublishedElection)) return null
  let txt = ''
  switch (election?.resultsType.name) {
    case ElectionResultsTypeNames.MULTIPLE_CHOICE:
      txt = localize('question_types.multichoice_desc', {
        selected: getValues()[0]?.length,
        maxcount: election.voteType.maxCount,
      })
      if (election.resultsType.properties.canAbstain) {
        txt += localize('question_types.multichoice_desc_abstain')
      }
      break
    default:
      return null
  }
  return (
    <chakra.div css={styles.wrapper}>
      <chakra.div css={styles.text}>{txt}</chakra.div>
    </chakra.div>
  )
}

export const QuestionChoice = ({
  choice,
  layout,
  renderImage = true,
  ...rest
}: { choice: IChoice; layout?: QuestionLayout; renderImage?: boolean } & ComponentProps<typeof Stack>) => {
  const recipe = useSlotRecipe({ key: 'QuestionChoice' })
  const styles = recipe({ context: 'content' })
  const { image } = choice.meta ?? {}
  const hasImage = !!image && !!image.default

  return (
    <Stack css={styles.wrapper} data-layout={layout} data-no-image={hasImage ? undefined : ''} {...rest}>
      {renderImage && hasImage && <QuestionChoiceMedia choice={choice} />}
      <QuestionChoiceBody choice={choice} />
    </Stack>
  )
}

const QuestionChoiceBody = ({
  choice,
  compact,
  renderLabel = true,
  renderDescription = true,
}: {
  choice: IChoice
  compact?: boolean
  renderLabel?: boolean
  renderDescription?: boolean
}) => {
  const recipe = useSlotRecipe({ key: 'QuestionChoice' })
  const styles = recipe({ context: 'content' })
  const label = choice.title.default
  const { description } = choice.meta ?? {}

  return (
    <Box data-choice-body data-compact={compact ? '' : undefined}>
      {renderLabel && <Text css={styles.label}>{label}</Text>}
      {renderDescription && description && (
        <Box css={styles.description}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{description}</ReactMarkdown>
        </Box>
      )}
    </Box>
  )
}

const QuestionChoiceMedia = ({ choice }: { choice: IChoice }) => {
  const recipe = useSlotRecipe({ key: 'QuestionChoice' })
  const styles = recipe({ context: 'content' })
  const { open: isOpen, onOpen, onClose } = useDisclosure()
  const [loaded, setLoaded] = useState(false)
  const [loadedModal, setLoadedModal] = useState(false)
  const label = choice.title.default
  const { image } = choice.meta ?? {}
  const hasImage = !!image && !!image.default
  const renderModal = !!image && image.default && image.thumbnail

  if (!hasImage) return null

  return (
    <>
      <Skeleton loading={!loaded} css={styles.skeleton} data-choice-media>
        <chakra.img
          onClick={(event) => {
            if (!renderModal) return
            event.preventDefault()
            onOpen()
          }}
          css={styles.image}
          src={image.thumbnail ?? image.default}
          alt={label}
          onLoad={() => setLoaded(true)}
        />
      </Skeleton>
      {renderModal && (
        <Dialog.Root open={isOpen} onOpenChange={({ open }) => (open ? onOpen() : onClose())}>
          <Dialog.Backdrop css={styles.modalOverlay} />
          <Dialog.Positioner>
            <Dialog.Content css={styles.modalContent}>
              <Dialog.CloseTrigger asChild>
                <CloseButton css={styles.modalClose} />
              </Dialog.CloseTrigger>
              <Dialog.Body css={styles.modalBody}>
                <Skeleton loading={!loadedModal} css={styles.skeletonModal}>
                  <chakra.img
                    src={image.default}
                    alt={label}
                    css={styles.modalImage}
                    onLoad={() => setLoadedModal(true)}
                  />
                </Skeleton>
                <Text css={styles.modalLabel}>{label}</Text>
                <QuestionChoiceBody choice={choice} renderLabel={false} />
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      )}
    </>
  )
}

export const QuestionsConfirmation = ({
  answers,
  election,
  ...rest
}: {
  answers: Record<string, any>
  election: PublishedElection
}) => {
  const modalRecipe = useSlotRecipe({ key: 'ConfirmModal' })
  const questionsRecipe = useSlotRecipe({ key: 'QuestionsConfirmation' })
  const mstyles = modalRecipe()
  const styles = questionsRecipe()
  const { cancel, proceed } = useConfirm()
  const { localize } = useClient()

  return (
    <>
      <Dialog.Header css={mstyles.header}>{localize('confirm.title')}</Dialog.Header>
      <Dialog.CloseTrigger asChild>
        <CloseButton css={mstyles.close} />
      </Dialog.CloseTrigger>
      <Dialog.Body css={mstyles.body}>
        <Box css={styles.box} {...rest}>
          <Text css={styles.description}>{localize('vote.confirm')}</Text>
          {election.questions.map((question, k) => {
            if (election.resultsType.name === ElectionResultsTypeNames.SINGLE_CHOICE_MULTIQUESTION) {
              const choice = question.choices.find((v) => v.value === parseInt(answers[k.toString()], 10))
              return (
                <chakra.div css={styles.question} key={k}>
                  <chakra.div css={styles.title}>{question.title.default}</chakra.div>
                  <chakra.div css={styles.answer}>{choice?.title.default}</chakra.div>
                </chakra.div>
              )
            }
            const choices = (answers[0] || ['-1'])
              .map((answer: string) =>
                question.choices[Number(answer)]
                  ? question.choices[Number(answer)].title.default
                  : localize('vote.abstain')
              )
              .map((choice) => (
                <span key={choice}>
                  - {choice}
                  <br />
                </span>
              ))
            return (
              <chakra.div css={styles.question} key={k}>
                <chakra.div css={styles.title}>{question.title.default}</chakra.div>
                <chakra.div css={styles.answer}>{choices}</chakra.div>
              </chakra.div>
            )
          })}
        </Box>
      </Dialog.Body>
      <Dialog.Footer css={mstyles.footer}>
        <Button onClick={cancel ?? undefined} variant='ghost' css={mstyles.cancel}>
          {localize('confirm.cancel')}
        </Button>
        <Button onClick={proceed ?? undefined} css={mstyles.confirm}>
          {localize('confirm.confirm')}
        </Button>
      </Dialog.Footer>
    </>
  )
}

export const ElectionQuestion = ({ question, index }: { question: IQuestion; index: string }) => {
  const recipe = useSlotRecipe({ key: 'ElectionQuestions' })
  const layout = getQuestionLayout(question)
  const styles = recipe({ layout })
  const {
    formState: { errors },
  } = useFormContext()

  return (
    <chakra.div css={styles.container}>
      <Field.Root invalid={Boolean((errors as Record<string, any>)[index])}>
        <chakra.div css={styles.header}>
          <chakra.label css={styles.title}>{question.title.default}</chakra.label>
        </chakra.div>
        <chakra.div css={styles.body}>
          {question.description && (
            <chakra.div css={styles.description}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{question.description.default}</ReactMarkdown>
            </chakra.div>
          )}
          <FieldSwitcher index={index} question={question} layout={layout} />
          <QuestionTip />
        </chakra.div>
      </Field.Root>
    </chakra.div>
  )
}

const getQuestionLayout = (question: IQuestion): QuestionLayout =>
  question.choices.some((choice) => Boolean(choice.meta?.image?.default)) ? 'grid' : 'list'

const FieldSwitcher = (props: { question: IQuestion; index: string; layout: QuestionLayout }) => {
  const { election } = useElection()
  if (!(election instanceof PublishedElection)) return null
  switch (election?.resultsType.name) {
    case ElectionResultsTypeNames.MULTIPLE_CHOICE:
      return <MultiChoice {...props} />
    case ElectionResultsTypeNames.APPROVAL:
      return <ApprovalChoice {...props} />
    case ElectionResultsTypeNames.SINGLE_CHOICE_MULTIQUESTION:
    default:
      return <SingleChoice {...props} />
  }
}

const MultiChoice = ({ index, question, layout }: { index: string; question: IQuestion; layout: QuestionLayout }) => {
  const recipe = useSlotRecipe({ key: 'ElectionQuestions' })
  const choiceRecipe = useSlotRecipe({ key: 'QuestionChoice' })
  const styles = recipe({ layout })
  const cardStyles = choiceRecipe({ context: 'card', layout })
  const {
    election,
    isAbleToVote,
    loading: { voting },
    localize,
  } = useElection()
  const { control, trigger, watch } = useFormContext()
  const values = watch(index) || []

  if (!(election instanceof PublishedElection)) return null
  if (!(election && election.resultsType.name === ElectionResultsTypeNames.MULTIPLE_CHOICE)) return null

  const isNotAbleToVote = election.status !== ElectionStatus.ONGOING || !isAbleToVote || voting
  const choices = [...question.choices]
  const canAbstain = election.resultsType.properties.canAbstain
  const shouldRenderAbstain = canAbstain && !election.get('questions.hideAbstain')
  if (canAbstain && shouldRenderAbstain) {
    choices.push({
      title: { default: localize('vote.abstain') },
      value: -1,
    } as IChoice)
  }

  return (
    <Stack css={styles.stack} display={layout === 'grid' ? 'grid' : undefined}>
      <Controller
        control={control}
        disabled={isNotAbleToVote}
        rules={{
          validate: (value) => {
            if (!shouldRenderAbstain || (value && value.includes('-1') && value.length < election.voteType.maxCount)) {
              return true
            }
            return (
              (value && value.length === election.voteType.maxCount) ||
              localize('validation.choices_count', { count: election.voteType.maxCount })
            )
          },
        }}
        name={index}
        render={({ field: { onChange, ...restField }, fieldState: { error } }) => {
          const currentValues = values || []
          return (
            <>
              {choices.map((choice, ck) => {
                const value = choice.value.toString()
                const maxSelected = currentValues.length >= election.voteType.maxCount && !currentValues.includes(value)
                const checked = currentValues.includes(value)
                const hasImage = Boolean(choice.meta?.image?.default)
                const isCompact = !hasImage && layout === 'list'
                const idBase = `question-${index}-choice-${value}`
                return (
                  <Checkbox.Root
                    {...restField}
                    key={ck}
                    ids={{
                      root: `${idBase}-root`,
                      hiddenInput: `${idBase}-input`,
                      control: `${idBase}-control`,
                      label: `${idBase}-label`,
                    }}
                    css={cardStyles.wrapper}
                    data-choice-card
                    data-layout={layout}
                    checked={checked}
                    disabled={isNotAbleToVote || maxSelected}
                    onCheckedChange={(details) => {
                      const isChecked = Boolean(details.checked)
                      if (isChecked) {
                        if (maxSelected) return
                        onChange([...values, value])
                      } else {
                        onChange(values.filter((v: string) => v !== value))
                      }
                      trigger(index)
                    }}
                  >
                    <Checkbox.HiddenInput value={value} />
                    <Checkbox.Control data-choice-control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    <QuestionChoiceMedia choice={choice} />
                    <Checkbox.Label as='div'>
                      <QuestionChoiceBody choice={choice} compact={isCompact} />
                    </Checkbox.Label>
                  </Checkbox.Root>
                )
              })}
              <Field.ErrorText css={styles.error}>{error?.message as string}</Field.ErrorText>
            </>
          )
        }}
      />
    </Stack>
  )
}

const ApprovalChoice = ({
  index,
  question,
  layout,
}: {
  index: string
  question: IQuestion
  layout: QuestionLayout
}) => {
  const recipe = useSlotRecipe({ key: 'ElectionQuestions' })
  const choiceRecipe = useSlotRecipe({ key: 'QuestionChoice' })
  const styles = recipe({ layout })
  const cardStyles = choiceRecipe({ context: 'card', layout })
  const {
    election,
    isAbleToVote,
    loading: { voting },
    localize,
  } = useElection()
  const { control, watch } = useFormContext()
  const values = watch(index) || []

  if (!(election instanceof PublishedElection)) return null
  if (!(election && election.resultsType.name === ElectionResultsTypeNames.APPROVAL)) return null

  const isNotAbleToVote = election.status !== ElectionStatus.ONGOING || !isAbleToVote || voting
  const choices = [...question.choices]

  return (
    <Stack css={styles.stack} display={layout === 'grid' ? 'grid' : undefined}>
      <Controller
        control={control}
        disabled={isNotAbleToVote}
        rules={{
          validate: (value) => (value && value.length > 0) || localize('validation.at_least_one'),
        }}
        name={index}
        render={({ field: { onChange, ...restField }, fieldState: { error } }) => (
          <>
            {choices.map((choice, ck) => {
              const value = choice.value.toString()
              const checked = values.includes(value)
              const hasImage = Boolean(choice.meta?.image?.default)
              const isCompact = !hasImage && layout === 'list'
              const idBase = `question-${index}-choice-${value}`
              return (
                <Checkbox.Root
                  {...restField}
                  key={ck}
                  ids={{
                    root: `${idBase}-root`,
                    hiddenInput: `${idBase}-input`,
                    control: `${idBase}-control`,
                    label: `${idBase}-label`,
                  }}
                  css={cardStyles.wrapper}
                  data-choice-card
                  data-layout={layout}
                  checked={checked}
                  disabled={isNotAbleToVote}
                  onCheckedChange={(details) => {
                    const isChecked = Boolean(details.checked)
                    if (isChecked) {
                      onChange([...values, value])
                    } else {
                      onChange(values.filter((v: string) => v !== value))
                    }
                  }}
                >
                  <Checkbox.HiddenInput value={value} />
                  <Checkbox.Control data-choice-control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <QuestionChoiceMedia choice={choice} />
                  <Checkbox.Label as='div'>
                    <QuestionChoiceBody choice={choice} compact={isCompact} />
                  </Checkbox.Label>
                </Checkbox.Root>
              )
            })}
            <Field.ErrorText css={styles.error}>{error?.message as string}</Field.ErrorText>
          </>
        )}
      />
    </Stack>
  )
}

const SingleChoice = ({ index, question, layout }: { index: string; question: IQuestion; layout: QuestionLayout }) => {
  const recipe = useSlotRecipe({ key: 'ElectionQuestions' })
  const choiceRecipe = useSlotRecipe({ key: 'QuestionChoice' })
  const styles = recipe({ layout })
  const cardStyles = choiceRecipe({ context: 'card', layout })
  const {
    election,
    isAbleToVote,
    loading: { voting },
    localize,
  } = useElection()
  const {
    formState: { errors },
    control,
  } = useFormContext()

  if (!(election instanceof PublishedElection)) return null
  const disabled = election.status !== ElectionStatus.ONGOING || !isAbleToVote || voting

  return (
    <Controller
      control={control}
      disabled={disabled}
      rules={{ required: localize('validation.required') }}
      name={index}
      render={({ field }) => (
        <RadioGroup.Root
          css={styles.radioGroup}
          value={field.value}
          onValueChange={({ value }) => field.onChange(value)}
          disabled={disabled}
        >
          <Stack direction='column' css={styles.stack} display={layout === 'grid' ? 'grid' : undefined}>
            {question.choices.map((choice, ck) => {
              const hasImage = Boolean(choice.meta?.image?.default)
              const isCompact = !hasImage && layout === 'list'
              return (
                <RadioGroup.Item
                  css={cardStyles.wrapper}
                  data-choice-card
                  data-layout={layout}
                  value={choice.value.toString()}
                  key={ck}
                >
                  <RadioGroup.ItemHiddenInput />
                  <RadioGroup.ItemIndicator data-choice-control />
                  <QuestionChoiceMedia choice={choice} />
                  <RadioGroup.ItemText as='span'>
                    <QuestionChoiceBody choice={choice} compact={isCompact} />
                  </RadioGroup.ItemText>
                </RadioGroup.Item>
              )
            })}
          </Stack>
          <Field.ErrorText css={styles.error}>{(errors as Record<string, any>)[index]?.message}</Field.ErrorText>
        </RadioGroup.Root>
      )}
    />
  )
}

export const QuestionsEmpty = () => {
  const recipe = useSlotRecipe({ key: 'QuestionsEmpty' })
  const styles = recipe()
  const { localize } = useElection()
  return (
    <Alert.Root variant='subtle' status='warning' css={styles.container}>
      <Alert.Indicator css={styles.icon} />
      <Alert.Description css={styles.description}>{localize('empty')}</Alert.Description>
    </Alert.Root>
  )
}

export const QuestionsTypeBadge = (props: ComponentProps<typeof chakra.div>) => {
  const recipe = useSlotRecipe({ key: 'QuestionsTypeBadge' })
  const styles = recipe()
  const { election, localize } = useElection()
  if (!election || !(election instanceof PublishedElection) || !election.census) {
    return null
  }
  const weighted =
    Number(election.census.weight) !== election.census.size ? localize('question_types.weighted_voting') : ''
  let title = ''
  let tooltip = ''
  switch (election?.resultsType.name) {
    case ElectionResultsTypeNames.SINGLE_CHOICE_MULTIQUESTION:
      title = localize('question_types.singlechoice_title', { weighted })
      break
    case ElectionResultsTypeNames.MULTIPLE_CHOICE:
      title = localize('question_types.multichoice_title', { weighted })
      tooltip = localize('question_types.multichoice_tooltip', { maxcount: election.voteType.maxCount })
      break
    case ElectionResultsTypeNames.APPROVAL:
      title = localize('question_types.approval_title')
      tooltip = localize('question_types.approval_tooltip', { maxcount: election.voteType.maxCount })
      break
    default:
      return null
  }
  return (
    <chakra.div css={styles.box} {...props}>
      <Tooltip.Root positioning={{ placement: 'top' }}>
        <Tooltip.Trigger asChild>
          <chakra.label css={styles.title}>{title}</chakra.label>
        </Tooltip.Trigger>
        <Tooltip.Positioner>
          <Tooltip.Content css={styles.tooltip}>
            {tooltip}
            <Tooltip.Arrow>
              <Tooltip.ArrowTip />
            </Tooltip.Arrow>
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Tooltip.Root>
    </chakra.div>
  )
}

export const Voted = () => {
  const { env } = useClient()
  const { localize, voted } = useElection()
  const recipe = useSlotRecipe({ key: 'Voted' })
  const styles = recipe()
  if (!voted) {
    return null
  }

  const description = localize('vote.voted_description', { id: voted })
  const parts = voted ? description.split(voted) : [description]
  const descriptionContent =
    parts.length > 1
      ? parts.reduce<ReactNode[]>((acc, part, idx) => {
          acc.push(part)
          if (idx < parts.length - 1) {
            acc.push(
              <chakra.a key={`link-${idx}`} href={environment.verifyVote(env, voted)} target='_blank' css={styles.link}>
                {voted}
              </chakra.a>
            )
          }
          return acc
        }, [])
      : description

  return (
    <Alert.Root
      variant='subtle'
      alignItems='center'
      justifyContent='center'
      textAlign='center'
      status='success'
      flexDir='column'
      css={styles.container}
    >
      <Alert.Indicator css={styles.icon} />
      <Alert.Title css={styles.title}>{localize('vote.voted_title')}</Alert.Title>
      <Alert.Description truncate maxW='100%' whiteSpace='initial' css={styles.description}>
        {descriptionContent}
      </Alert.Description>
    </Alert.Root>
  )
}

export type ElectionQuestionsProps = ComponentProps<typeof chakra.div> & QuestionsFormProviderProps

export const ElectionQuestions = ({ confirmContents, ...props }: ElectionQuestionsProps) => (
  <QuestionsFormProvider confirmContents={confirmContents}>
    <ElectionQuestionsForm {...props} />
  </QuestionsFormProvider>
)

export const ElectionQuestionsForm = ({
  onInvalid,
  ...rest
}: ComponentProps<typeof chakra.div> & { onInvalid?: (errors: any) => void }) => {
  const { election } = useElection()
  const recipe = useSlotRecipe({ key: 'ElectionQuestions' })
  const styles = recipe()
  if (!(election instanceof PublishedElection)) return null
  return (
    <chakra.div css={styles.wrapper} {...rest}>
      <QuestionsFormContents onInvalid={onInvalid} />
    </chakra.div>
  )
}

const QuestionsFormContents = ({ onInvalid }: { onInvalid?: (errors: any) => void }) => {
  const {
    election,
    voted,
    errors: { voting: error },
    isAbleToVote,
  } = useElection()
  const { fmethods, vote } = useQuestionsForm()
  if (!(election instanceof PublishedElection)) {
    return null
  }
  const questions = election.questions

  if (voted && !isAbleToVote) {
    return <Voted />
  }
  if (!questions || (questions && !questions.length)) {
    return <QuestionsEmpty />
  }
  return (
    <form onSubmit={fmethods.handleSubmit(vote, onInvalid)} id={`election-questions-${election?.id}`}>
      <Voted />
      {questions.map((question, qk) => (
        <ElectionQuestion key={qk} index={qk.toString()} question={question} />
      ))}
      {error && (
        <Alert.Root status='error' variant='solid' mb={3}>
          <Alert.Indicator />
          {error}
        </Alert.Root>
      )}
    </form>
  )
}
