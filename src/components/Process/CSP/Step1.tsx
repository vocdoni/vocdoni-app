import {
  AlertRoot as Alert,
  AlertDescription,
  AlertIndicator,
  Button,
  FieldErrorText,
  FieldHelperText,
  FieldRoot,
  PinInputControl,
  PinInputHiddenInput,
  PinInputInput,
  PinInputRoot,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Controller, useForm } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { useToast } from '~components/Toast'
import { useCspAuthContext } from './CSPStepsProvider'
import { useCspAuth1, useCspResend } from './basics'

// Define the form data structure
type CSPStep1FormData = {
  code: string[]
}

export const Step1Base = () => {
  const { authData } = useCspAuthContext()
  const resend = useCspResend()
  const { t } = useTranslation()
  const toast = useToast()
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CSPStep1FormData>({
    defaultValues: {
      code: Array.from({ length: 6 }, () => ''),
    },
  })
  const auth = useCspAuth1()

  const handleResend = async () => {
    try {
      // The pending auth token lives in the process session; only the contact
      // destination is ours to provide.
      await resend.mutateAsync({
        email: authData.email,
        phone: authData.phone,
      })
      toast({
        title: t('csp.step1.resend_success', { defaultValue: 'Code resent successfully' }),
        type: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('csp.step1.resend_failed', { defaultValue: 'Failed to resend code' })
      toast({
        title: t('csp.step1.resend_failed', { defaultValue: 'Failed to resend code' }),
        description: errorMessage,
        type: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const onSubmit = async (values: CSPStep1FormData) => {
    const code = values.code.join('')

    try {
      // auth1 verifies the challenge and marks the voter connected in the
      // process session — no token juggling on our side.
      await auth.mutateAsync(code)

      toast({
        title: t('csp.auth_success', { defaultValue: 'Authentication successful' }),
        type: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('csp.auth_failed', { defaultValue: 'Authentication failed' })
      toast({
        title: t('csp.auth_failed', { defaultValue: 'Authentication failed' }),
        description: errorMessage,
        type: 'error',
        duration: 3000,
        isClosable: true,
      })
      console.error('Authentication failed:', error)
    }
  }

  return (
    <VStack gap={6} align='stretch' w='full'>
      <Text fontWeight='medium'>{t('csp.step1.subtitle', { defaultValue: 'Enter the verification code' })}</Text>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack gap={5} align='stretch'>
          <FieldRoot invalid={!!errors.code}>
            <Controller
              control={control}
              name='code'
              rules={{
                required: t('csp.step1.validation.required', {
                  defaultValue: 'Code is required',
                }),
                validate: (value) =>
                  value.filter((digit) => digit.trim() !== '').length >= 6 ||
                  t('csp.step1.validation.length', {
                    defaultValue: 'Code must be 6 digits',
                  }),
              }}
              render={({ field: { onChange, value } }) => {
                const pinValue = Array.isArray(value) ? value : Array.from({ length: 6 }, () => '')

                return (
                  <PinInputRoot
                    size='lg'
                    value={pinValue}
                    onValueChange={({ value: valueArray, valueAsString }) => {
                      const nextValue = Array.isArray(valueArray)
                        ? Array.from({ length: 6 }, (_, index) => valueArray[index] ?? '')
                        : Array.from({ length: 6 }, (_, index) => valueAsString[index] ?? '')

                      onChange(nextValue)
                      if (nextValue.every((digit) => digit.trim() !== '')) {
                        handleSubmit(onSubmit)()
                      }
                    }}
                    autoFocus
                    count={6}
                  >
                    <PinInputHiddenInput />
                    <PinInputControl w='full' gap={3}>
                      {Array.from({ length: 6 }).map((_, index) => (
                        <PinInputInput key={index} index={index} />
                      ))}
                    </PinInputControl>
                  </PinInputRoot>
                )
              }}
            />
            {errors.code && <FieldErrorText textAlign='center'>{errors.code.message}</FieldErrorText>}
            <FieldHelperText mt={3}>
              <VStack gap={2} align='stretch'>
                <Text>
                  <Trans i18nKey='csp.step1.helper_text'>
                    We've sent a code to your phone number or email address. If you chose to receive it by email, please
                    check your spam folder.
                  </Trans>
                </Text>
                <Text>
                  <Trans
                    i18nKey='csp.step1.resend_text'
                    defaults="Didn't receive the code? <resendBtn>Resend it</resendBtn>"
                    components={{
                      resendBtn: (
                        <Button
                          variant='link'
                          verticalAlign='unset'
                          loading={resend.isPending}
                          onClick={handleResend}
                        />
                      ),
                    }}
                  />
                </Text>
              </VStack>
            </FieldHelperText>
          </FieldRoot>
          {auth.isError && (
            <Alert status='error'>
              <AlertIndicator />
              <AlertDescription>{auth.error.message}</AlertDescription>
            </Alert>
          )}

          <Button type='submit' w='full' loading={auth.isPending}>
            {t('csp.authenticate', { defaultValue: 'Authenticate' })}
          </Button>
          <Text fontSize='sm' color='texts.subtle'>
            {t('csp.step1.footer_text', {
              defaultValue: 'If you experience any issues, contact your organization.',
            })}
          </Text>
        </VStack>
      </form>
    </VStack>
  )
}
