import {
  Alert,
  type AlertRootProps,
  Box,
  type BoxProps,
  Button,
  type ButtonProps,
  Card,
  chakra,
  Checkbox,
  Dialog,
  Field,
  Flex,
  type FlexProps,
  Heading,
  type HeadingProps,
  Icon,
  Image,
  type ImageProps,
  NativeSelect,
  Progress,
  Skeleton,
  Text,
  type RecipeVariantProps,
  type TextProps,
  useRecipe,
  useSlotRecipe,
} from '@chakra-ui/react'
import { CloseButton } from '~components/ui/CloseButton'
import {
  type ComponentsPartialDefinition,
  defineComponent,
  getElectionTitle,
  linkifyIpfs,
  useElection,
} from '@vocdoni/react-components'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckIcon } from '~theme/icons'
import { ConfirmDialogContent } from '~components/ui/ConfirmDialog'
import { Markdown } from '~components/ui/Markdown'
import { StatusBadge, type StatusBadgeProps } from '~components/ui/StatusBadge'
import { ElectionTitle as electionTitleRecipe } from '~theme/recipes/election'

type ElectionTitleVariantProps = RecipeVariantProps<typeof electionTitleRecipe>

// A literal style prop next to a spread of all the style props overflows TypeScript (TS2590), so it is typed once and spread.
const hrStyle: BoxProps = { as: 'hr', borderColor: 'border' }
const questionsErrorStyle: TextProps = { color: 'ballot.error' }
// The ballot's one filled action is taller than the dashboard buttons (`xl` is 48px, Fil's voter button 52px); the
// button recipe is not touched, so the extra look is set here. `control.floating` is the 52px size token.
const ballotAction: ButtonProps = {
  size: 'xl',
  h: 'control.floating',
  minH: 'control.floating',
  borderRadius: 'xl',
  fontSize: 'ballot.option',
  fontWeight: 'semibold',
}

// A result's tally as a number (the SDK hands it over as a string, possibly with separators). NaN when there is none.
const tally = (votes?: string) => Number((votes ?? '').replace(/[^\d.]/g, ''))

// The index of the one choice with the most votes, or -1 on a tie at the top, no votes or no tally.
const clearLeader = (choices: { votes?: string }[]) => {
  const counts = choices.map((choice) => tally(choice.votes))
  const top = Math.max(...counts)
  if (!(top > 0)) return -1
  return counts.filter((count) => count === top).length === 1 ? counts.indexOf(top) : -1
}

const markdown = (value?: string) => (value ? <Markdown>{value}</Markdown> : null)

export const electionComponents: ComponentsPartialDefinition = {
  HR: defineComponent<'HR', BoxProps>((props) => <Box {...hrStyle} {...(props as BoxProps)} />),
  ElectionTitle: defineComponent<'ElectionTitle', Omit<HeadingProps, 'size'> & ElectionTitleVariantProps>(
    ({ title, size, ...props }) => {
      const recipe = useRecipe({ recipe: electionTitleRecipe })
      const styles = recipe({ size })
      return (
        <Heading as='h1' css={styles} {...props}>
          {title}
        </Heading>
      )
    }
  ),
  ElectionDescription: defineComponent<'ElectionDescription', BoxProps>(({ description, ...props }) => {
    const recipe = useRecipe({ key: 'ElectionDescription' })
    const styles = recipe()
    return (
      <Box css={styles} {...props}>
        {markdown(description)}
      </Box>
    )
  }),
  ElectionSchedule: defineComponent<'ElectionSchedule', TextProps>(({ text, ...props }) => {
    const recipe = useRecipe({ key: 'ElectionSchedule' })
    const styles = recipe()
    return (
      <Text css={styles} {...props}>
        {text}
      </Text>
    )
  }),
  ElectionStatusBadge: defineComponent<'ElectionStatusBadge', Omit<StatusBadgeProps, 'colorPalette' | 'children'>>(
    ({ label, tone, ...props }) => (
      <StatusBadge
        colorPalette={tone === 'success' || tone === 'warning' ? tone : 'danger'}
        variant='surface'
        {...props}
      >
        {label}
      </StatusBadge>
    )
  ),
  ElectionHeader: defineComponent<'ElectionHeader', ImageProps>(({ src, alt, ...props }) =>
    src ? <Image src={src} alt={alt} {...props} /> : null
  ),
  ElectionQuestions: defineComponent<'ElectionQuestions', BoxProps>(({ form, ...props }) => {
    const recipe = useSlotRecipe({ key: 'ElectionQuestions' })
    const styles = recipe({ layout: 'list' })
    return (
      <Box css={styles.wrapper} {...props}>
        {form}
      </Box>
    )
  }),
  ElectionQuestion: defineComponent<'ElectionQuestion', BoxProps>(
    ({ title, description, fields, tip, layout, invalid, ...props }) => {
      const recipe = useSlotRecipe({ key: 'ElectionQuestions' })
      const styles = recipe({ layout })

      return (
        <Box css={styles.container} {...props}>
          <Field.Root invalid={invalid}>
            <Box css={styles.header}>
              <Box as='label' css={styles.title}>
                {title}
              </Box>
            </Box>
            <Box css={styles.body}>
              {description ? <Box css={styles.description}>{markdown(description)}</Box> : null}
              <Box css={styles.stack}>{fields}</Box>
              {tip}
            </Box>
          </Field.Root>
        </Box>
      )
    }
  ),
  QuestionChoice: defineComponent<'QuestionChoice', BoxProps>(
    ({
      value,
      label,
      description,
      image,
      compact,
      selected,
      disabled,
      controlType,
      presentation,
      canOpenImageModal,
      dataAttrs,
      onSelect,
    }) => {
      const recipe = useSlotRecipe({ key: 'QuestionChoice' })
      const layout = dataAttrs?.['data-layout'] === 'grid' ? 'grid' : 'list'
      const context = 'card'
      const styles = recipe({ layout, context })
      const [isOpen, setIsOpen] = useState(false)
      const [loaded, setLoaded] = useState(false)
      const imageRef = useRef<HTMLImageElement>(null)

      const imageDefault = image?.default
      const imageThumbnail = image?.thumbnail ?? imageDefault
      const hasImage = Boolean(imageThumbnail)

      // An image can already be fully loaded before React attaches `onLoad` — it
      // happens with cached responses and, on SSR pages, with images the browser
      // started fetching from the server-rendered markup before hydration. In
      // those cases `onLoad` never fires, leaving the Skeleton overlay covering an
      // image that is actually present (matching the "url is there, hovering shows
      // it, but it stays grey" reports). Reconcile against the DOM `complete` flag
      // on every src change so a new image that isn't loaded yet shows the skeleton
      // again instead of inheriting the previous image's loaded state.
      useEffect(() => {
        setLoaded(imageRef.current?.complete ?? false)
      }, [imageThumbnail])

      const thumbnail = (
        <Image
          ref={imageRef}
          css={styles.image}
          src={imageThumbnail}
          alt={label}
          onLoad={() => setLoaded(true)}
          // Don't let a failed request hang as an eternal skeleton either.
          onError={() => setLoaded(true)}
        />
      )

      const media = hasImage ? (
        <Box data-choice-media={dataAttrs?.['data-choice-media']}>
          <Skeleton loading={!loaded} css={styles.skeleton}>
            {canOpenImageModal && imageDefault ? (
              // Named by the image's alt: a name of its own would also end up in the choice's accessible name.
              <chakra.button
                type='button'
                aria-haspopup='dialog'
                display='block'
                w='full'
                h='full'
                borderTopRadius='lg'
                focusVisibleRing='inside'
                onClick={(event) => {
                  event.preventDefault()
                  setIsOpen(true)
                }}
              >
                {thumbnail}
              </chakra.button>
            ) : (
              thumbnail
            )}
          </Skeleton>
        </Box>
      ) : null

      const body = (
        <Box data-choice-body={dataAttrs?.['data-choice-body']} data-compact={compact ? '' : undefined}>
          <Text css={styles.label} data-choice-label=''>
            {label}
          </Text>
          {description ? <Box css={styles.description}>{markdown(description)}</Box> : null}
        </Box>
      )

      if (controlType === 'checkbox') {
        const idBase = dataAttrs?.['data-choice-id-base'] ?? `question-choice-${value}`
        const inputName = dataAttrs?.['data-choice-field-name']

        return (
          <>
            <Checkbox.Root
              ids={{
                root: `${idBase}-root`,
                hiddenInput: `${idBase}-input`,
                control: `${idBase}-control`,
                label: `${idBase}-label`,
              }}
              css={styles.wrapper}
              w='full'
              data-state={selected ? 'checked' : 'unchecked'}
              data-disabled={disabled ? 'true' : undefined}
              data-choice-card={dataAttrs?.['data-choice-card']}
              data-layout={layout}
              checked={selected}
              disabled={disabled}
              onCheckedChange={(details) => onSelect(Boolean(details.checked))}
            >
              <Checkbox.HiddenInput value={value} name={inputName} />
              <Checkbox.Control data-choice-control={dataAttrs?.['data-choice-control']} data-control-type='checkbox'>
                <Checkbox.Indicator />
              </Checkbox.Control>
              {media}
              <Checkbox.Label as='div'>{body}</Checkbox.Label>
            </Checkbox.Root>

            {canOpenImageModal && imageDefault ? (
              <Dialog.Root open={isOpen} onOpenChange={({ open }) => setIsOpen(open)}>
                <Dialog.Backdrop css={styles.modalOverlay} />
                <Dialog.Positioner>
                  <Dialog.Content css={styles.modalContent} aria-label={label}>
                    <Dialog.CloseTrigger asChild>
                      <CloseButton css={styles.modalClose} />
                    </Dialog.CloseTrigger>
                    <Dialog.Body css={styles.modalBody}>
                      <Image src={imageDefault} alt={label} css={styles.modalImage} />
                      <Text css={styles.modalLabel}>{label}</Text>
                      {description ? <Box css={styles.modalDescription}>{markdown(description)}</Box> : null}
                    </Dialog.Body>
                  </Dialog.Content>
                </Dialog.Positioner>
              </Dialog.Root>
            ) : null}
          </>
        )
      }

      return (
        <>
          <Box
            as='label'
            css={styles.wrapper}
            w='full'
            data-state={selected ? 'checked' : 'unchecked'}
            data-disabled={disabled ? 'true' : undefined}
            data-choice-card={dataAttrs?.['data-choice-card']}
            data-layout={layout}
          >
            <Box data-choice-control={dataAttrs?.['data-choice-control']} data-control-type='radio'>
              <input
                type={controlType}
                value={value}
                checked={selected}
                disabled={disabled}
                onChange={(event: ChangeEvent<HTMLInputElement>) => onSelect(event.target.checked)}
                className='peer'
                style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
              />
              <Box
                boxSize='icon.lg'
                borderWidth={selected ? '[0]' : 'mark'}
                borderColor='ballot.choice.ring'
                borderRadius='full'
                bg={selected ? 'colorPalette.solid' : 'transparent'}
                color='accent.contrast'
                // The input is invisible, so its keyboard focus is drawn here, as Chakra's radiomark draws it.
                _peerFocusVisible={{
                  outlineWidth: '{borderWidths.focusRing}',
                  outlineStyle: 'solid',
                  outlineColor: 'colorPalette.focusRing',
                  outlineOffset: '{spacing.0.5}',
                }}
                display='flex'
                alignItems='center'
                justifyContent='center'
              >
                {selected ? <Icon as={CheckIcon} boxSize='4' /> : null}
              </Box>
            </Box>
            {media}
            {body}
          </Box>

          {canOpenImageModal && imageDefault ? (
            <Dialog.Root open={isOpen} onOpenChange={({ open }) => setIsOpen(open)}>
              <Dialog.Backdrop css={styles.modalOverlay} />
              <Dialog.Positioner>
                <Dialog.Content css={styles.modalContent} aria-label={label}>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton css={styles.modalClose} />
                  </Dialog.CloseTrigger>
                  <Dialog.Body css={styles.modalBody}>
                    <Image src={imageDefault} alt={label} css={styles.modalImage} />
                    <Text css={styles.modalLabel}>{label}</Text>
                    {description ? <Box css={styles.modalDescription}>{markdown(description)}</Box> : null}
                  </Dialog.Body>
                </Dialog.Content>
              </Dialog.Positioner>
            </Dialog.Root>
          ) : null}
        </>
      )
    }
  ),
  QuestionRankChoice: defineComponent<'QuestionRankChoice', BoxProps>(
    ({
      choice,
      value,
      label,
      description,
      image,
      compact,
      hasImage: _hasImage,
      canOpenImageModal,
      dataAttrs,
      presentation,
      position,
      options,
      disabled,
      onRank,
      ...props
    }) => {
      const recipe = useSlotRecipe({ key: 'QuestionChoice' })
      const layout = dataAttrs?.['data-layout'] === 'grid' ? 'grid' : 'list'
      const styles = recipe({ layout, context: 'card' })
      const imageSrc = image?.thumbnail ?? image?.default

      // In the grid the select stays in the card body: the recipe pins `[data-choice-control]` over the image,
      // where a select would cover the title of a card without one.
      const select = (
        <NativeSelect.Root
          size='sm'
          width='auto'
          disabled={disabled}
          alignSelf={layout === 'grid' ? 'start' : undefined}
          mt={layout === 'grid' ? '2' : undefined}
          data-choice-control={layout === 'list' ? dataAttrs?.['data-choice-control'] : undefined}
        >
          <NativeSelect.Field
            id={`rank-${choice.value}`}
            value={position === null || position === undefined ? '' : String(position)}
            bg='bg'
            onChange={(event) => onRank(event.target.value === '' ? null : Number(event.target.value))}
          >
            <option value=''>—</option>
            {options.map((option) => (
              <option key={option.position} value={option.position} data-taken={option.taken ? '' : undefined}>
                {option.label}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      )

      return (
        <Box
          as='label'
          css={styles.wrapper}
          w='full'
          {...props}
          data-presentation={presentation}
          data-selection-mode='ranked'
          data-choice-value={value}
          data-choice-card={dataAttrs?.['data-choice-card']}
          data-disabled={disabled ? 'true' : undefined}
          data-layout={layout}
        >
          {imageSrc ? (
            <Box data-choice-media={dataAttrs?.['data-choice-media']}>
              <Box css={styles.skeleton}>
                <Image
                  css={styles.image}
                  src={linkifyIpfs(imageSrc)}
                  alt={label}
                  data-can-open-modal={canOpenImageModal ? 'true' : undefined}
                />
              </Box>
            </Box>
          ) : null}
          <Box data-choice-body={dataAttrs?.['data-choice-body']} data-compact={compact ? '' : undefined}>
            <Text css={styles.label} data-choice-label=''>
              {label}
            </Text>
            {/* The SDK default renders `description` as raw HTML; keep it on the markdown path. */}
            {description ? <Box css={styles.description}>{markdown(description)}</Box> : null}
            {layout === 'grid' ? select : null}
          </Box>
          {layout === 'list' ? select : null}
        </Box>
      )
    }
  ),
  QuestionsTypeBadge: defineComponent<'QuestionsTypeBadge', BoxProps>(({ title, tooltip, ...props }) => {
    const recipe = useSlotRecipe({ key: 'QuestionsTypeBadge' })
    const styles = recipe()
    return (
      <Box css={styles.box} title={tooltip} {...props}>
        <Text css={styles.title}>{title}</Text>
      </Box>
    )
  }),
  QuestionTip: defineComponent<'QuestionTip', BoxProps>(({ text, ...props }) => {
    const recipe = useSlotRecipe({ key: 'QuestionsTip' })
    const styles = recipe()
    return (
      <Box css={styles.wrapper} {...props}>
        <Text css={styles.text}>{text}</Text>
      </Box>
    )
  }),
  QuestionsEmpty: defineComponent<'QuestionsEmpty', BoxProps>(({ text, ...props }) => {
    const recipe = useSlotRecipe({ key: 'QuestionsEmpty' })
    const styles = recipe()
    return (
      <Box css={styles.container} {...props}>
        <Text css={styles.description}>{text}</Text>
      </Box>
    )
  }),
  QuestionsError: defineComponent<'QuestionsError', TextProps>(({ error, variant: _variant, ...props }) => (
    <Text {...questionsErrorStyle} {...(props as TextProps)}>
      {error}
    </Text>
  )),
  ConfirmShell: defineComponent<'ConfirmShell', BoxProps>(({ isOpen, onClose, content, ...props }) => (
    <Dialog.Root open={isOpen} onOpenChange={({ open }) => !open && onClose()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content {...props}>{content}</Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )),
  QuestionsConfirmation: defineComponent<'QuestionsConfirmation', BoxProps>(
    ({ election, answersView, onConfirm, onCancel }) => {
      const { t } = useTranslation()

      return (
        <ConfirmDialogContent
          layout='summary'
          destructive={false}
          title={getElectionTitle(election)}
          description={t('process.spreadsheet.confirm.election_title', {
            defaultValue: 'Your vote has been recorded for:',
          })}
          cancelText={t('confirm.cancel')}
          confirmText={t('confirm.confirm')}
          onCancel={onCancel}
          onConfirm={onConfirm}
        >
          <Flex direction='column' gap='3'>
            {answersView.map((item, index) => (
              <Card.Root
                key={`${item.question}-${index}`}
                variant='section'
                size='sm'
                flexDirection='row'
                gap='3'
                alignItems='flex-start'
              >
                <Flex
                  boxSize='5'
                  mt='0.5'
                  flexShrink='0'
                  alignItems='center'
                  justifyContent='center'
                  borderRadius='full'
                  bg='status.success.fg'
                  color='accent.contrast'
                >
                  <Icon as={CheckIcon} boxSize='3.5' />
                </Flex>
                <Flex direction='column' gap='1' flex='1'>
                  <Text fontWeight='semibold'>{item.question}</Text>
                  {item.answers.length <= 1 ? (
                    <Text>{item.answers[0] || '-'}</Text>
                  ) : (
                    <Flex direction='column' gap='1'>
                      {item.answers.map((answer, answerIndex) => (
                        <Text key={`${item.question}-${index}-${answerIndex}`}>{answer}</Text>
                      ))}
                    </Flex>
                  )}
                </Flex>
              </Card.Root>
            ))}
          </Flex>
        </ConfirmDialogContent>
      )
    }
  ),
  // The packaged slot also passes `description` (every line joined in one). It is not rendered: the
  // per-vote lines already carry the vote id linked to its explorer page.
  Voted: defineComponent<'Voted', AlertRootProps>(({ title, description: _description, votes, ...props }) => {
    const recipe = useSlotRecipe({ key: 'Voted' })
    const styles = recipe()
    const { t } = useTranslation()
    const { election } = useElection()
    // An anonymous census has no server-side record tying a vote id to its
    // voter, so this notice is the only place the id will ever appear: say so
    // while it is still on screen.
    const anonymous = !!election?.census?.anonymous

    return (
      <Alert.Root
        alignItems='center'
        justifyContent='center'
        textAlign='center'
        status='success'
        variant='outline'
        flexDir='column'
        css={styles.container}
        {...props}
      >
        <Alert.Indicator css={styles.icon}>
          <Icon as={CheckIcon} />
        </Alert.Indicator>
        <Alert.Title css={styles.title}>{title}</Alert.Title>
        <Alert.Description css={styles.description} display='flex' flexDirection='column' gap='1'>
          {votes.map((vote, index) => (
            <Text key={vote.questionId || index}>{vote.description}</Text>
          ))}
          {anonymous && (
            <Text textStyle='body-sm' fontWeight='semibold'>
              {t('vote.anonymous_receipt', {
                defaultValue: 'Anonymous vote: save this receipt now, the platform cannot show it to you again.',
              })}
            </Text>
          )}
        </Alert.Description>
      </Alert.Root>
    )
  }),
  VoteButton: defineComponent<'VoteButton', ButtonProps>(({ label, loading, ...props }) => {
    const merged = Object.assign<ButtonProps, ButtonProps, ButtonProps>({}, ballotAction, props)
    return (
      <Button loading={loading} {...merged}>
        {label}
      </Button>
    )
  }),
  VoteWeight: defineComponent<'VoteWeight', FlexProps>(({ label, weight, ...props }) => {
    const recipe = useSlotRecipe({ key: 'VoteWeight' })
    const styles = recipe()
    return (
      <Flex css={styles.wrapper} {...props}>
        <Text>{label}</Text>
        <Text css={styles.weight}>{weight}</Text>
      </Flex>
    )
  }),
  ElectionResults: defineComponent<'ElectionResults', BoxProps>(({ secretText, questions, ...props }) => {
    const recipe = useSlotRecipe({ key: 'ElectionResults' })
    const styles = recipe()
    const { t } = useTranslation('react-components')
    const hasMultipleQuestions = (questions?.length ?? 0) > 1
    // Only a process that has ended has a final result; live and provisional ones keep every bar in full ink.
    const { status } = useElection()
    const isFinal = status === 'ENDED' || status === 'RESULTS'
    return (
      <Box css={[styles.wrapper, !hasMultipleQuestions ? { gridTemplateColumns: '1fr' } : undefined]} {...props}>
        {secretText ? <Text css={styles.secret}>{secretText}</Text> : null}
        {questions?.map((question) => {
          const leader = isFinal ? clearLeader(question.choices) : -1
          return (
            <Box key={question.title} css={styles.question}>
              <Box css={styles.header}>
                <Text css={styles.title}>{question.title}</Text>
              </Box>
              <Flex direction='column' css={styles.body}>
                {question.choices.map((choice, index) => {
                  const percent = Number(choice.percent.replace('%', '')) || 0
                  const isLeader = index === leader
                  return (
                    <Box
                      key={choice.title}
                      css={styles.choice}
                      data-leading={isLeader ? '' : undefined}
                      data-dimmed={leader >= 0 && !isLeader ? '' : undefined}
                    >
                      {/* `votes` is empty for a question whose ballot type can't be inferred (e.g. a legacy
                        process with no type nor ballotProtocol): there is no tally to show, not a zero one. */}
                      <Flex css={styles.choiceHeader}>
                        <Text css={styles.choiceTitle}>{choice.title}</Text>
                        {choice.votes ? (
                          <Text css={styles.choiceVotes} data-result-figure=''>
                            {t('results.votes', {
                              votes: choice.votes,
                              percent: choice.percent,
                            })}
                          </Text>
                        ) : null}
                      </Flex>
                      {choice.votes ? (
                        <Progress.Root variant='results' value={percent} max={100}>
                          <Progress.Track>
                            <Progress.Range />
                          </Progress.Track>
                        </Progress.Root>
                      ) : null}
                      {choice.description ? <Box mt='2'>{markdown(choice.description)}</Box> : null}
                    </Box>
                  )
                })}
              </Flex>
            </Box>
          )
        })}
      </Box>
    )
  }),
  ElectionActions: defineComponent<'ElectionActions', FlexProps>(({ actions, ...props }) => (
    <Flex gap='2' {...props}>
      {actions}
    </Flex>
  )),
  ActionContinue: defineComponent<'ActionContinue', ButtonProps>(({ label, loading, ...props }) => (
    <Button loading={loading} {...props}>
      {label}
    </Button>
  )),
  ActionPause: defineComponent<'ActionPause', ButtonProps>(({ label, loading, ...props }) => (
    <Button loading={loading} {...props}>
      {label}
    </Button>
  )),
  ActionEnd: defineComponent<'ActionEnd', ButtonProps>(({ label, loading, ...props }) => (
    <Button loading={loading} {...props}>
      {label}
    </Button>
  )),
  ActionCancel: defineComponent<'ActionCancel', ButtonProps>(({ label, loading, ...props }) => (
    <Button loading={loading} {...props}>
      {label}
    </Button>
  )),
  ConfirmActionModal: defineComponent<'ConfirmActionModal', BoxProps>(
    ({ title, description, confirm, cancel, onConfirm, onCancel, ...props }) => (
      <Box {...props}>
        <ConfirmDialogContent
          layout='shell'
          title={title}
          description={description}
          confirmText={confirm}
          cancelText={cancel}
          onCancel={onCancel}
          onConfirm={onConfirm}
        />
      </Box>
    )
  ),
}
