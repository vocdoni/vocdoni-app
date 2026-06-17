import {
  Box,
  FieldRoot as FormControl,
  FieldErrorText as FormErrorMessage,
  HStack,
  Icon,
  IconButton,
  Input,
  Separator,
  Text,
  VStack,
} from '@chakra-ui/react'
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
import { LuGripVertical, LuTrash2 } from 'react-icons/lu'
import Editor from '~components/Editor'
import { useProcessTemplates } from '~components/Process/Create/TemplateProvider'
import { Process } from '../common'
import { ELEVATION, SURFACE } from '../editor/surfaces'
import { editorBody, inputType, TABULAR } from '../editor/typography'
import { EASE, fadeUp } from '../VoterAuthentication/motion'
import ExtendedQuestionEditor from './ExtendedQuestionEditor'
import { QuestionFormat } from './QuestionFormat'
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
  const multiple = questions.length > 1

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: questionId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : undefined,
  }

  return (
    <Box ref={setNodeRef} style={style}>
      <Box
        position='relative'
        borderWidth='1px'
        borderColor={SURFACE.border}
        borderRadius='2xl'
        bg={SURFACE.surface}
        p={{ base: 4, md: 6 }}
        css={{ transition: `border-color 0.2s ${EASE}, box-shadow 0.2s ${EASE}` }}
        boxShadow={isDragging ? ELEVATION.drag : ELEVATION.rest}
        opacity={isDragging ? 0.92 : 1}
        _hover={{ boxShadow: isDragging ? undefined : ELEVATION.hover }}
      >
        {/* Subtle drag handle in the top-left corner (mirrors the delete top-right) */}
        {multiple && (
          <Box
            {...attributes}
            {...listeners}
            position='absolute'
            top={2}
            left={2}
            p={1}
            borderRadius='md'
            lineHeight={0}
            cursor={isDragging ? 'grabbing' : 'grab'}
            color='gray.300'
            opacity={0.45}
            css={{ transition: `color 0.15s ${EASE}, opacity 0.15s ${EASE}, background-color 0.15s ${EASE}` }}
            _hover={{ color: 'texts.primary', opacity: 1, bg: 'auth.bg' }}
            aria-label={t('process_create.question.drag', { defaultValue: 'Drag to reorder' })}
          >
            <Icon as={LuGripVertical} boxSize={3.5} />
          </Box>
        )}

        <HStack align='start' gap={3}>
          {/* number badge */}
          <VStack gap={1} align='center' pt={1}>
            <Box
              boxSize={7}
              borderRadius='full'
              bg={SURFACE.inset}
              color='texts.primary'
              fontSize='14px'
              fontWeight={600}
              css={TABULAR}
              display='flex'
              alignItems='center'
              justifyContent='center'
              flexShrink={0}
            >
              {index + 1}
            </Box>
          </VStack>

          <VStack flex='1' align='stretch' gap={1} minW={0}>
            <FormControl invalid={!!errors.questions?.[index]?.title}>
              <Input
                placeholder={
                  placeholders[activeTemplate]?.questions?.[index]?.title ??
                  t('process_create.question.title.placeholder', { defaultValue: 'Ask a question…' })
                }
                variant='borderless'
                px={0}
                css={{ textWrap: 'balance' }}
                {...inputType.questionTitle}
                {...register(`questions.${index}.title`, {
                  required: t('form.error.required', { defaultValue: 'This field is required' }),
                })}
              />
              <FormErrorMessage>{errors.questions?.[index]?.title?.message?.toString()}</FormErrorMessage>
            </FormControl>
            <Controller
              name={`questions.${index}.description`}
              control={control}
              render={({ field }) => (
                <Editor
                  onChange={field.onChange}
                  variant='borderless'
                  typography={editorBody.questionDescription}
                  placeholder={
                    placeholders[activeTemplate]?.questions?.[index]?.description ??
                    t('process_create.question.description.placeholder', {
                      defaultValue: 'Add context for voters (optional)',
                    })
                  }
                  defaultValue={field.value}
                />
              )}
            />
          </VStack>

          {multiple && (
            <IconButton
              aria-label={t('process_create.question.remove', { defaultValue: 'Remove question' })}
              size='sm'
              variant='ghost'
              color='gray.400'
              _hover={{ color: 'red.500', bg: 'red.50' }}
              onClick={() => onRemove(index)}
            >
              <Icon as={LuTrash2} />
            </IconButton>
          )}
        </HStack>

        <Separator my={4} borderColor='table.border' />

        <Box key={extendedInfo ? 'cards' : 'text'} css={{ animation: `${fadeUp} 0.24s ${EASE} both` }}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => {
              const { active, over } = event
              if (over && active.id !== over.id) {
                const oldIndex = questionOptions.findIndex((field) => field.id === active.id)
                const newIndex = questionOptions.findIndex((field) => field.id === over.id)
                if (oldIndex !== -1 && newIndex !== -1) move(oldIndex, newIndex)
              }
            }}
            modifiers={[restrictToParentElement]}
          >
            <SortableContext
              items={questionOptions.map((field) => field.id)}
              strategy={extendedInfo ? rectSortingStrategy : verticalListSortingStrategy}
            >
              {extendedInfo ? (
                <ExtendedQuestionEditor
                  index={index}
                  questionOptions={questionOptions}
                  append={append}
                  remove={remove}
                />
              ) : (
                <SimpleQuestionEditor index={index} questionOptions={questionOptions} append={append} remove={remove} />
              )}
            </SortableContext>
          </DndContext>
        </Box>

        <QuestionFormat index={index} />
      </Box>
    </Box>
  )
}
