import { Box, Button, Flex, HStack, Icon, SegmentGroup, Text, VStack } from '@chakra-ui/react'
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { memo, useCallback, useMemo, useState } from 'react'
import {
  Controller,
  FieldArrayWithId,
  FormProvider,
  useFieldArray,
  useFormContext,
  UseFormReturn,
  useWatch,
} from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { AddIcon } from '~theme/icons'
import { ConfirmDialog } from '~components/ui/ConfirmDialog'
import { MaxQuestionsPerProcess } from '~constants'
import { useAppEnv } from '~src/app-env'
import { defaultQuestion, Process } from '../common'
import { QuestionForm } from './QuestionForm'

const DeleteQuestionModal = ({ open, onOpenChange, removeQuestion }) => {
  const { t } = useTranslation()

  return (
    <ConfirmDialog
      layout='inline'
      title={t('process.create.question.delete.title', { defaultValue: 'Delete Question' })}
      description={t('process.create.question.delete.description', {
        defaultValue: 'Are you sure you want to delete this question?',
      })}
      open={open}
      onOpenChange={onOpenChange}
      cancelText={t('process.create.question.delete.cancel_button', { defaultValue: 'Cancel' })}
      confirmText={t('process.create.question.delete.delete_button', { defaultValue: 'Delete' })}
      onConfirm={removeQuestion}
    />
  )
}

const VotingModeSwitch = () => {
  const { t } = useTranslation()
  const { control } = useFormContext()
  const { QUESTION_BY_QUESTION: questionByQuestionEnabled } = useAppEnv()
  const votingMode = useWatch({ control, name: 'votingMode' })
  const byQuestion = votingMode === 'byQuestion'
  const byQuestionLabel = t('process_create.voting_mode.by_question', { defaultValue: 'Question by question' })

  // With the flag off the switch is hidden, but a draft already in this mode keeps it and shows it.
  if (!questionByQuestionEnabled && !byQuestion) return null

  return (
    <VStack align='stretch' gap='2'>
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify='space-between'
        align={{ base: 'stretch', md: 'center' }}
        gap='3'
      >
        {questionByQuestionEnabled ? (
          <Controller
            control={control}
            name='votingMode'
            render={({ field }) => (
              <SegmentGroup.Root
                size='sm'
                value={field.value}
                onValueChange={({ value }) => field.onChange(value)}
                aria-label={t('process_create.voting_mode.label', { defaultValue: 'How people vote' })}
                w={{ base: 'full', md: 'auto' }}
                ms={{ md: 'auto' }}
              >
                <SegmentGroup.Indicator />
                <SegmentGroup.Item value='all' flex={{ base: '1', md: 'initial' }} justifyContent='center'>
                  <SegmentGroup.ItemText>
                    {t('process_create.voting_mode.all', { defaultValue: 'All at once' })}
                  </SegmentGroup.ItemText>
                  <SegmentGroup.ItemHiddenInput />
                </SegmentGroup.Item>
                <SegmentGroup.Item value='byQuestion' flex={{ base: '1', md: 'initial' }} justifyContent='center'>
                  <SegmentGroup.ItemText>{byQuestionLabel}</SegmentGroup.ItemText>
                  <SegmentGroup.ItemHiddenInput />
                </SegmentGroup.Item>
              </SegmentGroup.Root>
            )}
          />
        ) : (
          <Text textStyle='body-sm' color='fg.muted'>
            {byQuestionLabel}
          </Text>
        )}
      </Flex>
      {byQuestion && (
        <Text textStyle='control' color='fg.muted'>
          {t('process_create.voting_mode.by_question_hint', {
            defaultValue:
              "Questions start closed. You open them one by one from the vote's page, and each question's result shows when you close it.",
          })}
        </Text>
      )}
    </VStack>
  )
}

// Module constants: new ones on each render would change the drag context of every card
const keyboardSensorOptions = { coordinateGetter: sortableKeyboardCoordinates }
const questionModifiers = [restrictToVerticalAxis]

type QuestionCardsProps = {
  form: UseFormReturn<Process>
  fields: FieldArrayWithId<Process, 'questions'>[]
  onRemove: (index: number) => void
}

/**
 * The question cards, under their own form context: the form's context changes on every render and RHF hooks read it
 * even when given `control`, so a memo would not hold. Read form state below with useFormState and useWatch, since
 * `formState` and `watch()` from useFormContext would not update here.
 */
const QuestionCards = memo(({ form, fields, onRemove }: QuestionCardsProps) => (
  <FormProvider {...form}>
    {fields.map((field, index) => (
      <Box key={field.id}>
        <QuestionForm
          index={index}
          total={fields.length}
          onRemove={onRemove}
          questionId={field.id}
          control={form.control}
          setValue={form.setValue}
        />
      </Box>
    ))}
  </FormProvider>
))

QuestionCards.displayName = 'QuestionCards'

export const Questions = () => {
  const { t } = useTranslation()
  const form = useFormContext<Process>()
  const { control } = form
  // The cards' context: its methods never change, and they read form state through their own subscriptions
  const cardsForm = useMemo(() => form, [control])
  const [isDeleteQuestionModalOpen, setDeleteQuestionModalOpen] = useState(false)
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null)
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'questions',
  })

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, keyboardSensorOptions))
  // A new array would hand every sortable card a new context, re-rendering them all
  const questionIds = useMemo(() => fields.map((field) => field.id), [fields])

  const canAddQuestion = fields.length < MaxQuestionsPerProcess
  const addQuestion = () => append(defaultQuestion)

  const removeQuestion = (index) => {
    remove(index)
    setDeleteQuestionModalOpen(false)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id)
      const newIndex = fields.findIndex((field) => field.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        move(oldIndex, newIndex)
      }
    }
  }

  // Stable, like every prop of the memoized question cards: a new one would re-render them all
  const onRemoveQuestion = useCallback((index: number | null) => {
    if (index === null) return
    setPendingDeleteIndex(index)
    setDeleteQuestionModalOpen(true)
  }, [])

  return (
    <VStack align='stretch' gap='4'>
      <VotingModeSwitch />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={questionModifiers}
      >
        <SortableContext items={questionIds} strategy={verticalListSortingStrategy}>
          <QuestionCards form={cardsForm} fields={fields} onRemove={onRemoveQuestion} />
        </SortableContext>
      </DndContext>
      <DeleteQuestionModal
        open={isDeleteQuestionModalOpen}
        onOpenChange={({ open }) => setDeleteQuestionModalOpen(open)}
        removeQuestion={() => removeQuestion(pendingDeleteIndex)}
      />

      <Button variant='outline' onClick={addQuestion} disabled={!canAddQuestion}>
        <HStack gap='2'>
          <Icon as={AddIcon} />
          <Text as='span'>
            <Trans i18nKey='process.create.question.add'>Add question</Trans>
          </Text>
        </HStack>
      </Button>
      {!canAddQuestion && (
        <Text textStyle='body-sm' color='fg.muted'>
          {t('process.create.question.limit_reached', {
            defaultValue: 'A voting process can have at most {{ max }} questions.',
            max: MaxQuestionsPerProcess,
          })}
        </Text>
      )}
    </VStack>
  )
}
