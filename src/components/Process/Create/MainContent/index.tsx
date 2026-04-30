import { Box, Button, Dialog, Flex, HStack, Icon, Text, VStack } from '@chakra-ui/react'
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
import { useState } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { LuPlus } from 'react-icons/lu'
import { Link } from 'react-router-dom'
import { useAnalytics } from '~components/AnalyticsProvider'
import { DashboardSection } from '~components/Dashboard/Contents'
import DeleteModal from '~components/Modal/DeleteModal'
import { Routes } from '~routes'
import { AnalyticsEvents } from '~utils/analytics'
import { DefaultQuestions, SelectorTypes } from '../common'
import { QuestionForm } from './QuestionForm'
import { QuestionType } from './QuestionType'

const DeleteQuestionModal = ({ open, onOpenChange, removeQuestion }) => {
  const { t } = useTranslation()

  return (
    <DeleteModal
      title={t('process.create.question.delete.title', { defaultValue: 'Delete Question' })}
      subtitle={t('process.create.question.delete.description', {
        defaultValue: 'Are you sure you want to delete this question?',
      })}
      open={open}
      onOpenChange={onOpenChange}
    >
      <Flex justifyContent='flex-end' mt={4} gap={2}>
        <Button variant='outline' onClick={() => onOpenChange({ open: false })}>
          {t('process.create.question.delete.cancel_button', { defaultValue: 'Cancel' })}
        </Button>
        <Button colorPalette='red' onClick={removeQuestion}>
          {t('process.create.question.delete.delete_button', { defaultValue: 'Delete' })}
        </Button>
      </Flex>
    </DeleteModal>
  )
}

const AddMultipleQuestionModal = ({ open, onOpenChange }) => {
  const { t } = useTranslation()

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>
              {t('process.create.question.add_multiple.title', {
                defaultValue: 'Multi-question multiple-choice is not available yet',
              })}
              <Box fontSize='sm' color='texts.subtle'>
                {t('process.create.question.add_multiple.description', {
                  defaultValue:
                    'Creating processes with more than one multiple-choice question is currently not available. If you need this type of process, please contact us.',
                })}
              </Box>
            </Dialog.Title>
          </Dialog.Header>
          <Dialog.Footer>
            <Dialog.ActionTrigger asChild>
              <Button
                variant='outline'
                aria-label={t('process.create.question.add_multiple.cancel_button', { defaultValue: 'Cancel' })}
              >
                {t('process.create.question.add_multiple.cancel_button', { defaultValue: 'Cancel' })}
              </Button>
            </Dialog.ActionTrigger>
            <Button
              asChild
              aria-label={t('process.create.question.add_multiple.contact_button', { defaultValue: 'Contact Us' })}
            >
              <Link to={Routes.dashboard.settings.support}>
                {t('process.create.question.add_multiple.contact_button', { defaultValue: 'Contact Us' })}
              </Link>
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}

export const Questions = () => {
  const { trackPlausibleEvent } = useAnalytics()
  const { control, watch } = useFormContext()
  const [isDeleteQuestionModalOpen, setDeleteQuestionModalOpen] = useState(false)
  const [isAddMultipleQuestionsOpen, setAddMultipleQuestionsOpen] = useState(false)
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null)
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'questions',
  })
  const questionType = watch('questionType')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const addQuestion = () => {
    if (questionType === SelectorTypes.Single) {
      append(DefaultQuestions[questionType])
    } else {
      trackPlausibleEvent({ name: AnalyticsEvents.TriedMultiquestionMultichoice })
      setAddMultipleQuestionsOpen(true)
    }
  }

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

  const onRemoveQuestion = (index: number | null) => {
    if (index === null) return
    setPendingDeleteIndex(index)
    setDeleteQuestionModalOpen(true)
  }

  return (
    <VStack align='stretch' gap={4}>
      <DashboardSection>
        <QuestionType />
      </DashboardSection>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext items={fields.map((field) => field.id)} strategy={verticalListSortingStrategy}>
          {fields.map((field, index) => (
            <Box key={field.id}>
              <QuestionForm index={index} onRemove={onRemoveQuestion} questionId={field.id} />
            </Box>
          ))}
        </SortableContext>
      </DndContext>
      <DeleteQuestionModal
        open={isDeleteQuestionModalOpen}
        onOpenChange={({ open }) => setDeleteQuestionModalOpen(open)}
        removeQuestion={() => removeQuestion(pendingDeleteIndex)}
      />

      <Button variant='outline' onClick={addQuestion}>
        <HStack gap={2}>
          <Icon as={LuPlus} />
          <Text as='span'>
            <Trans i18nKey='process.create.question.add'>Add question</Trans>
          </Text>
        </HStack>
      </Button>
      <AddMultipleQuestionModal
        open={isAddMultipleQuestionsOpen}
        onOpenChange={({ open }) => setAddMultipleQuestionsOpen(open)}
      />
    </VStack>
  )
}
