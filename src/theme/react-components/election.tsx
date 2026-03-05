import {
  Alert,
  AlertRootProps,
  Box,
  type BoxProps,
  Button,
  type ButtonProps,
  Checkbox,
  CloseButton,
  Dialog,
  Field,
  Flex,
  type FlexProps,
  Heading,
  type HeadingProps,
  Image,
  type ImageProps,
  Input,
  Portal,
  Progress,
  Skeleton,
  Tag,
  TagRootProps,
  Text,
  type TextProps,
  useRecipe,
  useSlotRecipe,
} from '@chakra-ui/react'
import { type ComponentsPartialDefinition, defineComponent } from '@vocdoni/react-components'
import { ChangeEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Markdown } from '~components/ui/Markdown'
import { resultsProgressRecipe } from '~theme/recipes/election'

const markdown = (value?: string) => (value ? <Markdown>{value}</Markdown> : null)

export const electionComponents: ComponentsPartialDefinition = {
  HR: defineComponent<'HR', BoxProps>((props) => <Box as='hr' borderColor='table.border' {...props} />),
  ElectionTitle: defineComponent<'ElectionTitle', HeadingProps>(({ title, ...props }) => {
    const recipe = useRecipe({ key: 'ElectionTitle' })
    const styles = recipe()
    return (
      <Heading as='h1' css={styles} {...props}>
        {title}
      </Heading>
    )
  }),
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
  ElectionStatusBadge: defineComponent<'ElectionStatusBadge', TagRootProps>(({ label, tone, ...props }) => {
    const palette = tone === 'success' ? 'green' : tone === 'warning' ? 'yellow' : 'red'
    return (
      <Tag.Root colorPalette={palette} {...props}>
        <Tag.Label>{label}</Tag.Label>
      </Tag.Root>
    )
  }),
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

      const imageDefault = image?.default
      const imageThumbnail = image?.thumbnail ?? imageDefault
      const hasImage = Boolean(imageThumbnail)

      const media = hasImage ? (
        <Box data-choice-media={dataAttrs?.['data-choice-media']}>
          <Skeleton loading={!loaded} css={styles.skeleton}>
            <Image
              css={styles.image}
              src={imageThumbnail}
              alt={label}
              onLoad={() => setLoaded(true)}
              onClick={(event) => {
                if (!canOpenImageModal) return
                event.preventDefault()
                setIsOpen(true)
              }}
            />
          </Skeleton>
        </Box>
      ) : null

      const body = (
        <Box data-choice-body={dataAttrs?.['data-choice-body']} data-compact={compact ? '' : undefined}>
          <Text css={styles.label}>{label}</Text>
          {description ? <Box css={styles.description}>{markdown(description)}</Box> : null}
        </Box>
      )

      if (controlType === 'checkbox') {
        return (
          <>
            <Checkbox.Root
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
              <Checkbox.HiddenInput value={value} />
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
                  <Dialog.Content css={styles.modalContent}>
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
                style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
              />
              <Box
                w='18px'
                h='18px'
                borderWidth='2px'
                borderColor={selected ? 'gray.700' : 'table.border'}
                borderRadius='full'
                bg='white'
                _dark={{ bg: 'gray.800', borderColor: selected ? 'gray.100' : 'gray.500' }}
                display='flex'
                alignItems='center'
                justifyContent='center'
              >
                {selected ? <Box w='8px' h='8px' borderRadius='full' bg='gray.900' _dark={{ bg: 'gray.100' }} /> : null}
              </Box>
            </Box>
            {media}
            {body}
          </Box>

          {canOpenImageModal && imageDefault ? (
            <Dialog.Root open={isOpen} onOpenChange={({ open }) => setIsOpen(open)}>
              <Dialog.Backdrop css={styles.modalOverlay} />
              <Dialog.Positioner>
                <Dialog.Content css={styles.modalContent}>
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
    <Text color='red.500' {...props}>
      {error}
    </Text>
  )),
  QuestionsConfirmation: defineComponent<'QuestionsConfirmation', BoxProps>(
    ({ answersView, onConfirm, onCancel, ...props }) => {
      const recipe = useSlotRecipe({ key: 'ConfirmModal' })
      const questionsRecipe = useSlotRecipe({ key: 'QuestionsConfirmation' })
      const styles = recipe({ variant: 'neutral' })
      const qstyles = questionsRecipe()
      const { t } = useTranslation()

      return (
        <>
          <Dialog.Header css={styles.header}>{t('confirm.title')}</Dialog.Header>
          <Dialog.CloseTrigger asChild>
            <CloseButton css={styles.close} />
          </Dialog.CloseTrigger>
          <Dialog.Body css={styles.body} {...props}>
            <Box css={qstyles.box}>
              <Text css={qstyles.description}>{t('vote.confirm')}</Text>
              {answersView.map((item, index) => (
                <Box key={index} css={qstyles.question}>
                  <Box css={qstyles.title}>{item.question}</Box>
                  <Box css={qstyles.answer}>
                    {item.answers.map((answer) => (
                      <span key={answer}>
                        - {answer}
                        <br />
                      </span>
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          </Dialog.Body>
          <Dialog.Footer css={styles.footer}>
            <Button variant='ghost' css={styles.cancel} onClick={onCancel}>
              {t('confirm.cancel')}
            </Button>
            <Button css={styles.confirm} onClick={onConfirm}>
              {t('confirm.confirm')}
            </Button>
          </Dialog.Footer>
        </>
      )
    }
  ),
  Voted: defineComponent<'Voted', AlertRootProps>(({ title, description, ...props }) => {
    const recipe = useSlotRecipe({ key: 'Voted' })
    const styles = recipe()
    const { t } = useTranslation()

    return (
      <Alert.Root
        variant='subtle'
        alignItems='center'
        justifyContent='center'
        textAlign='center'
        status='success'
        flexDir='column'
        css={styles.container}
        {...props}
      >
        <Alert.Indicator css={styles.icon} />
        <Alert.Title css={styles.title}>{t('vote.voted_title')}</Alert.Title>
        <Alert.Description truncate maxW='100%' whiteSpace='initial' css={styles.description}>
          {description}
        </Alert.Description>
      </Alert.Root>
    )
  }),
  VoteButton: defineComponent<'VoteButton', ButtonProps>(({ label, loading, ...props }) => (
    <Button loading={loading} {...props}>
      {label}
    </Button>
  )),
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
    const progressRecipe = useSlotRecipe({ recipe: resultsProgressRecipe })
    const progressStyles = progressRecipe()
    return (
      <Box css={styles.wrapper} {...props}>
        {secretText ? <Text css={styles.secret}>{secretText}</Text> : null}
        {questions?.map((question) => (
          <Box key={question.title} css={styles.question}>
            <Box css={styles.header}>
              <Heading size='sm' css={styles.title}>
                {question.title}
              </Heading>
            </Box>
            <Flex direction='column' css={styles.body}>
              {question.choices.map((choice) => {
                const percent = Number(choice.percent.replace('%', '')) || 0
                return (
                  <Box key={choice.title} position='relative'>
                    <Text css={styles.choiceTitle}>{choice.title}</Text>
                    <Text css={styles.choiceVotes}>{choice.votes}</Text>
                    <Progress.Root css={[styles.progress, progressStyles.root]} value={percent} max={100}>
                      <Progress.Track css={progressStyles.track}>
                        <Progress.Range css={progressStyles.range} />
                      </Progress.Track>
                    </Progress.Root>
                    {choice.description ? <Box mt={2}>{markdown(choice.description)}</Box> : null}
                  </Box>
                )
              })}
            </Flex>
          </Box>
        ))}
      </Box>
    )
  }),
  SpreadsheetAccess: defineComponent<'SpreadsheetAccess', BoxProps>(
    ({
      connected,
      loading,
      title,
      open,
      onOpen,
      onClose,
      onLogout,
      onSubmit,
      fields,
      anonymousField,
      extraFields,
      ...props
    }) => {
      const recipe = useSlotRecipe({ key: 'SpreadsheetAccess' })
      const styles = recipe()
      const { t } = useTranslation()

      if (connected) {
        return (
          <Button css={styles.disconnect} onClick={onLogout} disabled={loading}>
            {t('logout')}
          </Button>
        )
      }

      return (
        <Dialog.Root
          open={open}
          onOpenChange={({ open: isOpen }) => {
            if (loading && !isOpen) return
            if (isOpen) {
              onOpen()
            } else {
              onClose()
            }
          }}
        >
          <Dialog.Trigger asChild>
            <Button css={styles.button} disabled={loading}>
              {t('spreadsheet.access_button')}
            </Button>
          </Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop css={styles.overlay} />
            <Dialog.Positioner>
              <Dialog.Content css={styles.content} {...props}>
                <form
                  onSubmit={(event) => {
                    event.preventDefault()
                    onSubmit()
                  }}
                >
                  <Dialog.Header css={styles.header}>{title || t('spreadsheet.modal_title')}</Dialog.Header>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton disabled={loading} css={styles.top_close} />
                  </Dialog.CloseTrigger>
                  <Dialog.Body css={styles.body}>
                    {fields.map((field) => (
                      <Field.Root key={field.id} invalid={Boolean(field.error)} css={styles.control}>
                        <Field.Label css={styles.label}>{field.label}</Field.Label>
                        <Input
                          {...field.inputProps}
                          {...field.inputAttrs}
                          css={styles.input}
                          disabled={loading}
                          type={field.inputAttrs?.type || 'text'}
                        />
                        {field.error ? (
                          <Field.ErrorText css={styles.error}>{field.error}</Field.ErrorText>
                        ) : field.description ? (
                          <Field.HelperText css={styles.helper}>{field.description}</Field.HelperText>
                        ) : null}
                      </Field.Root>
                    ))}
                    {anonymousField ? (
                      <Field.Root invalid={Boolean(anonymousField.error)} css={styles.sik_control}>
                        <Field.Label css={styles.label}>{anonymousField.label}</Field.Label>
                        <Input
                          {...anonymousField.inputProps}
                          {...anonymousField.inputAttrs}
                          css={styles.input}
                          disabled={loading}
                          type={anonymousField.inputAttrs?.type || 'text'}
                        />
                        {anonymousField.error ? (
                          <Field.ErrorText css={styles.error}>{anonymousField.error}</Field.ErrorText>
                        ) : anonymousField.description ? (
                          <Field.HelperText css={styles.helper}>{anonymousField.description}</Field.HelperText>
                        ) : null}
                      </Field.Root>
                    ) : null}
                    {extraFields}
                  </Dialog.Body>
                  <Dialog.Footer css={styles.footer}>
                    <Button type='button' variant='ghost' onClick={onClose} css={styles.close} disabled={loading}>
                      {t('spreadsheet.close')}
                    </Button>
                    <Button type='submit' disabled={loading} loading={loading} css={styles.submit}>
                      {t('spreadsheet.access_button')}
                    </Button>
                  </Dialog.Footer>
                </form>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      )
    }
  ),
  ElectionActions: defineComponent<'ElectionActions', FlexProps>(({ actions, ...props }) => (
    <Flex gap={2} {...props}>
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
    ({ title, description, confirm, cancel, onConfirm, onCancel, ...props }) => {
      const recipe = useSlotRecipe({ key: 'ConfirmModal' })
      const styles = recipe()
      return (
        <Box {...props}>
          <Dialog.Header css={styles.header}>{title}</Dialog.Header>
          <Dialog.Body css={styles.body}>
            <Text>{description}</Text>
          </Dialog.Body>
          <Dialog.Footer css={styles.footer}>
            <Button variant='ghost' css={styles.cancel} onClick={onCancel}>
              {cancel}
            </Button>
            <Button css={styles.confirm} onClick={onConfirm}>
              {confirm}
            </Button>
          </Dialog.Footer>
        </Box>
      )
    }
  ),
}
