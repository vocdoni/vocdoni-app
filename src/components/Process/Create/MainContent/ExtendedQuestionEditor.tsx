import {
  Box,
  chakra,
  FieldRoot as FormControl,
  FieldErrorText as FormErrorMessage,
  Grid,
  Icon,
  IconButton,
  Input,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useEffect, useRef } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuGripVertical, LuPlus, LuTrash2 } from 'react-icons/lu'
import Editor from '~components/Editor'
import { ImageUploader } from '~components/Layout/Uploader'
import { useProcessTemplates } from '~components/Process/Create/TemplateProvider'
import { ELEVATION, SURFACE } from '../editor/surfaces'
import { editorBody, inputType, textType } from '../editor/typography'
import { EASE } from '../VoterAuthentication/motion'

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
  const gridRef = useRef<HTMLDivElement>(null)
  const prevLen = useRef(questionOptions.length)

  // Focus the new option's title when a card is added.
  useEffect(() => {
    if (questionOptions.length > prevLen.current && gridRef.current) {
      const inputs = gridRef.current.querySelectorAll<HTMLInputElement>('[data-choice-body] input')
      inputs[inputs.length - 1]?.focus()
    }
    prevLen.current = questionOptions.length
  }, [questionOptions.length])

  return (
    // Columns derive from the container width (not the viewport) so cards keep a
    // sensible ~180px+ width inside the narrow editor column instead of getting
    // squeezed into 4 skinny, elongated columns. auto-fill (not auto-fit) reserves
    // empty tracks so a lone wrapped card doesn't stretch full-width.
    <Grid ref={gridRef} templateColumns='repeat(auto-fill, minmax(180px, 1fr))' gap={4}>
      {questionOptions.map((field, optionIndex) => (
        <SortableExtendedOption
          key={field.id}
          field={field}
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
      <chakra.button
        type='button'
        onClick={() => append({ option: '', description: '' })}
        display='flex'
        flexDirection='column'
        alignItems='center'
        justifyContent='center'
        gap={2}
        minH='180px'
        borderRadius='2xl'
        borderWidth='1px'
        borderStyle='dashed'
        borderColor='table.border'
        color='texts.subtle'
        css={{ transition: `border-color 0.15s ${EASE}, color 0.15s ${EASE}, background-color 0.15s ${EASE}` }}
        _hover={{ borderColor: 'gray.400', color: 'texts.primary', bg: 'auth.bg' }}
      >
        <Icon as={LuPlus} boxSize={6} />
        <Text {...textType.addAffordance}>{t('process_create.new_option', { defaultValue: 'Add option' })}</Text>
      </chakra.button>
    </Grid>
  )
}

const SortableExtendedOption = ({
  field,
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
    zIndex: isDragging ? 2 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Box
        data-choice-card
        data-layout='grid'
        position='relative'
        borderWidth='1px'
        borderColor={SURFACE.border}
        borderRadius='2xl'
        overflow='hidden'
        bg={SURFACE.surface}
        css={{ transition: `border-color 0.18s ${EASE}, box-shadow 0.18s ${EASE}` }}
        boxShadow={isDragging ? ELEVATION.drag : ELEVATION.rest}
        _hover={{ boxShadow: isDragging ? undefined : ELEVATION.hover }}
      >
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
            p={1.5}
            borderRadius='md'
            bg='blackAlpha.500'
            color='white'
            lineHeight={0}
            _hover={{ bg: 'blackAlpha.700' }}
            css={{ transition: `background-color 0.15s ${EASE}` }}
          >
            <Icon as={LuGripVertical} boxSize={4} />
          </Box>
        )}

        {/* Remove */}
        {fieldsLength > 2 && (
          <IconButton
            aria-label={t('process_create.remove_option', { defaultValue: 'Remove option' })}
            size='sm'
            variant='solid'
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
          <ImageUploader name={`questions.${questionIndex}.options.${optionIndex}.image`} borderTopRadius='sm' />
        </Box>
        <Box data-choice-body p={4}>
          <FormControl invalid={!!errors.questions?.[questionIndex]?.options?.[optionIndex]?.option}>
            <Input
              variant='borderless'
              px={0}
              {...inputType.optionTitle}
              placeholder={
                placeholders[activeTemplate]?.questions?.[questionIndex].options?.[optionIndex]?.option ??
                t('process_create.option.placeholder', { defaultValue: 'Option {{number}}', number: optionIndex + 1 })
              }
              {...register(`questions.${questionIndex}.options.${optionIndex}.option`, {
                required: t('form.error.required', { defaultValue: 'This field is required' }),
              })}
            />
            <FormErrorMessage>
              {errors.questions?.[questionIndex]?.options?.[optionIndex]?.option?.message?.toString()}
            </FormErrorMessage>
          </FormControl>
          <Controller
            name={`questions.${questionIndex}.options.${optionIndex}.description`}
            control={control}
            render={({ field }) => (
              <Editor
                onChange={field.onChange}
                variant='borderless'
                typography={editorBody.optionDescription}
                placeholder={
                  placeholders[activeTemplate]?.questions?.[questionIndex].options?.[optionIndex]?.description ??
                  t('process_create.option.description_placeholder', {
                    defaultValue: 'Describe this option (optional)',
                  })
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
