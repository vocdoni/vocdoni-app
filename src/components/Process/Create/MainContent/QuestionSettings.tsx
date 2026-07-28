import { Box, FieldRoot as FormControl, HStack, Switch } from '@chakra-ui/react'
import { Controller, useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { Select } from '~components/Form/Select'
import { Process, SelectorTypes } from '../common'

interface SelectOption {
  value: SelectorTypes
  label: string
}

/**
 * Per-question type and presentation controls.
 *
 * Both settings used to be process-wide, but every question is published as its
 * own election, so a process can mix single- and multiple-choice questions, each
 * with its own plain or extended choice cards.
 */
export const QuestionSettings = ({ index }: { index: number }) => {
  const { t } = useTranslation()
  const { control, setValue } = useFormContext<Process>()

  return (
    <HStack gap={4} flexWrap='wrap' justifyContent='flex-end'>
      <FormControl width='auto' display='flex' flexDir='row'>
        <Controller
          name={`questions.${index}.extendedInfo`}
          control={control}
          render={({ field }) => (
            <Switch.Root
              id={`extended-info-${index}`}
              checked={!!field.value}
              onCheckedChange={(details) => field.onChange(details.checked)}
            >
              <Switch.HiddenInput />
              <Switch.Label>
                <Trans i18nKey='process.extended_info'>Extended info</Trans>
              </Switch.Label>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
            </Switch.Root>
          )}
        />
      </FormControl>
      <Box>
        <Controller
          control={control}
          name={`questions.${index}.type`}
          rules={{ required: t('form.error.field_is_required', 'This field is required') }}
          render={({ field }) => {
            const options: SelectOption[] = [
              { value: SelectorTypes.Single, label: t('process.question_type.single', 'Single choice') },
              { value: SelectorTypes.Multiple, label: t('process.question_type.multiple', 'Multiple choice') },
            ]

            const handleOnChange = (option: SelectOption) => {
              field.onChange(option?.value)
              // Choice limits only apply to multiple choice: drop the ones left
              // behind so they can't leak into the published question.
              if (option?.value === SelectorTypes.Single) {
                setValue(`questions.${index}.minNumberOfChoices`, null)
                setValue(`questions.${index}.maxNumberOfChoices`, null)
              }
            }

            return (
              <Select
                aria-label={t('process.question_type.label', 'Question type')}
                value={options.find((option) => option.value === field.value)}
                onChange={handleOnChange}
                options={options}
                placeholder={t('process.question_type.single', 'Single choice')}
                menuPortalTarget={document.body}
                chakraStyles={{ container: (p) => ({ ...p, width: 'max-content', maxWidth: '100%' }) }}
              />
            )
          }}
        />
      </Box>
    </HStack>
  )
}
