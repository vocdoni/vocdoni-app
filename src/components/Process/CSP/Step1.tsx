import {
  AlertRoot as Alert,
  AlertDescription,
  AlertIndicator,
  Button,
  FieldErrorText,
  FieldHelperText,
  FieldRoot,
  HStack,
  PinInputControl,
  PinInputHiddenInput,
  PinInputInput,
  PinInputRoot,
  VStack,
} from '@chakra-ui/react'
import { useElection } from '@vocdoni/react-providers'
import { PublishedElection } from '@vocdoni/sdk'
import { Controller, useForm } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { useToast } from '~components/Toast'
import { useCspAuthContext } from './CSPStepsProvider'
import { useTwoFactorAuth } from './basics'

// Define the form data structure
type CSPStep1FormData = {
  code: string
}

export const Step1Base = ({ election }: { election: PublishedElection }) => {
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
  } = useForm<CSPStep1FormData>({
    defaultValues: {
      code: '',
    },
  })
  const auth = useTwoFactorAuth<1>(election, 1)

  const onSubmit = async (values: CSPStep1FormData) => {
    try {
      const { authToken } = await auth.mutateAsync({
        authToken: authData.authToken,
        authData: [values.code],
      })

      csp1(authToken)
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
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack gap={4}>
          <FieldRoot invalid={!!errors.code}>
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
                render={({ field: { onChange, value } }) => {
                  const safeValue = typeof value === 'string' ? value : ''
                  const pinValue = Array.from({ length: 6 }, (_, index) => safeValue[index] ?? '')

                  return (
                    <PinInputRoot
                      size='lg'
                      value={pinValue}
                      onValueChange={({ value, valueAsString }) => {
                        const nextValue =
                          typeof valueAsString === 'string' ? valueAsString : Array.isArray(value) ? value.join('') : ''

                        onChange(nextValue)
                        if (nextValue.length === 6) {
                          handleSubmit(onSubmit)()
                        }
                      }}
                      autoFocus
                      count={6}
                    >
                      <PinInputHiddenInput />
                      <PinInputControl>
                        {Array.from({ length: 6 }).map((_, index) => (
                          <PinInputInput key={index} index={index} />
                        ))}
                      </PinInputControl>
                    </PinInputRoot>
                  )
                }}
              />
            </HStack>
            {errors.code && <FieldErrorText textAlign='center'>{errors.code.message}</FieldErrorText>}
            <FieldHelperText>
              <Trans i18nKey='csp.step1.helper_text'>If using email, don't forget to check spam folder</Trans>
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
        </VStack>
      </form>
    </VStack>
  )
}
