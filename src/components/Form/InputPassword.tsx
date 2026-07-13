import { Icon, Input, InputGroup } from '@chakra-ui/react'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { MdOutlineRemoveRedEye } from 'react-icons/md'
import { RiEyeCloseLine } from 'react-icons/ri'
import { Field } from '~components/ui/Field'

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
    <Field
      label={label}
      required={required}
      invalid={!!errors[formValue]}
      labelProps={{ fontWeight: 'medium' }}
      errorTextProps={{ mt: 2 }}
      errorText={errorMessage || t('form.error.generic', { defaultValue: 'Error performing the operation' })}
    >
      <InputGroup
        endElement={
          <Icon
            _hover={{ cursor: 'pointer' }}
            as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
            onClick={handleClick}
          />
        }
        endElementProps={{ display: 'flex', alignItems: 'center' }}
      >
        <Input {...register(formValue, validationRules)} type={inputType} placeholder={placeholder} required={false} />
      </InputGroup>
    </Field>
  )
}

export default InputPassword
