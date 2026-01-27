import { Box, Button, Flex, HStack, Heading, Icon, Text, useDisclosure, VStack } from '@chakra-ui/react'
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
import { DashboardSection } from '~components/shared/Dashboard/Contents'
import DeleteModal from '~components/shared/Modal/DeleteModal'
import { Routes } from '~routes'
import { AnalyticsEvent } from '~utils/analytics'
import { DefaultQuestions, SelectorTypes } from '../common'
import { QuestionForm } from './QuestionForm'
import { QuestionType } from './QuestionType'
import { Modal, ModalBody, ModalContent, ModalHeader, ModalOverlay } from '~shared/Modal/Modal'

const DeleteQuestionModal = ({ isOpen, onClose, removeQuestion }) => {
  const { t } = useTranslation()

  return (
    <DeleteModal
      title={t('process.create.question.delete.title', { defaultValue: 'Delete Question' })}
      subtitle={t('process.create.question.delete.description', {
        defaultValue: 'Are you sure you want to delete this question?',
      })}
      isOpen={isOpen}
      onClose={onClose}
    >
      <Flex justifyContent='flex-end' mt={4} gap={2}>
        <Button variant='outline' onClick={onClose}>
          {t('process.create.question.delete.cancel_button', { defaultValue: 'Cancel' })}
        </Button>
        <Button colorScheme='red' onClick={removeQuestion}>
          {t('process.create.question.delete.delete_button', { defaultValue: 'Delete' })}
        </Button>
      </Flex>
    </DeleteModal>
  )
}

const AddMultipleQuestionModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation()

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent p={5}>
        <ModalHeader p={0}>
          <Flex flexDirection='column' gap={3}>
            <Heading size='sm'>
              {t('process.create.question.add_multiple.title', {
                defaultValue: 'Multi-question multiple-choice is not available yet',
              })}
            </Heading>
            <Box fontSize='sm' color='texts.subtle'>
              {t('process.create.question.add_multiple.description', {
                defaultValue:
                  'Creating processes with more than one multiple-choice question is currently not available. If you need this type of process, please contact us.',
              })}
            </Box>
          </Flex>
        </ModalHeader>
        <ModalBody p={0}>
          <Flex justifyContent='flex-end' mt={4} gap={2}>
            <Button
              variant='outline'
              aria-label={t('process.create.question.add_multiple.cancel_button', { defaultValue: 'Cancel' })}
              onClick={onClose}
            >
              {t('process.create.question.add_multiple.cancel_button', { defaultValue: 'Cancel' })}
            </Button>
            <Button
              asChild
              aria-label={t('process.create.question.add_multiple.contact_button', { defaultValue: 'Contact Us' })}
            >
              <Link to={Routes.dashboard.settings.support}>
                {t('process.create.question.add_multiple.contact_button', { defaultValue: 'Contact Us' })}
              </Link>
            </Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export const Questions = () => {
  const { trackPlausibleEvent } = useAnalytics()
  const { control, watch } = useFormContext()
  const { open: isOpen, onClose, onOpen } = useDisclosure()
  const {
    open: isAddMultipleQuestionsOpen,
    onClose: onAddMultipleQuestionsClose,
    onOpen: onAddMultipleQuestionsOpen,
  } = useDisclosure()
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
      trackPlausibleEvent({ name: AnalyticsEvent.TriedMultiquestionMultichoice })
      onAddMultipleQuestionsOpen()
    }
  }

  const removeQuestion = (index) => {
    remove(index)
    onClose()
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
    onOpen()
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
        isOpen={isOpen}
        onClose={onClose}
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
      <AddMultipleQuestionModal isOpen={isAddMultipleQuestionsOpen} onClose={onAddMultipleQuestionsClose} />
    </VStack>
  )
}
