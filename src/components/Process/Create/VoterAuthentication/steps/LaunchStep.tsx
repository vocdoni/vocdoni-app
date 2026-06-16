import { Box, Heading, HStack, Icon, Separator, Text, VStack } from '@chakra-ui/react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuMail, LuPhone, LuShield, LuSmartphone } from 'react-icons/lu'
import { useCredentialMeta } from '../credentialMeta'
import { SecurityGauge } from '../SecurityGauge'
import { TwoFAMethod, VoterAuthFormData } from '../utils'

const methodIcon = (method: TwoFAMethod) =>
  method === 'sms' ? LuPhone : method === 'voter_choice' ? LuSmartphone : LuMail

/**
 * Step 3 — the confident launch moment. The security gauge becomes the hero and
 * a tidy recap confirms exactly what voters will go through.
 */
export const LaunchStep = () => {
  const { t } = useTranslation()
  const { watch } = useFormContext<VoterAuthFormData>()
  const { byId } = useCredentialMeta()

  const credentials = watch('credentials') ?? []
  const use2FA = watch('use2FA')
  const method = watch('use2FAMethod')

  const methodLabel =
    method === 'sms'
      ? t('voter_auth.method.sms_label', { defaultValue: 'SMS code' })
      : method === 'voter_choice'
        ? t('voter_auth.method.choice_label', { defaultValue: "Member's choice" })
        : t('voter_auth.method.email_label', { defaultValue: 'Email code' })

  return (
    <VStack align='stretch' gap={5}>
      <Box>
        <Heading size='md'>
          {t('voter_auth.step.launch.heading', { defaultValue: 'Ready to create voter access' })}
        </Heading>
        <Text color='texts.subtle' fontSize='sm' mt={1}>
          {t('voter_auth.step.launch.subheading', {
            defaultValue: "Here's what every voter will go through to reach the ballot.",
          })}
        </Text>
      </Box>

      <Box borderWidth='1px' borderColor='table.border' borderRadius='xl' p={5} bg='auth.bg'>
        <SecurityGauge credentials={credentials} use2FA={use2FA} variant='hero' />
      </Box>

      <VStack align='stretch' gap={3}>
        <Box>
          <HStack gap={2} mb={2}>
            <Icon as={LuShield} boxSize={4} color='texts.subtle' />
            <Text fontSize='sm' fontWeight='semibold'>
              {t('voter_auth.step.launch.identity_fields', { defaultValue: 'Identity fields' })}
            </Text>
          </HStack>
          {credentials.length > 0 ? (
            <HStack gap={2} flexWrap='wrap' pl={6}>
              {credentials.map((id) => (
                <Box
                  key={id}
                  px={2.5}
                  py={1}
                  borderRadius='full'
                  bg='auth.card.bg'
                  borderWidth='1px'
                  borderColor='table.border'
                >
                  <Text fontSize='xs'>{byId(id).label}</Text>
                </Box>
              ))}
            </HStack>
          ) : (
            <Text fontSize='xs' color='texts.subtle' pl={6}>
              {t('voter_auth.step.launch.no_fields', {
                defaultValue: 'No identity fields — verification by code only',
              })}
            </Text>
          )}
        </Box>

        {use2FA && (
          <>
            <Separator borderColor='table.border' />
            <HStack gap={2}>
              <Icon as={methodIcon(method)} boxSize={4} color='texts.subtle' />
              <Text fontSize='sm' fontWeight='semibold'>
                {t('voter_auth.step.launch.two_factor', { defaultValue: 'One-time code' })}
              </Text>
              <Text fontSize='sm' color='texts.subtle'>
                · {methodLabel}
              </Text>
            </HStack>
          </>
        )}
      </VStack>
    </VStack>
  )
}
