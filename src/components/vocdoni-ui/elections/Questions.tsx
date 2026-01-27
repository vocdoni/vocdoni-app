import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Checkbox,
  chakra,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Skeleton,
  Stack,
  Text,
  Tooltip,
  useDisclosure,
  useMultiStyleConfig,
} from '@chakra-ui/react'
import { useClient, useElection } from '@vocdoni/react-providers'
import {
  ElectionResultsTypeNames,
  ElectionStatus,
  type IChoice,
  type IQuestion,
  PublishedElection,
} from '@vocdoni/sdk'
import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react'
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useConfirm } from '../confirm/useConfirm'
import { environment } from '../environment'

type QuestionsFormContextState = {
  fmethods: ReturnType<typeof useForm>
  vote: (values: Record<string, any>) => Promise<false | void>
}

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

export const QuestionsFormProvider = ({ confirmContents, children }: QuestionsFormProviderProps & { children: ReactNode }) => {
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
        typeof confirmContents === 'function'
          ? confirmContents(election, values)
          : ( <QuestionsConfirmation election={election} answers={values} /> )
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
  const styles = useMultiStyleConfig('QuestionsTip')
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
    <chakra.div __css={styles.wrapper}>
      <chakra.div __css={styles.text}>{txt}</chakra.div>
    </chakra.div>
  )
}

export const QuestionChoice = ({ choice, ...rest }: { choice: IChoice } & ComponentProps<typeof Stack>) => {
  const styles = useMultiStyleConfig('QuestionChoice')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [loaded, setLoaded] = useState(false)
  const [loadedModal, setLoadedModal] = useState(false)
  const label = choice.title.default
  const { image, description } = choice.meta ?? {}
  const renderImage = !!image && !!image.default
  const renderModal = !!image && image.default && image.thumbnail

  return (
    <Stack sx={styles.wrapper} {...rest}>
      {renderImage && (
        <Skeleton isLoaded={loaded} sx={styles.skeleton}>
          <Box
            as='img'
            onClick={(event) => {
              if (!renderModal) return
              event.preventDefault()
              onOpen()
            }}
            sx={styles.image}
            src={image.thumbnail ?? image.default}
            alt={label}
            onLoad={() => setLoaded(true)}
          />
        </Skeleton>
      )}
      <Text sx={styles.label}>{label}</Text>
      {description && (
        <Box sx={styles.description}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{description}</ReactMarkdown>
        </Box>
      )}
      {renderModal && (
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay sx={styles.modalOverlay} />
          <ModalContent sx={styles.modalContent}>
            <ModalCloseButton sx={styles.modalClose} />
            <ModalBody sx={styles.modalBody}>
              {renderImage && (
                <Skeleton isLoaded={loadedModal} sx={styles.skeletonModal}>
                  <Box
                    as='img'
                    src={image.default}
                    alt={label}
                    sx={styles.modalImage}
                    onLoad={() => setLoadedModal(true)}
                  />
                </Skeleton>
              )}
              <Text sx={styles.modalLabel}>{label}</Text>
              {description && (
                <Box sx={styles.modalDescription}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{description}</ReactMarkdown>
                </Box>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Stack>
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
  const mstyles = useMultiStyleConfig('ConfirmModal')
  const styles = useMultiStyleConfig('QuestionsConfirmation', rest)
  const { cancel, proceed } = useConfirm()
  const { localize } = useClient()

  return (
    <>
      <ModalHeader sx={mstyles.header}>{localize('confirm.title')}</ModalHeader>
      <ModalCloseButton sx={mstyles.close} />
      <ModalBody sx={mstyles.body}>
        <Box sx={styles.box} {...rest}>
          <Text sx={styles.description}>{localize('vote.confirm')}</Text>
          {election.questions.map((question, k) => {
            if (election.resultsType.name === ElectionResultsTypeNames.SINGLE_CHOICE_MULTIQUESTION) {
              const choice = question.choices.find((v) => v.value === parseInt(answers[k.toString()], 10))
              return (
                <chakra.div __css={styles.question} key={k}>
                  <chakra.div __css={styles.title}>{question.title.default}</chakra.div>
                  <chakra.div __css={styles.answer}>{choice?.title.default}</chakra.div>
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
              <chakra.div __css={styles.question} key={k}>
                <chakra.div __css={styles.title}>{question.title.default}</chakra.div>
                <chakra.div __css={styles.answer}>{choices}</chakra.div>
              </chakra.div>
            )
          })}
        </Box>
      </ModalBody>
      <ModalFooter sx={mstyles.footer}>
        <Button onClick={cancel ?? undefined} variant='ghost' sx={mstyles.cancel}>
          {localize('confirm.cancel')}
        </Button>
        <Button onClick={proceed ?? undefined} sx={mstyles.confirm}>
          {localize('confirm.confirm')}
        </Button>
      </ModalFooter>
    </>
  )
}

export const ElectionQuestion = ({ question, index }: { question: IQuestion; index: string }) => {
  const styles = useMultiStyleConfig('ElectionQuestions')
  const {
    formState: { errors },
  } = useFormContext()

  return (
    <chakra.div __css={styles.container}>
      <FormControl isInvalid={Boolean((errors as Record<string, any>)[index])}>
        <chakra.div __css={styles.header}>
          <chakra.label __css={styles.title}>{question.title.default}</chakra.label>
        </chakra.div>
        <chakra.div __css={styles.body}>
          {question.description && (
            <chakra.div __css={styles.description}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{question.description.default}</ReactMarkdown>
            </chakra.div>
          )}
          <FieldSwitcher index={index} question={question} />
          <QuestionTip />
        </chakra.div>
      </FormControl>
    </chakra.div>
  )
}

const FieldSwitcher = (props: { question: IQuestion; index: string }) => {
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

const MultiChoice = ({ index, question }: { index: string; question: IQuestion }) => {
  const styles = useMultiStyleConfig('ElectionQuestions')
  const {
    election,
    isAbleToVote,
    loading: { voting },
    localize,
  } = useElection()
  const { control, trigger, watch, getValues } = useFormContext()
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
    <Stack sx={styles.stack}>
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
          const currentValues = getValues(index) || []
          return (
            <>
              {choices.map((choice, ck) => {
                const maxSelected = currentValues.length >= election.voteType.maxCount && !currentValues.includes(choice.value.toString())
                return createElement(
                  Checkbox,
                  {
                    ...restField,
                    key: ck,
                    sx: styles.checkbox,
                    value: choice.value.toString(),
                    isDisabled: isNotAbleToVote || maxSelected,
                    isChecked: currentValues.includes(choice.value.toString()),
                    onChange: (event) => {
                      if (values.includes(event.target.value)) {
                        onChange(values.filter((v: string) => v !== event.target.value))
                      } else {
                        if (maxSelected) return
                        onChange([...values, event.target.value])
                      }
                      trigger(index)
                    },
                  },
                  <QuestionChoice choice={choice} />
                )
              })}
              <FormErrorMessage sx={styles.error}>{error?.message as string}</FormErrorMessage>
            </>
          )
        }}
      />
    </Stack>
  )
}

const ApprovalChoice = ({ index, question }: { index: string; question: IQuestion }) => {
  const styles = useMultiStyleConfig('ElectionQuestions')
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
    <Stack sx={styles.stack}>
      <Controller
        control={control}
        disabled={isNotAbleToVote}
        rules={{
          validate: (value) => value && value.length > 0 || localize('validation.at_least_one'),
        }}
        name={index}
        render={({ field: { onChange, ...restField }, fieldState: { error } }) => (
          <>
            {choices.map((choice, ck) =>
              createElement(
                Checkbox,
                {
                  ...restField,
                  key: ck,
                  sx: styles.checkbox,
                  value: choice.value.toString(),
                  isDisabled: isNotAbleToVote,
                  onChange: (event) => {
                    if (values.includes(event.target.value)) {
                      onChange(values.filter((v: string) => v !== event.target.value))
                    } else {
                      onChange([...values, event.target.value])
                    }
                  },
                },
                <QuestionChoice choice={choice} />
              )
            )}
            <FormErrorMessage sx={styles.error}>{error?.message as string}</FormErrorMessage>
          </>
        )}
      />
    </Stack>
  )
}

const SingleChoice = ({ index, question }: { index: string; question: IQuestion }) => {
  const styles = useMultiStyleConfig('ElectionQuestions')
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
        <RadioGroup sx={styles.radioGroup} {...field} isDisabled={disabled}>
          <Stack direction='column' sx={styles.stack}>
            {question.choices.map((choice, ck) => (
              <Radio sx={styles.radio} value={choice.value.toString()} key={ck}>
                <QuestionChoice choice={choice} />
              </Radio>
            ))}
          </Stack>
          <FormErrorMessage sx={styles.error}>{(errors as Record<string, any>)[index]?.message}</FormErrorMessage>
        </RadioGroup>
      )}
    />
  )
}

export const QuestionsEmpty = () => {
  const styles = useMultiStyleConfig('QuestionsEmpty')
  const { localize } = useElection()
  return (
    <Alert variant='subtle' status='warning' sx={styles.container}>
      <AlertIcon sx={styles.icon} />
      <AlertDescription sx={styles.description}>{localize('empty')}</AlertDescription>
    </Alert>
  )
}

export const QuestionsTypeBadge = (props: ComponentProps<typeof chakra.div>) => {
  const styles = useMultiStyleConfig('QuestionsTypeBadge')
  const { election, localize } = useElection()
  if (!election || !(election instanceof PublishedElection) || !election.census) {
    return null
  }
  const weighted = Number(election.census.weight) !== election.census.size ? localize('question_types.weighted_voting') : ''
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
    <chakra.div __css={styles.box} {...props}>
      <Tooltip label={tooltip} hasArrow placement='auto' sx={styles.tooltip}>
        <chakra.label __css={styles.title}>{title}</chakra.label>
      </Tooltip>
    </chakra.div>
  )
}

export const Voted = () => {
  const { env } = useClient()
  const { localize, voted } = useElection()
  const styles = useMultiStyleConfig('Voted')
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
              <chakra.a
                key={`link-${idx}`}
                href={environment.verifyVote(env, voted)}
                target='_blank'
                __css={styles.link}
              >
                {voted}
              </chakra.a>
            )
          }
          return acc
        }, [])
      : description

  return (
    <Alert
      variant='subtle'
      alignItems='center'
      justifyContent='center'
      textAlign='center'
      status='success'
      flexDir='column'
      isTruncated
      sx={styles.container}
    >
      <AlertIcon sx={styles.icon} />
      <AlertTitle sx={styles.title}>{localize('vote.voted_title')}</AlertTitle>
      <AlertDescription isTruncated maxW='100%' whiteSpace='initial' sx={styles.description}>
        {descriptionContent}
      </AlertDescription>
    </Alert>
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
  const styles = useMultiStyleConfig('ElectionQuestions')
  if (!(election instanceof PublishedElection)) return null
  return (
    <chakra.div __css={styles.wrapper} {...rest}>
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
  const questions = election?.questions

  if (voted && !isAbleToVote) {
    return <Voted />
  }
  if (!questions || (questions && !questions.length)) {
    return <QuestionsEmpty />
  }
  return (
    <form onSubmit={fmethods.handleSubmit(vote, onInvalid)} id={`election-questions-${election?.id}`}>
      <Voted />
      <QuestionsTypeBadge />
      {questions.map((question, qk) => (
        <ElectionQuestion key={qk} index={qk.toString()} question={question} />
      ))}
      {error && (
        <Alert status='error' variant='solid' mb={3}>
          <AlertIcon />
          {error}
        </Alert>
      )}
    </form>
  )
}
