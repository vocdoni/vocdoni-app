import { IconButton, Input, useDisclosure, VStack } from '@chakra-ui/react'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuPencil } from 'react-icons/lu'
import { ApiEndpoints } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import { ModalForm, useModalForm } from '~components/Form/ModalForm'
import { useToast } from '~components/Toast'
import { Field } from '~components/ui/Field'

interface PasswordFormData {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

interface UpdatePasswordParams {
  oldPassword: string
  newPassword: string
}

const useUpdatePassword = () => {
  const { bearedFetch } = useAuth()

  return useMutation<void, Error, UpdatePasswordParams>({
    mutationFn: (params) =>
      bearedFetch<void>(ApiEndpoints.Password, {
        method: 'PUT',
        body: params,
      }),
  })
}

interface PasswordFormProps {
  onSuccess?: () => void
}

const PasswordForm = ({ onSuccess }: PasswordFormProps) => {
  const { t } = useTranslation()
  const toast = useToast()
  const updatePassword = useUpdatePassword()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormData>()

  const { formRef, setIsSubmitting, onClose } = useModalForm()

  useEffect(() => {
    setIsSubmitting(isSubmitting)
  }, [isSubmitting, setIsSubmitting])

  const onSubmit = async (data: PasswordFormData) => {
    try {
      await updatePassword.mutateAsync({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      })

      toast({
        title: t('password_update.success', { defaultValue: 'Password updated successfully' }),
        type: 'success',
      })
      reset()
      onSuccess?.()
      onClose()
    } catch (error) {
      toast({
        title: t('password_update.error', { defaultValue: 'Failed to update password' }),
        type: 'error',
      })
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.stopPropagation()
        handleSubmit(onSubmit)(e)
      }}
      ref={formRef}
    >
      <VStack gap={6} align='stretch'>
        <Field
          invalid={!!errors.oldPassword}
          label={t('password_update.old.label', { defaultValue: 'Current Password' })}
          errorText={errors.oldPassword?.message}
        >
          <Input
            type='password'
            {...register('oldPassword', {
              required: t('password_update.old.required', { defaultValue: 'Current password is required' }),
            })}
          />
        </Field>

        <Field
          invalid={!!errors.newPassword}
          label={t('password_update.new.label', { defaultValue: 'New Password' })}
          errorText={errors.newPassword?.message}
        >
          <Input
            type='password'
            {...register('newPassword', {
              required: t('password_update.new.required', { defaultValue: 'Password is required' }),
              minLength: {
                value: 8,
                message: t('password_update.new.minLength', { defaultValue: 'Password must be at least 8 characters' }),
              },
            })}
          />
        </Field>
      </VStack>
    </form>
  )
}

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

const ChangePasswordModal = ({ isOpen, onClose }: ChangePasswordModalProps) => {
  const { t } = useTranslation()

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      title={t('change_password.title', { defaultValue: 'Change password' })}
      subtitle={t('change_password.subtitle', {
        defaultValue: 'Enter your current password and a new password to update your credentials.',
      })}
      submitText={t('password_update.actions.save', { defaultValue: 'Save Password' })}
    >
      <PasswordForm />
    </ModalForm>
  )
}

export const ChangePasswordButton = () => {
  const { t } = useTranslation()
  const { open: isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <IconButton
        onClick={onOpen}
        aria-label={t('change_password.title', { defaultValue: 'Change password' })}
        variant={'outline'}
        size='sm'
        w='40px'
        h='40px'
      >
        <LuPencil />
      </IconButton>
      <ChangePasswordModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}
