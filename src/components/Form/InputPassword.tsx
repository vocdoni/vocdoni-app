import {
  FieldRoot as FormControl,
  FieldErrorText as FormErrorMessage,
  FieldLabel as FormLabel,
  Icon,
  Input,
  InputGroup,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LegacyPasswordHideIcon, LegacyPasswordViewIcon } from '~theme/icons'

export interface InputPasswordProps {
  formValue: string
  label: string
  placeholder?: string
  type?: string
  required?: boolean
  validation?: any
  messageError?: string
}
const InputPassword = ({
  formValue,
  label,
  placeholder,
  type = 'password',
  required = false,
  validation = {},
}: InputPasswordProps) => {
  const { t } = useTranslation()
  const [show, setShow] = useState(false)
  const handleClick = () => setShow(!show)

  const {
    register,
    formState: { errors },
  } = useFormContext()

  const validationRules = {
    ...validation,
    ...(required ? { required: { value: true, message: t('form.error.field_is_required') } } : {}),
  }

  const errorMessage = errors[formValue]?.message?.toString() || ''

  let inputType = type

  if (type === 'password' && show) {
    inputType = 'text'
  }

  return (
    <FormControl invalid={!!errors[formValue]} required={required}>
      {label && <FormLabel fontSize='sm'>{label}</FormLabel>}
      <InputGroup
        endElement={
          <Icon
            _hover={{ cursor: 'pointer' }}
            as={show ? LegacyPasswordHideIcon : LegacyPasswordViewIcon}
            onClick={handleClick}
          />
        }
        endElementProps={{ display: 'flex', alignItems: 'center' }}
      >
        <Input {...register(formValue, validationRules)} type={inputType} placeholder={placeholder} required={false} />
      </InputGroup>
      <FormErrorMessage mt={2}>
        {errorMessage || t('form.error.generic', { defaultValue: 'Error performing the operation' })}
      </FormErrorMessage>
    </FormControl>
  )
}

export default InputPassword
