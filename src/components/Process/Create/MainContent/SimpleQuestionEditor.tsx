import {
  Box,
  Button,
  Checkbox,
  FieldRoot as FormControl,
  FieldErrorText as FormErrorMessage,
  HStack,
  Icon,
  IconButton,
  Input,
  Text,
  useSlotRecipe,
  VStack,
} from '@chakra-ui/react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { LuGripVertical, LuPlus, LuX } from 'react-icons/lu'
import { useProcessTemplates } from '~components/Process/Create/TemplateProvider'
import { SelectorTypes } from '../common'

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
  const choiceRecipe = useSlotRecipe({ key: 'QuestionChoice' })
  const cardStyles = choiceRecipe({ context: 'plain', layout: 'list' })

  return (
    <VStack align='stretch' gap={2}>
      {questionOptions.map((field, optionIndex) => (
        <SortableOption
          key={field.id}
          field={field}
          cardStyles={cardStyles}
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
      <Button
        variant='ghost'
        size='sm'
        aria-label={t('process_create.new_option', { defaultValue: 'Add option' })}
        onClick={() => append({ option: '' })}
        alignSelf='flex-start'
      >
        <HStack gap={2}>
          <Icon as={LuPlus} />
          <Text as='span'>
            <Trans i18nKey='process_create.new_option'>Add option</Trans>
          </Text>
        </HStack>
      </Button>
    </VStack>
  )
}

// SortableOption component for individual options
const SortableOption = ({
  field,
  cardStyles,
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
      <Box css={cardStyles.wrapper} data-choice-card data-layout='list'>
        {/* Drag handle for options */}
        {fieldsLength > 1 && (
          <Box
            {...attributes}
            {...listeners}
            cursor={isDragging ? 'grabbing' : 'grab'}
            display='flex'
            alignItems='center'
            color='fg.subtle'
            _hover={{ color: 'fg.muted' }}
          >
            <Icon as={LuGripVertical} size='sm' />
          </Box>
        )}

        {questionType === SelectorTypes.Single ? (
          <Box data-choice-control boxSize={4} border='1px solid' borderColor='border.emphasized' borderRadius='full' />
        ) : (
          <Checkbox.Root checked={false} readOnly tabIndex={-1}>
            <Checkbox.HiddenInput />
            <Checkbox.Control data-choice-control>
              <Checkbox.Indicator />
            </Checkbox.Control>
          </Checkbox.Root>
        )}
        <Box data-choice-body>
          <FormControl invalid={!!errors.questions?.[questionIndex]?.options?.[optionIndex]?.option}>
            <Input
              placeholder={
                placeholders[activeTemplate]?.questions?.[questionIndex]?.options?.[optionIndex]?.option ??
                t('process_create.option.placeholder', 'Option {{number}}', {
                  number: optionIndex + 1,
                })
              }
              {...register(`questions.${questionIndex}.options.${optionIndex}.option`, {
                required: t('form.error.required', 'This field is required'),
              })}
            />
            <FormErrorMessage>
              {errors.questions?.[questionIndex]?.options?.[optionIndex]?.option?.message?.toString()}
            </FormErrorMessage>
          </FormControl>
        </Box>
        {fieldsLength > 2 && (
          <IconButton
            aria-label={t('process_create.option.remove', 'Remove option')}
            onClick={onRemove}
            size='sm'
            variant='ghost'
          >
            <Icon as={LuX} />
          </IconButton>
        )}
      </Box>
    </div>
  )
}

export default SimpleQuestionEditor
