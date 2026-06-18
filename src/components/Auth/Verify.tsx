import {
  AlertRoot as Alert,
  AlertIndicator,
  Box,
  Button,
  Flex,
  HStack,
  PinInputControl,
  PinInputInput,
  PinInputRoot,
  Text,
} from '@chakra-ui/react'
import { useCallback, useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { useResendVerificationMail } from '~components/Auth/authQueries'
import { useAuth } from '~components/Auth/useAuth'
import { useToast } from '~components/Toast'
import { AuthOutletContextType } from '~elements/LayoutAuth'
import { Routes } from '~src/router/routes'
import { Loading } from '~src/router/SuspenseLoader'
import { UnauthorizedApiError } from './api'

type VerifyFormProps = {
  email: string
  initialCode?: string
  autoSubmit?: boolean
}

const VerifyForm = ({ email, initialCode = '', autoSubmit = false }: VerifyFormProps) => {
  const toast = useToast()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [code, setCode] = useState<string[]>(() => Array.from({ length: 6 }, (_, i) => initialCode[i] ?? ''))
  const {
    mailVerify: { mutateAsync: verifyAsync, isPending: isVerifyPending, isError: isVerifyError },
  } = useAuth()

  const codeString = code.join('')

  const verify = useCallback(async () => {
    try {
      await verifyAsync({ email, code: codeString })
      toast({
        type: 'success',
        title: t('verify_mail.success', { defaultValue: 'Email verified successfully' }),
      })
      navigate(Routes.auth.organizationCreate)
    } catch (error) {
      const title =
        error instanceof UnauthorizedApiError
          ? t('verify_mail.error_subtitle', {
              defaultValue: 'The code you entered is incorrect. Please try again',
            })
          : error?.message

      toast({
        type: 'error',
        title,
        closable: true,
      })
    }
  }, [codeString, email, verifyAsync, navigate, t, toast])

  // Auto-submit if code is provided and autoSubmit is true, or when all 6 characters are entered
  useEffect(() => {
    if ((autoSubmit && codeString) || (!autoSubmit && code.every((c) => c.trim() !== ''))) {
      verify()
    }
  }, [autoSubmit, codeString])

  if (autoSubmit && codeString && !isVerifyError) {
    return (
      <Box height={'100px'}>
        <Loading minHeight={1} />
      </Box>
    )
  }

  return (
    <>
      <HStack width='100%' justifyContent='space-between'>
        <PinInputRoot
          value={code}
          onValueChange={({ value, valueAsString }) => {
            const next = Array.isArray(value)
              ? Array.from({ length: 6 }, (_, i) => value[i] ?? '')
              : Array.from({ length: 6 }, (_, i) => (valueAsString ?? '')[i] ?? '')
            setCode(next)
          }}
          disabled={autoSubmit}
          type='alphanumeric'
          autoFocus
          count={6}
        >
          <PinInputControl>
            {Array.from({ length: 6 }).map((_, index) => (
              <PinInputInput key={index} index={index} />
            ))}
          </PinInputControl>
        </PinInputRoot>
      </HStack>
      <Box>
        <Button
          disabled={code.every((c) => c === '') || (autoSubmit && isVerifyPending)}
          loading={isVerifyPending}
          onClick={verify}
          w='full'
        >
          <Trans i18nKey={'verify.verify_code'}>Verify</Trans>
        </Button>
      </Box>
    </>
  )
}

export const VerificationPending = ({ email, code }: { email: string; code?: string }) => {
  const toast = useToast()
  const { t } = useTranslation()
  const { setTitle, setSubtitle } = useOutletContext<AuthOutletContextType>()
  const {
    mutate: resend,
    isPending: isResendPending,
    isSuccess: isResendSuccess,
  } = useResendVerificationMail({
    onSuccess: () => {
      toast({
        title: t('verify.email_sent', { defaultValue: 'Email sent successfully' }),
        type: 'success',
        duration: 5000,
        closable: true,
      })
    },
    onError: (error) => {
      toast({
        title: t('verify.email_send_failed', { defaultValue: 'Failed to send email' }),
        description: error.message,
        type: 'error',
        duration: 5000,
        closable: true,
      })
    },
  })

  useEffect(() => {
    setTitle(t('verify.account_created_succesfully', { defaultValue: 'Account created successfully!' }))
    setSubtitle(
      t('verify.verification_email_is_sent', {
        defaultValue: 'A verification email has been sent to:',
      })
    )
  }, [])

  const resendMail = useCallback(() => {
    if (email && !isResendSuccess) {
      resend({ email })
    }
  }, [isResendSuccess, email])

  return (
    <>
      <Flex flexDirection='column' gap={4}>
        <Text fontWeight='bold' fontSize='md' color='auth.secondary_text'>
          <Trans i18nKey='verify.sent_to_email' values={{ email }}>
            Email sent to {{ email }}
          </Trans>
        </Text>
        <Alert status='info'>
          <AlertIndicator />
          <Text fontSize='sm' fontStyle='italic'>
            {t('verify.check_spam_folder', {
              defaultValue: "Please check your spam folder if you don't see the email in your inbox.",
            })}
          </Text>
        </Alert>
        <Text fontWeight='bold' fontSize='sm'>
          {t('verify.enter_code', {
            defaultValue: 'Enter the code below to activate your account',
          })}
        </Text>
        <VerifyForm email={email} initialCode={code} autoSubmit={!!code} />
      </Flex>

      {!code && (
        <Button variant={'outline'} loading={isResendPending} onClick={resendMail} mt={6} w='full'>
          <Trans i18nKey={'verify.resend_confirmation_mail'}>Resend Email</Trans>
        </Button>
      )}
    </>
  )
}
