import {
  AlertRoot as Alert,
  AlertDescription,
  AlertIndicator,
  AlertTitle,
  Box,
  CheckboxControl,
  CheckboxGroup,
  CheckboxHiddenInput,
  CheckboxLabel,
  CheckboxRoot,
  Flex,
  Icon,
  Text,
} from '@chakra-ui/react'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuCheck, LuInfo } from 'react-icons/lu'
import { useMemberColumns } from '~elements/dashboard/memberbase/members'
import { countedCredentials, PASSWORD_CREDENTIAL } from './utils'

export const CredentialsForm = () => {
  const { t } = useTranslation()
  const fields = useMemberColumns()
  const { control, watch } = useFormContext()
  const credentials = watch('credentials')
  // the password does not count toward the limit of 3 (see countedCredentials)
  const counted = countedCredentials(credentials)
  const passwordOnly = credentials?.includes(PASSWORD_CREDENTIAL) && counted === 0

  return (
    <Box>
      <Flex direction='column' border='1px solid' borderColor='table.border' p={4} borderRadius='md' gap={4}>
        <Text fontSize='sm' fontWeight='extrabold'>
          {t('voter_auth.select_credentials', {
            defaultValue: 'Select required credentials for voter authentication',
          })}
        </Text>
        <Text fontSize='sm' color='texts.subtle'>
          {t('voter_auth.select_credentials_description', {
            defaultValue:
              'Choose the fields voters must provide to authenticate. Select up to 3 for the best balance of security and ease of use. If you plan to use only email or phone for 2FA, skip this step and click Next to set it up',
          })}
        </Text>
        <Flex direction='column' gap={2}>
          <Controller
            name='credentials'
            control={control}
            rules={{ validate: (val) => countedCredentials(val) <= 3 }}
            render={({ field }) => (
              <CheckboxGroup value={field.value} onValueChange={(value) => field.onChange(value)}>
                {fields.map((column) => {
                  if (column.is2fa) return null // Skip 2FA fields in this selection
                  if (column.id === 'weight') return null // Skip weight field
                  const isChecked = credentials.includes(column.id)
                  const isAtLimit = counted >= 3 && !isChecked && column.id !== PASSWORD_CREDENTIAL
                  return (
                    <CheckboxRoot key={column.id} value={column.id} disabled={isAtLimit}>
                      <CheckboxHiddenInput />
                      <CheckboxControl />
                      <CheckboxLabel>{column.label}</CheckboxLabel>
                    </CheckboxRoot>
                  )
                })}
              </CheckboxGroup>
            )}
          />
        </Flex>
        {passwordOnly && (
          <Alert status='info' variant='subtle' borderRadius='md' alignItems='start' py={3} px={4}>
            <AlertIndicator>
              <Icon as={LuInfo} />
            </AlertIndicator>
            <AlertDescription fontSize='sm'>
              {t('voter_auth.password_needs_another_credential', {
                defaultValue:
                  'A password alone cannot identify voters. Select another credential, or enable two-factor authentication in the next step.',
              })}
            </AlertDescription>
          </Alert>
        )}
        {credentials?.length >= 1 && (
          <Alert
            status={credentials?.length >= 2 ? 'success' : 'info'}
            variant='subtle'
            borderRadius='md'
            alignItems='start'
            py={3}
            px={4}
          >
            <AlertIndicator>
              <Icon as={credentials?.length >= 2 ? LuCheck : LuInfo} />
            </AlertIndicator>
            <Box>
              <AlertTitle fontWeight='bold'>
                {credentials?.length >= 2
                  ? t('voter_auth.security_level', { defaultValue: 'Good security' })
                  : t('voter_auth.security_recommendation_title', {
                      defaultValue: 'Security recommendation',
                    })}
              </AlertTitle>
              <AlertDescription fontSize='sm'>
                {credentials?.length === 1 &&
                  t('voter_auth.security_recommendation_1', {
                    defaultValue: 'For better security, we recommend selecting at least 2 credentials.',
                  })}
                {credentials?.length >= 2 &&
                  t('voter_auth.security_recommendation_2', {
                    defaultValue:
                      "You've selected {{ count }} credentials, which provides good security for your voters.",
                    count: credentials?.length,
                  })}
              </AlertDescription>
            </Box>
          </Alert>
        )}
        <Text>
          {t('voter_auth.selected_credentials_count', {
            defaultValue: '{{ count }}/3 credentials selected',
            count: counted,
          })}
        </Text>
      </Flex>
    </Box>
  )
}
