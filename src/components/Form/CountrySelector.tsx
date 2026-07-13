import { GroupBase, Props } from 'chakra-react-select'
import countries from 'country-flag-emoji-json'
import { useMemo } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { Field } from '~components/ui/Field'
import { Select } from './Select'

type OptionType = {
  label: string
  value: string
}

type SelectProps = Props<OptionType, false, GroupBase<OptionType>>

export type CountryOptionType = OptionType & {
  flag: string
}

// Priority countries in the desired order
const priorityCountries = ['ES', 'FR', 'DE', 'GB', 'IT', 'US']

export const CountrySelector = ({ ...props }: Omit<SelectProps, 'options'>) => {
  const { t } = useTranslation()

  const {
    control,
    formState: { errors },
    setValue,
  } = useFormContext()

  const data = useMemo<CountryOptionType[]>(() => {
    const transformedCountries = countries.map((country) => ({
      label: country.name,
      value: country.code,
      flag: country.emoji,
    }))

    return transformedCountries.sort((a: CountryOptionType, b: CountryOptionType) => {
      const aIndex = priorityCountries.indexOf(a.value)
      const bIndex = priorityCountries.indexOf(b.value)

      // If both countries are priority countries, sort by priority order
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex
      }

      // If only a is a priority country, it comes first
      if (aIndex !== -1) return -1
      // If only b is a priority country, it comes first
      if (bIndex !== -1) return 1

      // For non-priority countries, sort alphabetically
      return a.label.localeCompare(b.label)
    })
  }, [])

  return (
    <Field
      invalid={!!errors?.country}
      required={true}
      label={<Trans i18nKey='country_selector.selector_label'>Country</Trans>}
      labelProps={{ htmlFor: 'country' }}
      errorText={errors?.country?.message.toString()}
      errorTextProps={{ mt: 2 }}
    >
      <Controller
        name='country'
        control={control}
        rules={{ required: t('form.error.field_is_required') }}
        render={({ field }) => (
          <Select
            options={data}
            value={data.find((opt) => opt.value === field.value)}
            getOptionLabel={(option) => `${(option as CountryOptionType).flag} ${option.label}`}
            onChange={(selectedOption) => {
              setValue('country', selectedOption?.value ?? '')
            }}
            isClearable={false}
            {...props}
            isRequired={false} // we don't want HTML5 validation
          />
        )}
      />
    </Field>
  )
}
