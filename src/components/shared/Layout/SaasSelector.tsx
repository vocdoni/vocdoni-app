import {
  AlertRoot as Alert,
  Box,
  Flex,
  FieldRoot as FormControl,
  FieldErrorText as FormErrorMessage,
  FieldLabel as FormLabel,
  Icon,
  Text,
} from '@chakra-ui/react'
import { Props as SelectProps, chakraComponents } from 'chakra-react-select'
import { Controller, type ControllerProps, useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { LuEye, LuKey, LuUserRoundCog, LuUsers } from 'react-icons/lu'
import { Role, useOrganizationTypes, useRoles } from '~src/queries/organization'
import { Select } from '../Form/Select'

export type SelectOptionType = {
  label: string
  value: string
}

export type RoleOptionType = SelectOptionType & {
  organizationWritePermission: boolean
  processWritePermission: boolean
}

export type SelectCustomProps = {
  name: string
  label?: string
  required?: boolean
  controller?: Omit<ControllerProps, 'render' | 'name'>
  valueMode?: 'option' | 'value'
} & SelectProps

export const SelectCustom = ({
  name,
  label,
  placeholder,
  required = false,
  controller,
  valueMode = 'option',
  ...rest
}: SelectCustomProps) => {
  const { t } = useTranslation()

  const {
    control,
    formState: { errors },
    setValue,
  } = useFormContext()

  // Function to extract and format error messages
  const getErrorMessage = (error: any): string => {
    if (error && typeof error.message === 'string') {
      return error.message
    }
    return 'An error occurred'
  }

  return (
    <FormControl invalid={!!errors[name]} required={required}>
      {label && (
        <FormLabel htmlFor={name} display='flex' ms={1} fontSize='sm' fontWeight='500' mb={2}>
          {label}
        </FormLabel>
      )}
      <Controller
        {...controller}
        name={name}
        control={control}
        rules={{ required: required ? t('form.error.field_is_required') : false }}
        render={({ field }) => (
          <Select
            placeholder={t('form.choose_an_option', { defaultValue: 'Choose an option' })}
            getOptionLabel={(option: SelectOptionType) => {
              // If no label is set for the current option, find the corresponding label in the options array
              // This allows setting the value directly in form defaults without needing to know the label
              if (!option?.label) {
                const foundOption = (rest.options as SelectOptionType[]).find((opt) => opt?.value === option?.value)
                return foundOption?.label || option.value
              }
              return option.label
            }}
            isClearable={!required}
            isRequired={false} // we don't want HTML5 validation
            {...field}
            {...rest}
            value={
              valueMode === 'value'
                ? ((rest.options as SelectOptionType[] | undefined)?.find((opt) => opt?.value === field.value) ?? null)
                : field.value
            }
            onChange={(selectedOption) => {
              if (valueMode === 'value') {
                setValue(name, selectedOption?.value ?? '')
                return
              }
              setValue(name, selectedOption)
            }}
          />
        )}
      />
      <FormErrorMessage mt={2}>
        {getErrorMessage(errors[name]) || t('form.error.generic', { defaultValue: 'Error performing the operation' })}
      </FormErrorMessage>
    </FormControl>
  )
}

export const OrganizationTypeSelector = ({ ...props }: Omit<SelectCustomProps, 'options'>) => {
  const { t } = useTranslation()
  const { data = [], isLoading, isError, error } = useOrganizationTypes()
  const orgTypes: SelectOptionType[] = data.map((type: any) => ({
    label: type.name,
    value: type.type,
  }))

  if (isError)
    return (
      <Alert status='error'>
        {error?.message || t('error.loading_types', { defaultValue: 'Error loading organization types' })}
      </Alert>
    )

  return (
    <SelectCustom
      isLoading={isLoading}
      options={orgTypes}
      label={t('org_type_selector.selector_label', { defaultValue: 'Organization Type' })}
      valueMode='value'
      {...props}
    />
  )
}

export const MembershipSizeSelector = ({ defaultValue, ...props }: Omit<SelectCustomProps, 'options'>) => {
  const { t } = useTranslation()
  const listSizes: SelectOptionType[] = [
    { label: '0-100', value: '0-100' },
    { label: '101-1000', value: '101-1000' },
    { label: '1001-5000', value: '1001-5000' },
    { label: '5000+', value: '5000+' },
  ]

  return (
    <SelectCustom
      options={listSizes}
      label={t('membership_size.selector_label', { defaultValue: 'Membership Size' })}
      valueMode='value'
      {...props}
    />
  )
}

export const IssueTypeSelector = ({ defaultValue, ...props }: Omit<SelectCustomProps, 'options'>) => {
  const { t } = useTranslation()
  const listSizes: SelectOptionType[] = [
    { label: t('form.support.voting_issue', { defaultValue: 'Voting issue' }), value: 'voting-issue' },
    { label: t('form.support.billing_issue', { defaultValue: 'Billing issue' }), value: 'billing-issue' },
    { label: t('form.support.technical_issue', { defaultValue: 'Technical issue' }), value: 'technical-issue' },
    { label: t('form.support.custom_request', { defaultValue: 'Custom request' }), value: 'custom-request' },
    { label: t('form.support.other', { defaultValue: 'Other' }), value: 'other' },
  ]

  return (
    <SelectCustom
      options={listSizes}
      label={t('form.support.selector_label', { defaultValue: 'Type of Issue' })}
      {...props}
    />
  )
}

export const roleIcons: Record<string, JSX.Element> = {
  admin: <Icon as={LuKey} />,
  manager: <Icon as={LuUserRoundCog} />,
  viewer: <Icon as={LuEye} />,
  any: <Icon as={LuUsers} />,
}

const getRoleBadge = (role: Role) => {
  const hasOrgPermission = role.organizationWritePermission
  const hasProcessPermission = role.processWritePermission

  if (hasOrgPermission && hasProcessPermission) {
    return <Trans i18nKey='role.full_access.badge' defaults='(Full access)' />
  } else if (hasOrgPermission || hasProcessPermission) {
    return <Trans i18nKey='role.manage_members_votes.badge' defaults='(Manage members & votes)' />
  }

  return <Trans i18nKey='role.read_only.badge' defaults='(Read-only)' />
}

export const createRoleDisplay = (type: 'Option' | 'SingleValue') => {
  const BaseComponent = chakraComponents[type]

  return (props: any) => {
    const { data } = props

    const accessLabel = getRoleBadge(data)
    const icon = roleIcons[data.value]

    return (
      <BaseComponent {...props}>
        <Flex align='center' gap={2} alignItems='center'>
          <Box as='span' role='img'>
            {icon}
          </Box>
          <Text fontWeight='bold'>{data.label}</Text>
          <Text fontSize='sm' color='texts.subtle'>
            {accessLabel}
          </Text>
        </Flex>
      </BaseComponent>
    )
  }
}

export const RoleSelector = ({ ...props }: Omit<SelectCustomProps, 'options'>) => {
  const { t } = useTranslation()
  const { data = [], isLoading: rolesLoading, isError: rolesError, error: rolesFetchError } = useRoles()

  const roles: RoleOptionType[] = data.map((role: Role) => ({
    label: role.name,
    value: role.role,
    organizationWritePermission: role.organizationWritePermission,
    processWritePermission: role.processWritePermission,
  }))
  const defaultVal = roles.find((role: RoleOptionType) => role.value === 'viewer')

  if (rolesError) return <Alert status='error'>{rolesFetchError?.message || t('error.loading_roles')}</Alert>

  return (
    <SelectCustom
      isLoading={rolesLoading}
      options={roles}
      label={t('role_selector.selector_label', { defaultValue: 'Role' })}
      components={{ SingleValue: createRoleDisplay('SingleValue'), Option: createRoleDisplay('Option') }}
      defaultValue={defaultVal}
      controller={{ defaultValue: defaultVal }}
      menuPortalTarget={document.body}
      styles={{
        menuPortal: (base) => ({ ...base, zIndex: 1600 }),
      }}
      {...props}
    />
  )
}
