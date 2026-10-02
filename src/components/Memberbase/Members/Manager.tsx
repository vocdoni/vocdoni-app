import {
  Button,
  Drawer,
  Flex,
  FieldRoot as FormControl,
  FieldErrorText as FormErrorMessage,
  FieldHelperText as FormHelperText,
  FieldLabel as FormLabel,
  Input,
  NumberInput,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { useQueryClient } from '@tanstack/react-query'
import { useOrganization } from '@vocdoni/react-components'
import { cloneElement, useEffect, useMemo, useRef, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useToast } from '~components/Toast'
import { QueryKeys } from '~src/queries/keys'
import { Member, useAddMembers, useEditMember } from '~src/queries/members'
import { useTable } from '../TableProvider'

type MemberFormData = Record<string, string>

type MemberManagerProps = {
  control?: React.ReactElement<Record<string, unknown>>
  member?: Partial<Member> | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

type TriggerEvent = {
  defaultPrevented?: boolean
}

const stringifyObjectValues = (obj: Record<string, any>) =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, value === undefined || value === null ? '' : value.toString()])
  )

export const MemberManager = ({ control, member = null, open: controlledOpen, onOpenChange }: MemberManagerProps) => {
  const { t } = useTranslation()
  const toast = useToast()
  const { open: disclosureOpen, onOpen, onClose } = useDisclosure()
  const btnRef = useRef(null)
  const { columns } = useTable()
  const addMember = useAddMembers()
  const editMember = useEditMember()
  const { organization } = useOrganization()
  const queryClient = useQueryClient()
  // The stored phone is never returned, so the field starts blank and cannot show a clear as a
  // change; track edits to it explicitly so emptying it still reaches the API.
  const [phoneEdited, setPhoneEdited] = useState(false)
  const hadPhone = !!member?.phone

  const defaultValues: MemberFormData = useMemo(() => Object.fromEntries(columns.map((col) => [col.id, ''])), [columns])

  const methods = useForm({ defaultValues })
  // read during render so react-hook-form tracks it
  const { dirtyFields } = methods.formState
  const isControlled = typeof controlledOpen === 'boolean'
  const isOpen = isControlled ? controlledOpen : disclosureOpen

  const openDrawer = () => {
    if (isControlled) {
      onOpenChange?.(true)
      return
    }
    onOpen()
  }

  const closeDrawer = () => {
    if (isControlled) {
      onOpenChange?.(false)
      return
    }
    onClose()
  }

  const isEdit = Boolean(member)
  const isSubmitting = isEdit ? editMember.isPending : addMember.isPending

  const title = isEdit
    ? t('memberbase.edit_member.title', { defaultValue: 'Edit Member' })
    : t('memberbase.add_member.title', { defaultValue: 'Add Member' })

  const description = isEdit
    ? t('memberbase.edit_member.description', { defaultValue: 'Edit the member details below.' })
    : t('memberbase.add_member.description', { defaultValue: 'Fill in the member details below.' })

  const successToastMessage = isEdit
    ? t('memberbase.edit_member.success', { defaultValue: 'Member updated successfully!' })
    : t('memberbase.add_member.success', { defaultValue: 'Member added successfully!' })

  const errorToastMessage = isEdit
    ? t('memberbase.edit_member.error', { defaultValue: 'Error updating member.' })
    : t('memberbase.add_member.error', { defaultValue: 'Error adding member.' })

  const fieldValidations: Record<string, any> = {
    email: {
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: t('form.member.error.invalid_email', { defaultValue: 'Invalid email address' }),
      },
    },
    phone: {
      pattern: {
        value: /^\+?[1-9]\d{7,14}$/,
        message: t('form.member.error.invalid_phone', { defaultValue: 'Invalid phone number' }),
      },
    },
    birthDate: {
      validate: (value: string) => {
        if (!value) return true
        const selectedDate = new Date(value)
        const now = new Date()

        return (
          selectedDate <= now ||
          t('form.member.error.invalid_birth_date', { defaultValue: 'Birth date cannot be in the future' })
        )
      },
    },
  }

  /**
   * Syncs the form values with the selected member (edit mode only).
   *
   * The form is fully reset when the drawer opens or the selected member changes, so edits
   * abandoned with Cancel are discarded. When fresh data for the same member arrives while the
   * drawer is open, only the fields the user has not touched are refreshed.
   */
  const syncedMemberId = useRef<string | null>(null)
  useEffect(() => {
    if (!member || !isOpen) {
      syncedMemberId.current = null
      return
    }
    const isNewSession = syncedMemberId.current !== member.id
    syncedMemberId.current = member.id

    const cleanMember = { ...member }
    if (member.phone) {
      cleanMember.phone = ''
    }
    // the API omits emptied fields; fall back to blanks so a stale value is not left on screen
    const values = { ...defaultValues, ...stringifyObjectValues(cleanMember) }
    if (isNewSession) {
      setPhoneEdited(false)
      methods.reset(values)
    } else {
      methods.reset(values, { keepDirtyValues: true, keepErrors: true, keepIsSubmitted: true, keepSubmitCount: true })
    }
  }, [member, isOpen])

  const onSubmit = (data: Partial<Member>) => {
    const { id, memberNumber, name, surname, email, phone, nationalId, birthDate, weight } = data

    const memberPayload: Partial<Member> = stringifyObjectValues({
      id,
      memberNumber,
      name,
      surname,
      email,
      phone,
      nationalId,
      birthDate,
      weight,
    })

    const handleSuccess = () => {
      toast({
        title: successToastMessage,
        type: 'success',
        duration: 3000,
        isClosable: true,
      })
      methods.reset()
      setPhoneEdited(false)
      queryClient.invalidateQueries({
        queryKey: QueryKeys.organization.members(organization.address),
        exact: false,
      })
      closeDrawer()
    }

    const handleError = (error: Error) => {
      toast({
        title: errorToastMessage,
        description: error.message,
        type: 'error',
        duration: 3000,
        isClosable: true,
      })
    }

    if (isEdit) {
      const memberId = member?.id || id

      if (!memberId) {
        toast({
          title: errorToastMessage,
          description: t('memberbase.edit_member.missing_id', { defaultValue: 'Missing member id for update.' }),
          type: 'error',
          duration: 3000,
          isClosable: true,
        })
        return
      }

      // Send only what the user changed: the API keeps a field left out and clears one sent empty.
      // An untouched phone is blank in the form (it is never returned in plaintext), so it must
      // be left out rather than sent empty.
      const changes = Object.fromEntries(
        Object.entries(memberPayload).filter(
          ([key]) => key !== 'id' && (dirtyFields[key] || (key === 'phone' && hadPhone && phoneEdited))
        )
      )

      if (Object.keys(changes).length === 0) {
        closeDrawer()
        return
      }

      // TODO: drop once saas-backend#730 is deployed. Until the backend keeps an omitted weight, leaving it out resets it to 1, so always carry
      // the current one along.
      if (memberPayload.weight) changes.weight = memberPayload.weight

      editMember.mutate(
        { id: memberId, ...changes },
        {
          onSuccess: handleSuccess,
          onError: handleError,
        }
      )
      return
    }

    addMember.mutate([memberPayload], {
      onSuccess: handleSuccess,
      onError: handleError,
    })
  }

  const handleClose = () => {
    methods.clearErrors()
    closeDrawer()
  }

  const controlProps = (control?.props || {}) as {
    onClick?: (event: TriggerEvent) => void
  }

  const onClick = (event: TriggerEvent) => {
    controlProps.onClick?.(event)
    if (!event?.defaultPrevented) openDrawer()
  }

  return (
    <FormProvider {...methods}>
      {control && cloneElement(control, { ref: btnRef, onClick })}
      <Drawer.Root
        open={isOpen}
        placement='end'
        onOpenChange={({ open }) => (!open ? handleClose() : undefined)}
        finalFocusEl={btnRef ? () => btnRef.current : undefined}
        size='sm'
      >
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header display='flex' flexDirection='column' alignItems='start'>
              <Drawer.Title>{title}</Drawer.Title>
              <Text fontSize='sm' color='texts.subtle'>
                {description}
              </Text>
            </Drawer.Header>
            <Drawer.Body>
              <Stack as='form' id='member-form' gap={4} onSubmit={methods.handleSubmit(onSubmit)}>
                {columns.map((col) => {
                  const isPhone = col.id === 'phone'
                  const isBirthdate = col.id === 'birthDate'
                  const isWeighted = col.id === 'weight'

                  return (
                    <FormControl key={col.id} invalid={!!methods.formState.errors[col.id]}>
                      <FormLabel>{col.label}</FormLabel>
                      {isWeighted ? (
                        <Controller
                          name={col.id}
                          control={methods.control}
                          rules={fieldValidations[col.id]}
                          render={({ field }) => (
                            <NumberInput.Root
                              w='full'
                              value={field.value === '' ? '' : String(field.value ?? '')}
                              onValueChange={(details) => field.onChange(details.value)}
                            >
                              <NumberInput.Input />
                              <NumberInput.Control>
                                <NumberInput.IncrementTrigger />
                                <NumberInput.DecrementTrigger />
                              </NumberInput.Control>
                            </NumberInput.Root>
                          )}
                        />
                      ) : (
                        <Input
                          {...methods.register(col.id, {
                            ...(fieldValidations[col.id] || {}),
                            ...(isPhone && {
                              onChange: () => {
                                setPhoneEdited(true)
                              },
                            }),
                          })}
                          placeholder={hadPhone && isPhone ? '•••••••••••' : ''}
                          type={isBirthdate ? 'date' : isPhone ? 'tel' : 'text'}
                          required={false} // we don't want HTML5 validation
                        />
                      )}
                      {isPhone && hadPhone && phoneEdited && !methods.watch('phone') ? (
                        <FormHelperText color='fg.error'>
                          {t('memberbase.form.phone_will_be_removed', {
                            defaultValue: 'The stored phone number will be removed when you save.',
                          })}
                        </FormHelperText>
                      ) : isPhone && hadPhone ? (
                        <FormHelperText>
                          {t('memberbase.form.phone_warning', {
                            defaultValue: 'Phone number hidden. Any changes here will overwrite it.',
                          })}
                        </FormHelperText>
                      ) : null}
                      <FormErrorMessage mt={2}>
                        {methods.formState.errors[col.id]?.message?.toString() || 'Error performing the operation'}
                      </FormErrorMessage>
                    </FormControl>
                  )
                })}
              </Stack>
              <Flex justify='flex-end' gap={2} mt={4}>
                <Button variant='outline' onClick={handleClose}>
                  {t('memberbase.form.cancel', { defaultValue: 'Cancel' })}
                </Button>
                <Button type='submit' loading={isSubmitting} form='member-form'>
                  {t('memberbase.form.save', { defaultValue: 'Save changes' })}
                </Button>
              </Flex>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>
    </FormProvider>
  )
}
