import {
  Box,
  chakra,
  FieldRoot as FormControl,
  FieldErrorText as FormErrorMessage,
  Icon,
  IconButton,
  Input,
} from '@chakra-ui/react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useEffect, useRef } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuGripVertical, LuPlus, LuX } from 'react-icons/lu'
import { useProcessTemplates } from '~components/Process/Create/TemplateProvider'
import { SelectorTypes } from '../common'
import { inputType, textType } from '../editor/typography'
import { EASE } from '../VoterAuthentication/motion'

const SimpleQuestionEditor = ({
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
    watch,
  } = useFormContext()
  const questionType = watch('questionType')
  const containerRef = useRef<HTMLDivElement>(null)
  const prevLen = useRef(questionOptions.length)

  // Focus the freshly added option so adding flows without reaching for the mouse.
  useEffect(() => {
    if (questionOptions.length > prevLen.current && containerRef.current) {
      const inputs = containerRef.current.querySelectorAll<HTMLInputElement>('[data-choice-card] input')
      inputs[inputs.length - 1]?.focus()
    }
    prevLen.current = questionOptions.length
  }, [questionOptions.length])

  return (
    <Box ref={containerRef} display='flex' flexDirection='column' gap={1}>
      {questionOptions.map((field, optionIndex) => (
        <SortableOption
          key={field.id}
          field={field}
          optionIndex={optionIndex}
          questionIndex={index}
          questionType={questionType}
          fieldsLength={questionOptions.length}
          onRemove={() => remove(optionIndex)}
          placeholders={placeholders}
          activeTemplate={activeTemplate}
          register={register}
          errors={errors}
          t={t}
        />
      ))}
      <chakra.button
        type='button'
        aria-label={t('process_create.new_option', { defaultValue: 'Add option' })}
        onClick={() => append({ option: '' })}
        alignSelf='flex-start'
        display='inline-flex'
        alignItems='center'
        gap={2}
        mt={1}
        px={2}
        py={2}
        borderRadius='lg'
        color='texts.subtle'
        {...textType.addAffordance}
        css={{ transition: `color 0.15s ${EASE}, background-color 0.15s ${EASE}` }}
        _hover={{ color: 'texts.primary', bg: 'auth.bg' }}
      >
        <Icon as={LuPlus} boxSize={4} />
        {t('process_create.new_option', { defaultValue: 'Add option' })}
      </chakra.button>
    </Box>
  )
}

const SortableOption = ({
  field,
  optionIndex,
  questionIndex,
  questionType,
  fieldsLength,
  onRemove,
  placeholders,
  activeTemplate,
  register,
  errors,
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
      <Box
        data-choice-card
        display='flex'
        alignItems='center'
        gap={2.5}
        px={2}
        py={1}
        borderRadius='lg'
        css={{ transition: `background-color 0.15s ${EASE}` }}
        _hover={{ bg: 'auth.bg' }}
      >
        {fieldsLength > 1 && (
          <Box
            {...attributes}
            {...listeners}
            cursor={isDragging ? 'grabbing' : 'grab'}
            color='gray.300'
            _hover={{ color: 'texts.primary' }}
            css={{ transition: `color 0.15s ${EASE}` }}
            lineHeight={0}
            flexShrink={0}
          >
            <Icon as={LuGripVertical} boxSize={4} />
          </Box>
        )}

        <Box
          data-choice-control
          boxSize={4}
          borderWidth='2px'
          borderColor='gray.300'
          borderRadius={questionType === SelectorTypes.Single ? 'full' : 'xs'}
          flexShrink={0}
          css={{ transition: `border-radius 0.25s ${EASE}` }}
        />

        <Box flex={1} minW={0}>
          <FormControl invalid={!!errors.questions?.[questionIndex]?.options?.[optionIndex]?.option}>
            <Input
              variant='borderless'
              px={0}
              {...inputType.optionText}
              placeholder={
                placeholders[activeTemplate]?.questions?.[questionIndex]?.options?.[optionIndex]?.option ??
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
        </Box>

        {fieldsLength > 2 && (
          <IconButton
            aria-label={t('process_create.option.remove', { defaultValue: 'Remove option' })}
            onClick={onRemove}
            size='xs'
            variant='ghost'
            color='gray.400'
            _hover={{ color: 'red.500', bg: 'red.50' }}
            flexShrink={0}
          >
            <Icon as={LuX} />
          </IconButton>
        )}
      </Box>
    </div>
  )
}

export default SimpleQuestionEditor
