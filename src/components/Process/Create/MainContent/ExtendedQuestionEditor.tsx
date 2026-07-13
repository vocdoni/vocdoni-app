import { Box, Icon, IconButton, Input, SimpleGrid, Text, useSlotRecipe, VStack } from '@chakra-ui/react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuGripVertical, LuPlus, LuTrash2 } from 'react-icons/lu'
import { DashboardBox } from '~components/Dashboard/Contents'
import Editor from '~components/Editor'
import { ImageUploader } from '~components/Layout/Uploader'
import { useProcessTemplates } from '~components/Process/Create/TemplateProvider'
import { Field } from '~components/ui/Field'

const ExtendedQuestionEditor = ({
  index,
  questionOptions,
  append,
  remove,
}: {
  index: number
  questionOptions: any[]
  append: any
  remove: any
}) => {
  const { t } = useTranslation()
  const { activeTemplate, placeholders } = useProcessTemplates()
  const {
    register,
    formState: { errors },
    control,
  } = useFormContext()
  const choiceRecipe = useSlotRecipe({ key: 'QuestionChoice' })
  const cardStyles = choiceRecipe({ context: 'card', layout: 'grid' })

  return (
    <SimpleGrid columns={{ base: 1, lg: 2, xl: 3, '2xl': 4 }} gap={4}>
      {questionOptions.map((field, optionIndex) => (
        <SortableExtendedOption
          key={field.id}
          field={field}
          cardStyles={cardStyles}
          optionIndex={optionIndex}
          questionIndex={index}
          fieldsLength={questionOptions.length}
          onRemove={() => remove(optionIndex)}
          placeholders={placeholders}
          activeTemplate={activeTemplate}
          register={register}
          errors={errors}
          control={control}
          t={t}
        />
      ))}

      {/* Add new option card */}
      <DashboardBox
        onClick={() => append({ option: '', description: '' })}
        borderStyle='dashed'
        cursor='pointer'
        _hover={{ bg: 'bg.muted' }}
      >
        <VStack justify='center' align='center' height='100%'>
          <Icon as={LuPlus} boxSize={6} />
          <Text>{t('process_create.new_option', { defaultValue: 'Add option' })}</Text>
        </VStack>
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
  placeholders,
  activeTemplate,
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
          <Box
            {...attributes}
            {...listeners}
            cursor={isDragging ? 'grabbing' : 'grab'}
            position='absolute'
            top={2}
            left={2}
            zIndex='contents'
            p={1}
            borderRadius='md'
            color='fg.subtle'
            _hover={{ color: 'fg.muted', bg: 'bg.muted' }}
          >
            <Icon as={LuGripVertical} size='sm' />
          </Box>
        )}

        {/* Trash button */}
        {fieldsLength > 2 && (
          <IconButton
            aria-label={t('process_create.remove_option', { defaultValue: 'Remove option' })}
            size='sm'
            colorPalette='red'
            onClick={onRemove}
            position='absolute'
            top={2}
            right={2}
            zIndex='contents'
          >
            <Icon as={LuTrash2} />
          </IconButton>
        )}

        <Box data-choice-media>
          {/* Image uploader */}
          <ImageUploader name={`questions.${questionIndex}.options.${optionIndex}.image`} borderTopRadius='sm' />
        </Box>
        <Box data-choice-body>
          {/* Title */}
          <Field
            invalid={!!errors.questions?.[questionIndex]?.options?.[optionIndex]?.option}
            errorText={errors.questions?.[questionIndex]?.options?.[optionIndex]?.option?.message?.toString()}
          >
            <Input
              variant='borderless'
              placeholder={
                placeholders[activeTemplate]?.questions?.[questionIndex].options?.[optionIndex]?.option ??
                t('process_create.option.placeholder', 'Option {{number}}', {
                  number: optionIndex + 1,
                })
              }
              fontWeight='semibold'
              fontSize='md'
              _placeholder={{ fontWeight: 'semibold' }}
              {...register(`questions.${questionIndex}.options.${optionIndex}.option`, {
                required: t('form.error.required', 'This field is required'),
              })}
            />
          </Field>
          {/* Description */}
          <Controller
            name={`questions.${questionIndex}.options.${optionIndex}.description`}
            control={control}
            render={({ field }) => (
              <Editor
                onChange={field.onChange}
                variant='borderless'
                placeholder={
                  placeholders[activeTemplate]?.questions?.[questionIndex].options?.[optionIndex]?.description ??
                  t('process_create.option.description_placeholder', 'Project description')
                }
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
