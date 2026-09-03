import { Box, Button, Flex, HStack, Icon, Text, VStack } from '@chakra-ui/react'
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
import DeleteModal from '~components/Modal/DeleteModal'
import { defaultQuestion } from '../common'
import { QuestionForm } from './QuestionForm'

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

export const Questions = () => {
  const { control } = useFormContext()
  const [isDeleteQuestionModalOpen, setDeleteQuestionModalOpen] = useState(false)
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null)
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'questions',
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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

  const onRemoveQuestion = (index: number | null) => {
    if (index === null) return
    setPendingDeleteIndex(index)
    setDeleteQuestionModalOpen(true)
  }

  return (
    <VStack align='stretch' gap={4}>
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
    </VStack>
  )
}
