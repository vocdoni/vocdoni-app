import { Box, Text } from '@chakra-ui/react'
import { useEffect } from 'react'
import { Control, Controller, UseFormSetValue, useWatch } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { DashboardSection } from '~components/Dashboard/Contents'
import { Select } from '~components/Form/Select'
import { isValidMaxChoices, Process, SelectorTypes } from '../common'

const SelectionLimits = ({
  index,
  control,
  setValue,
}: {
  index: number
  control: Control<Process>
  setValue: UseFormSetValue<Process>
}) => {
  const { t } = useTranslation()
  const minName = `questions.${index}.minNumberOfChoices` as const
  const maxName = `questions.${index}.maxNumberOfChoices` as const
  const [questionType, fields, min, max] = useWatch({
    control,
    name: [`questions.${index}.type`, `questions.${index}.options`, minName, maxName],
  })
  const total = fields.length
  const options = fields.map((_, i) => ({ value: i + 1, label: `${i + 1}` }))

  useEffect(() => {
    // Ensure max is not less than min
    if (min && max && max < min) {
      setValue(maxName, min)
    }
    // Ensure min and max do not exceed total options
    if (min > total) {
      setValue(minName, total)
    }
    if (max > total) {
      setValue(maxName, total)
    }
  }, [min, max, total, minName, maxName, setValue])

  if (questionType === SelectorTypes.Single) return null

  return (
    <DashboardSection p='4' mb='4'>
      <Text fontWeight='medium' mb='1'>
        <Trans i18nKey='process.create.selectionLimits.title'>Selection limits:</Trans>
      </Text>
      <Text as='span' textStyle='body-sm'>
        <Trans
          i18nKey='process.create.selectionLimits.full'
          defaults='Voters must select at least  <min />  and at most  <max />  options.'
          components={{
            min: (
              <Controller
                name={minName}
                control={control}
                render={({ field, fieldState }) => {
                  const selectedOption = options.find((opt) => opt.value === field.value)

                  return (
                    <Box display='inline-block'>
                      <Select
                        {...field}
                        value={selectedOption}
                        options={options}
                        invalid={!!fieldState.invalid}
                        isClearable
                        onChange={(option) => field.onChange(option?.value)}
                        menuPortalTarget={document.body}
                        size='sm'
                      />
                    </Box>
                  )
                }}
              />
            ),
            max: (
              <Controller
                name={maxName}
                control={control}
                rules={{
                  required: false,
                  // Max equal to min ("choose exactly N") is a valid setup
                  validate: (value) =>
                    isValidMaxChoices(value, min) ||
                    t('form.error.max_greater_than_min', 'Max must be greater than or equal to Min'),
                }}
                render={({ field, fieldState }) => {
                  // Every max from the min upward is listed, so a set max never shows as the placeholder.
                  // The 0 a restored draft can carry means "no limit" and correctly shows the placeholder.
                  const maxOptions = options.filter((opt) => min == null || opt.value >= min)
                  const selectedOption = maxOptions.find((opt) => opt.value === field.value)

                  return (
                    <Box display='inline-block'>
                      <Select
                        {...field}
                        value={selectedOption}
                        options={maxOptions}
                        invalid={!!fieldState.invalid}
                        isClearable
                        onChange={(option) => field.onChange(option ? option?.value : null)}
                        menuPortalTarget={document.body}
                        size='sm'
                      />
                    </Box>
                  )
                }}
              />
            ),
          }}
        />
      </Text>
    </DashboardSection>
  )
}

export default SelectionLimits
