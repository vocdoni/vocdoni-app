import {
  AlertRoot as Alert,
  AlertDescription,
  AlertIndicator,
  AlertTitle,
  Box,
  Field,
  HStack,
  Icon,
  RadioGroupItem,
  RadioGroupItemControl,
  RadioGroupItemHiddenInput,
  RadioGroupItemText,
  RadioGroupRoot,
  Stack,
  SwitchControl,
  SwitchHiddenInput,
  SwitchRoot,
  SwitchThumb,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Controller, useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { LuLock, LuMail, LuPhone } from 'react-icons/lu'

export const TwoFactorForm = () => {
  const { t } = useTranslation()
  const { control, watch } = useFormContext()
  const use2FA = watch('use2FA')
  const email = <Icon as={LuMail} />
  const phone = <Icon as={LuPhone} />

  const TwoFactorMethods = [
    {
      value: 'email',
      label: <Trans i18nKey='voter_auth.2fa_email' defaults='<email /> Email verification' components={{ email }} />,
      description: t('voter_auth.2fa_email_description', {
        defaultValue: 'Voters will receive a verification code via email',
      }),
    },
    {
      value: 'sms',
      label: <Trans i18nKey='voter_auth.2fa_sms' defaults='<phone /> SMS verification' components={{ phone }} />,
      description: t('voter_auth.2fa_sms_description', {
        defaultValue: 'Voters will receive a verification code via SMS',
      }),
    },
    {
      value: 'voter_choice',
      label: (
        <Trans
          i18nKey='voter_auth.2fa_voter_choice'
          defaults="<email /> or <phone /> Voter's choice"
          components={{ email, phone }}
        />
      ),
      description: t('voter_auth.2fa_voter_choice_description', {
        defaultValue: 'Voters can choose their preferred verification method',
      }),
    },
  ]

  return (
    <Box>
      <VStack gap={4} border='1px solid' borderColor='table.border' p={4} borderRadius='md'>
        <Field.Root as={HStack}>
          <Box>
            <Field.Label fontWeight='extrabold' m={0}>
              {t('voter_auth.2fa_enable', { defaultValue: 'Enable Two-Factor Authentication' })}
            </Field.Label>
            <Text fontSize='sm' color='texts.subtle'>
              {t('voter_auth.2fa_description', {
                defaultValue: 'Add an extra layer of security by requiring voters to verify their identity',
              })}
            </Text>
          </Box>
          <Controller
            name='use2FA'
            control={control}
            render={({ field }) => (
              <SwitchRoot
                checked={field.value}
                onCheckedChange={({ checked }) => field.onChange(checked)}
                display='inline-flex'
              >
                <SwitchHiddenInput />
                <SwitchControl>
                  <SwitchThumb />
                </SwitchControl>
              </SwitchRoot>
            )}
          />
        </Field.Root>

        {use2FA && (
          <VStack align='start' gap={6}>
            <Box>
              <Text fontWeight='bold'>
                {t('voter_auth.2fa_method_title', { defaultValue: 'Select verification method' })}
              </Text>
              <VStack align='start' gap={3} mt={3}>
                <Field.Root>
                  <Controller
                    name='use2FAMethod'
                    control={control}
                    render={({ field }) => (
                      <RadioGroupRoot
                        value={field.value}
                        onValueChange={({ value }) => field.onChange(value)}
                        orientation='vertical'
                      >
                        <Stack direction='column' gap={2}>
                          {TwoFactorMethods.map((method) => (
                            <RadioGroupItem key={method.value} value={method.value} alignItems='flex-start'>
                              <RadioGroupItemHiddenInput />
                              <RadioGroupItemControl />
                              <Box>
                                <RadioGroupItemText as='span' fontWeight='bold'>
                                  {method.label}
                                </RadioGroupItemText>
                                <Text fontSize='sm' color='texts.subtle'>
                                  {method.description}
                                </Text>
                              </Box>
                            </RadioGroupItem>
                          ))}
                        </Stack>
                      </RadioGroupRoot>
                    )}
                  />
                </Field.Root>
              </VStack>
            </Box>

            <Alert status='success' variant='subtle' borderRadius='md' alignItems='start' py={3} px={4}>
              <AlertIndicator>
                <Icon as={LuLock} />
              </AlertIndicator>
              <Box>
                <AlertTitle fontWeight='bold'>
                  {t('voter_auth.2fa_security_title', { defaultValue: 'Enhanced Security' })}
                </AlertTitle>
                <AlertDescription fontSize='sm'>
                  {t('voter_auth.2fa_security_description', {
                    defaultValue:
                      'Two-factor authentication significantly increases the security of your voting process by ensuring only authorized members can vote.',
                  })}
                </AlertDescription>
              </Box>
            </Alert>
          </VStack>
        )}
      </VStack>
    </Box>
  )
}
