import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  HStack,
  Link,
  PinInput,
  PinInputField,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react'
import { useElection } from '@vocdoni/react-providers'
import { PublishedElection } from '@vocdoni/sdk'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { useCspAuthContext } from './CSPStepsProvider'
import { useTwoFactorAuth } from './basics'

// Define the form data structure
type CSPStep1FormData = {
  code: string
}

const resendCooldown = 45 // seconds

export const Step1Base = ({ election, onAuthSuccess }: { election: PublishedElection; onAuthSuccess?: () => void }) => {
  const { authData } = useCspAuthContext()
  const {
    actions: { csp1 },
  } = useElection()
  const { t } = useTranslation()
  const toast = useToast()
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<CSPStep1FormData>({
    defaultValues: {
      code: '',
    },
  })
  const auth = useTwoFactorAuth<1>(election, 1)
  const resendAuth = useTwoFactorAuth<0>(election, 0)
  const canResend = Boolean(authData?.step0Request)
  const [cooldownSeconds, setCooldownSeconds] = useState(resendCooldown)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : prev))
    }, 1000)

    return () => {
      window.clearInterval(interval)
    }
  }, [])

  const onSubmit = async (values: CSPStep1FormData) => {
    try {
      const { authToken } = await auth.mutateAsync({
        authToken: authData.authToken,
        authData: [values.code],
      })

      csp1(authToken)
      toast({
        title: t('csp.auth_success', { defaultValue: 'Authentication successful' }),
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      onAuthSuccess?.()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('csp.auth_failed', { defaultValue: 'Authentication failed' })
      toast({
        title: t('csp.auth_failed', { defaultValue: 'Authentication failed' }),
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      console.error('Authentication failed:', error)
    }
  }

  const onResend = async () => {
    if (!canResend) return
    try {
      await resendAuth.mutateAsync(authData.step0Request)
      toast({
        title: t('csp.code_sent', { defaultValue: 'Verification code sent' }),
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      reset({ code: '' })
      setCooldownSeconds(resendCooldown)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('csp.auth_failed', { defaultValue: 'Authentication failed' })
      toast({
        title: t('csp.auth_failed', { defaultValue: 'Authentication failed' }),
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      console.error('Re-send failed:', error)
    }
  }

  return (
    <VStack spacing={4} align='stretch' w='full' as='form' onSubmit={handleSubmit(onSubmit)}>
      <Text fontWeight='semibold'>{t('csp.step1.title', { defaultValue: 'Enter the unique code:' })}</Text>
      <FormControl isInvalid={!!errors.code}>
        <HStack justifyContent='center'>
          <Controller
            control={control}
            name='code'
            rules={{
              required: t('csp.step1.validation.required', {
                defaultValue: 'Code is required',
              }),
              minLength: {
                value: 6,
                message: t('csp.step1.validation.length', {
                  defaultValue: 'Code must be 6 digits',
                }),
              },
            }}
            render={({ field: { onChange, value } }) => (
              <PinInput
                size='lg'
                value={value}
                onChange={(val) => {
                  onChange(val)
                  if (val.length === 6) {
                    handleSubmit(onSubmit)()
                  }
                }}
                autoFocus
              >
                <PinInputField />
                <PinInputField />
                <PinInputField />
                <PinInputField />
                <PinInputField />
                <PinInputField />
              </PinInput>
            )}
          />
        </HStack>
        {errors.code && <FormErrorMessage>{errors.code.message}</FormErrorMessage>}
        <FormHelperText>
          <Trans i18nKey='csp.step1.helper_text'>
            We have sent a unique code to the indicated email/mobile. If using email, don't forget to check the spam
            folder.
          </Trans>
        </FormHelperText>
      </FormControl>
      <Text fontSize='sm'>
        {t('csp.step1.resend_prompt', { defaultValue: "Didn't get the code?" })}{' '}
        {cooldownSeconds > 0 ? (
          t('csp.step1.resend_cooldown', { defaultValue: 'Re-send in {{seconds}}s', seconds: cooldownSeconds })
        ) : (
          <Button
            variant='link'
            colorScheme='blue'
            size='sm'
            onClick={onResend}
            isDisabled={!canResend}
            isLoading={resendAuth.isPending}
            type='button'
          >
            {t('csp.step1.resend_action', { defaultValue: 'Re-send' })}
          </Button>
        )}
      </Text>
      {auth.isError && (
        <Alert status='error'>
          <AlertIcon />
          <AlertDescription>{auth.error.message}</AlertDescription>
        </Alert>
      )}

      <Button type='submit' w='full' isLoading={auth.isPending} shouldWrapChildren>
        {t('csp.authenticate', { defaultValue: 'Authenticate' })}
      </Button>

      <Text size='xs'>
        <Trans i18nKey='csp.step1.support_text'>
          If you have any problems, contact this phone number: 900 705 705 or via email{' '}
          <Link href='mailto:info@coib.cat'>info@coib.cat</Link>
        </Trans>
      </Text>
    </VStack>
  )
}
