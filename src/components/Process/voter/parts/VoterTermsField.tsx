import { Checkbox, Field, Link } from '@chakra-ui/react'
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { useAppEnv } from '~src/app-env'

/** The terms checkbox an identify screen asks for first: required, linked to the terms and the privacy policy. */
export const VoterTermsField = <T extends FieldValues>({
  control,
  invalid,
}: {
  control: Control<T>
  invalid: boolean
}) => {
  const { t } = useTranslation()
  const { TERMS_OF_SERVICE_URL, PRIVACY_POLICY_URL } = useAppEnv()
  return (
    <Field.Root invalid={invalid}>
      <Controller
        name={'terms' as Path<T>}
        control={control}
        rules={{ required: true }}
        render={({ field: { value, onChange, onBlur, name } }) => (
          <Checkbox.Root
            size='ballot'
            alignItems='flex-start'
            gap='3'
            name={name}
            checked={value === true}
            onCheckedChange={(details) => onChange(details.checked === true)}
          >
            <Checkbox.HiddenInput onBlur={onBlur} />
            <Checkbox.Control mt='mark' />
            <Checkbox.Label>
              <Trans
                i18nKey='voter.identify.terms'
                components={{
                  terms: <Link href={TERMS_OF_SERVICE_URL} target='_blank' rel='noopener noreferrer' />,
                  privacy: <Link href={PRIVACY_POLICY_URL} target='_blank' rel='noopener noreferrer' />,
                }}
              />
            </Checkbox.Label>
          </Checkbox.Root>
        )}
      />
      {invalid && <Field.ErrorText>{t('voter.identify.terms_required')}</Field.ErrorText>}
    </Field.Root>
  )
}
