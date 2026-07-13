import { Box, HStack, Icon, IconButton, Input, Text, VStack } from '@chakra-ui/react'
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToParentElement } from '@dnd-kit/modifiers'
import {
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuGripVertical, LuX } from 'react-icons/lu'
import { DashboardBox } from '~components/Dashboard/Contents'
import Editor from '~components/Editor'
import { useProcessTemplates } from '~components/Process/Create/TemplateProvider'
import { Field } from '~components/ui/Field'
import { Process, SelectorTypes } from '../common'
import ExtendedQuestionEditor from './ExtendedQuestionEditor'
import SelectionLimits from './SelectionLimits'
import SimpleQuestionEditor from './SimpleQuestionEditor'

interface QuestionFormProps {
  index: number
  onRemove: (index: number) => void
  questionId: string
}

export const QuestionForm = ({ index, onRemove, questionId }: QuestionFormProps) => {
  const { t } = useTranslation()
  const { activeTemplate, placeholders } = useProcessTemplates()
  const {
    register,
    formState: { errors },
    watch,
    control,
  } = useFormContext<Process>()
  const {
    fields: questionOptions,
    append,
    remove,
    move,
  } = useFieldArray({
    name: `questions.${index}.options`,
  })
  const questions = watch('questions')
  const extendedInfo = watch('extendedInfo')
  const questionType = watch('questionType')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: questionId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <DashboardBox>
        {/* Question title and description */}
        <HStack align='stretch' gap={4}>
          {/* Drag handle */}
          {questions.length > 1 && (
            <Box
              {...attributes}
              {...listeners}
              cursor={isDragging ? 'grabbing' : 'grab'}
              display='flex'
              alignItems='flex-start'
              pt={2}
              color='fg.subtle'
              _hover={{ color: 'fg.muted' }}
            >
              <Icon as={LuGripVertical} />
            </Box>
          )}

          <VStack flex='1' align='stretch' gap={2}>
            <Text fontSize='sm' color='texts.subtle'>
              {t('process.create.question.question_number', {
                defaultValue: 'Question {{index}} of {{total}}',
                index: index + 1,
                total: questions.length,
              })}
            </Text>
            <Field
              invalid={!!errors.questions?.[index]?.title}
              errorText={errors.questions?.[index]?.title?.message?.toString()}
            >
              <Input
                placeholder={
                  placeholders[activeTemplate]?.questions?.[index]?.title ??
                  t('process_create.question.title.placeholder', 'Add a title to the question')
                }
                variant='borderless'
                fontSize='lg'
                fontWeight='bold'
                {...register(`questions.${index}.title`, {
                  required: t('form.error.required', 'This field is required'),
                })}
              />
            </Field>
            <Controller
              name={`questions.${index}.description`}
              control={control}
              render={({ field }) => (
                <Editor
                  onChange={field.onChange}
                  variant='borderless'
                  placeholder={
                    placeholders[activeTemplate]?.questions?.[index]?.description ??
                    t(
                      'process_create.question.description.placeholder',
                      'Add the description of the question here (optional)...'
                    )
                  }
                  defaultValue={field.value}
                />
              )}
            />
          </VStack>
          {questions.length > 1 && (
            <IconButton
              aria-label={t('process_create.question.remove', 'Remove question')}
              size='sm'
              variant='ghost'
              onClick={() => onRemove(index)}
            >
              <Icon as={LuX} />
            </IconButton>
          )}
        </HStack>

        {/* Selection limits */}
        {questionType === SelectorTypes.Multiple && <SelectionLimits index={index} />}

        {/* Options */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event) => {
            const { active, over } = event

            if (over && active.id !== over.id) {
              const oldIndex = questionOptions.findIndex((field) => field.id === active.id)
              const newIndex = questionOptions.findIndex((field) => field.id === over.id)

              if (oldIndex !== -1 && newIndex !== -1) {
                // Move the field array items
                move(oldIndex, newIndex)
              }
            }
          }}
          modifiers={[restrictToParentElement]}
        >
          <SortableContext
            items={questionOptions.map((field) => field.id)}
            strategy={extendedInfo ? rectSortingStrategy : verticalListSortingStrategy}
          >
            {extendedInfo ? (
              <ExtendedQuestionEditor index={index} questionOptions={questionOptions} append={append} remove={remove} />
            ) : (
              <SimpleQuestionEditor index={index} questionOptions={questionOptions} append={append} remove={remove} />
            )}
          </SortableContext>
        </DndContext>
      </DashboardBox>
    </div>
  )
}
