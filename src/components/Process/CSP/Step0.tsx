import {
  AlertRoot as Alert,
  AlertDescription,
  AlertIndicator,
  Button,
  CheckboxControl,
  CheckboxHiddenInput,
  CheckboxLabel,
  CheckboxRoot,
  FieldHelperText,
  FieldLabel,
  FieldRoot,
  Input,
  Link,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useElection } from '@vocdoni/react-components'
import { PublishedElection } from '@vocdoni/sdk'
import { useForm } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { useAuth } from '~components/Auth/useAuth'
import { useToast } from '~components/Toast'
import { CSPStep0FormData, CSPStep0RequestData, useTwoFactorAuth } from './basics'
import { useCspAuthContext } from './CSPStepsProvider'

export const Step0Base = ({ election }: { election: PublishedElection }) => {
  const { t } = useTranslation()
  const toast = useToast()
  const { setMemberNumber } = useAuth()
  const { setCurrentStep, setAuthData, authFields, twoFaFields } = useCspAuthContext()
  const {
    actions: { csp1 },
  } = useElection()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CSPStep0FormData>()
  const auth = useTwoFactorAuth<0>(election, 0)
  const is2Factor = twoFaFields.length > 0

  const privacyPolicyUrl = import.meta.env.PRIVACY_POLICY_URL
  const termsOfServiceUrl = import.meta.env.TERMS_OF_SERVICE_URL
  const crispWebsiteId = import.meta.env.CRISP_WEBSITE_ID

  const onSubmit = async (values: CSPStep0FormData) => {
    const trimmed: CSPStep0FormData = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
    )

    // Strip leading zeros from the member number (e.g. "00123" -> "123"), keeping at
    // least one digit so an all-zeros value collapses to "0" instead of an empty string.
    if (typeof trimmed.memberNumber === 'string') {
      trimmed.memberNumber = trimmed.memberNumber.replace(/^0+(?=\d)/, '')
    }

    const form: CSPStep0RequestData = {}

    // Add auth fields to the form
    authFields.forEach((field) => {
      if (trimmed[field]) {
        form[field] = trimmed[field]
      }
    })

    // Handle 2FA field - process based on available methods
    if (trimmed.contact) {
      if (twoFaFields.includes('email') && twoFaFields.includes('phone')) {
        // Both are supported, determine based on content
        if (trimmed.contact.includes('@')) {
          form.email = trimmed.contact
        } else {
          form.phone = trimmed.contact
        }
      } else if (twoFaFields.includes('email')) {
        form.email = trimmed.contact
      } else if (twoFaFields.includes('phone')) {
        form.phone = trimmed.contact
      }
    }

    const pushCrispUserFields = (fields: Record<string, string | undefined>) => {
      if (!crispWebsiteId || typeof window === 'undefined') {
        return
      }

      const w = window as Window
      if (!w.$crisp || typeof w.$crisp.push !== 'function') {
        return
      }

      try {
        const firstEntry = Object.entries(fields).find(([, value]) => typeof value === 'string' && value.length > 0)
        if (!firstEntry) {
          return
        }

        const [field, value] = firstEntry
        try {
          w.$crisp.push(['set', 'user:nickname', [`${field} ${value}` as string]])
        } catch (error) {
          console.error('Crisp push failed:', error)
        }
      } catch (error) {
        console.error('Crisp push failed:', error)
      }
    }

    try {
      const { authToken } = await auth.mutateAsync(form)

      // Store auth token and contact info in global context
      setAuthData((prev) => ({
        ...prev,
        authToken,
        ...(form.email && { email: form.email }),
        ...(form.phone && { phone: form.phone }),
      }))

      setMemberNumber(form.memberNumber)

      pushCrispUserFields(form)

      // Check if 2FA is required
      if (is2Factor) {
        // 2FA required - proceed to Step 1 for code verification
        toast({
          title: t('csp.code_sent', { defaultValue: 'Verification code sent' }),
          type: 'success',
          duration: 3000,
          isClosable: true,
        })
        setCurrentStep(1)
      } else {
        // No 2FA - complete authentication directly using the same method as Step 1
        toast({
          title: t('csp.auth_success', { defaultValue: 'Authentication successful' }),
          type: 'success',
          duration: 3000,
          isClosable: true,
        })
        csp1(authToken)
      }
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
      console.error('CSP auth failed:', error)
    }
  }

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      memberNumber: t('csp.fields.memberNumber', 'Member Number'),
      name: t('csp.fields.name', 'Name'),
      surname: t('csp.fields.surname', 'Surname'),
      nationalId: t('csp.fields.nationalId', 'National ID'),
      birthDate: t('csp.fields.birthDate', 'Birth Date'),
    }
    return labels[field] || field
  }

  const get2FaFieldLabel = () => {
    if (twoFaFields.includes('email') && twoFaFields.includes('phone')) {
      return t('csp.fields.email_or_phone', 'Email or Phone')
    } else if (twoFaFields.includes('email')) {
      return t('csp.fields.email', 'Email')
    } else if (twoFaFields.includes('phone')) {
      return t('csp.fields.phone', 'Phone')
    }
    return t('csp.fields.contact', 'Contact')
  }

  const getFieldType = (field: string) => {
    if (field === 'email') return 'email'
    if (field === 'phone') return 'tel'
    if (field === 'birthDate') return 'date'
    return 'text'
  }

  return (
    <VStack gap={6} align='stretch' w='full'>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={4}>
          {/* Render auth fields */}
          {authFields.map((field) => (
            <FieldRoot key={field} invalid={!!errors[field]} required>
              <FieldLabel>{getFieldLabel(field)}</FieldLabel>
              <Input {...register(field, { required: true })} type={getFieldType(field)} />
            </FieldRoot>
          ))}

          {/* Render 2FA field */}
          {is2Factor && (
            <FieldRoot invalid={!!errors.contact} required>
              <FieldLabel>{get2FaFieldLabel()}</FieldLabel>
              <Input {...register('contact', { required: true })} type='text' />
              <FieldHelperText>
                <Text as='span' fontWeight='bold'>
                  {t('csp.important', { defaultValue: 'Important' })}:
                </Text>{' '}
                {t('csp.contact_match_help', 'Must match the one registered in the system')}
              </FieldHelperText>
            </FieldRoot>
          )}

          {auth.isError && (
            <Alert status='error'>
              <AlertIndicator />
              <AlertDescription>{auth.error.message}</AlertDescription>
            </Alert>
          )}

          <FieldRoot required>
            <CheckboxRoot>
              <CheckboxHiddenInput />
              <CheckboxControl />
              <CheckboxLabel>
                <Trans i18nKey='csp.terms_acceptance'>
                  I have read and accept the{' '}
                  <Link href={termsOfServiceUrl} target='_blank' rel='noopener noreferrer'>
                    Terms and Conditions
                  </Link>{' '}
                  and the{' '}
                  <Link href={privacyPolicyUrl} target='_blank' rel='noopener noreferrer'>
                    Privacy Policy
                  </Link>
                  .
                </Trans>
              </CheckboxLabel>
            </CheckboxRoot>
          </FieldRoot>

          <Button
            type='submit'
            w='full'
            loading={auth.isPending}
            mt={2}
            aria-label={
              is2Factor
                ? t('csp.receive_code', { defaultValue: 'Receive Code' })
                : t('csp.authenticate', { defaultValue: 'Authenticate' })
            }
          >
            {is2Factor ? t('csp.receive_code', 'Receive Code') : t('csp.authenticate', 'Authenticate')}
          </Button>

          {is2Factor && (
            <Text textAlign='center' fontSize='sm'>
              {t(
                'csp.code_info',
                'You will receive a unique code on the selected medium to verify your identity and complete authentication'
              )}
            </Text>
          )}
        </Stack>
      </form>
    </VStack>
  )
}
