import {
  Box,
  FieldRoot as FormControl,
  FieldErrorText as FormErrorMessage,
  Icon,
  IconButton,
  Input,
  SimpleGrid,
  Text,
  useSlotRecipe,
  VStack,
} from '@chakra-ui/react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Control, Controller, useFormState } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { AddIcon, DeleteIcon, DragHandleIcon } from '~theme/icons'
import { DashboardBox } from '~components/Dashboard/Contents'
import Editor from '~components/Editor'
import { ImageUploader } from '~components/Layout/Uploader'
import { DragHandle } from '~components/ui/DragHandle'
import { Process } from '../common'

const ExtendedQuestionEditor = ({
  index,
  control,
  questionOptions,
  append,
  remove,
}: {
  index: number
  control: Control<Process>
  questionOptions: any[]
  append: any
  remove: any
}) => {
  const { t } = useTranslation()
  const { errors } = useFormState({ control, name: `questions.${index}.options` })
  const choiceRecipe = useSlotRecipe({ key: 'QuestionChoice' })
  const cardStyles = choiceRecipe({ context: 'card', layout: 'grid' })

  return (
    <SimpleGrid columns={{ base: 1, lg: 2, xl: 3, '2xl': 4 }} gap='4'>
      {questionOptions.map((field, optionIndex) => (
        <SortableExtendedOption
          key={field.id}
          field={field}
          cardStyles={cardStyles}
          optionIndex={optionIndex}
          questionIndex={index}
          fieldsLength={questionOptions.length}
          onRemove={() => remove(optionIndex)}
          register={control.register}
          errors={errors}
          control={control}
          t={t}
        />
      ))}

      {/* Add new option card */}
      <DashboardBox
        asChild
        borderStyle='[dashed]'
        cursor='button'
        focusVisibleRing='outside'
        _hover={{ bg: 'state.hover.bg' }}
      >
        <button type='button' onClick={() => append({ option: '', description: '' })}>
          {/* Spans: a button only takes phrasing content */}
          <VStack as='span' justify='center' align='center' height='[100%]'>
            <Icon as={AddIcon} boxSize='icon.lg' />
            <Text as='span'>{t('process_create.new_option', { defaultValue: 'Add option' })}</Text>
          </VStack>
        </button>
      </DashboardBox>
    </SimpleGrid>
  )
}

// SortableExtendedOption component for individual option cards
const SortableExtendedOption = ({
  field,
  cardStyles,
  optionIndex,
  questionIndex,
  fieldsLength,
  onRemove,
  register,
  errors,
  control,
  t,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Box css={cardStyles.wrapper} data-choice-card data-layout='grid' position='relative'>
        {/* Drag handle */}
        {fieldsLength > 1 && (
          <DragHandle {...attributes} {...listeners} placement='corner' dragging={isDragging}>
            <Icon as={DragHandleIcon} boxSize='icon.sm' />
          </DragHandle>
        )}

        {/* Trash button */}
        {fieldsLength > 2 && (
          <IconButton
            aria-label={t('process_create.remove_option', { defaultValue: 'Remove option' })}
            size='sm'
            colorPalette='danger'
            onClick={onRemove}
            position='absolute'
            top='2'
            right='2'
            zIndex='contents'
          >
            <Icon as={DeleteIcon} />
          </IconButton>
        )}

        <Box data-choice-media>
          {/* Image uploader */}
          <ImageUploader name={`questions.${questionIndex}.options.${optionIndex}.image`} borderTopRadius='sm' />
        </Box>
        <Box data-choice-body>
          {/* Title */}
          <FormControl invalid={!!errors.questions?.[questionIndex]?.options?.[optionIndex]?.option}>
            <Input
              variant='inline'
              placeholder={t('process_create.option.placeholder', 'Option {{number}}', {
                number: optionIndex + 1,
              })}
              fontWeight='semibold'
              fontSize='md'
              _placeholder={{ fontWeight: 'semibold' }}
              {...register(`questions.${questionIndex}.options.${optionIndex}.option`, {
                required: t('form.error.required', 'This field is required'),
              })}
            />
            <FormErrorMessage>
              {errors.questions?.[questionIndex]?.options?.[optionIndex]?.option?.message?.toString()}
            </FormErrorMessage>
          </FormControl>
          {/* Description */}
          <Controller
            name={`questions.${questionIndex}.options.${optionIndex}.description`}
            control={control}
            render={({ field }) => (
              <Editor
                onChange={field.onChange}
                variant='inline'
                placeholder={t('process_create.option.description_placeholder', 'Project description')}
                defaultValue={field.value}
              />
            )}
          />
        </Box>
      </Box>
    </div>
  )
}

export default ExtendedQuestionEditor
