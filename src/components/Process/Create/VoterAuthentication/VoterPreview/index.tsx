import { Box, HStack, Icon, Text, VStack } from '@chakra-ui/react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuLock } from 'react-icons/lu'
import { useCredentialMeta } from '../credentialMeta'
import { fadeUp } from '../motion'
import { VoterAuthFormData } from '../utils'
import { PreviewCodeScreen } from './PreviewCodeScreen'
import { PreviewField } from './PreviewField'

export type VoterPreviewProps = {
  /** Wizard step index — drives whether the code screen is shown. */
  activeStep: number
}

/**
 * A clean, abstract "voter screen" that mirrors what members will actually see
 * when they authenticate. It updates live as the admin configures the flow:
 * fields type themselves in, and turning on 2FA flips it to the code screen.
 * Read-only by design — it is a window into the outcome, not a control.
 */
export const VoterPreview = ({ activeStep }: VoterPreviewProps) => {
  const { t } = useTranslation()
  const { watch } = useFormContext<VoterAuthFormData>()
  const { identityCredentials, byId } = useCredentialMeta()

  const credentials = watch('credentials') ?? []
  const use2FA = watch('use2FA')
  const method = watch('use2FAMethod')

  // Show the actual code screen when the admin is configuring 2FA, so toggling
  // it on visibly produces the second voter screen.
  const showCode = use2FA && activeStep === 1

  const selected = identityCredentials.filter((c) => credentials.includes(c.id))
  const contactField =
    method === 'sms'
      ? byId('phone')
      : method === 'voter_choice'
        ? { ...byId('email'), label: t('voter_auth.preview.contact_choice', { defaultValue: 'Email or phone' }) }
        : byId('email')

  const isEmpty = selected.length === 0 && !use2FA
  const ctaLabel = use2FA
    ? t('voter_auth.preview.cta_continue', { defaultValue: 'Continue' })
    : t('voter_auth.preview.cta_vote', { defaultValue: 'Enter ballot' })

  return (
    <VStack gap={3} w='full' justify='center' h='full'>
      <Text fontSize='xs' fontWeight='medium' color='texts.subtle' textTransform='uppercase' letterSpacing='wider'>
        {t('voter_auth.preview.heading', { defaultValue: "Voter's screen" })}
      </Text>

      <Box
        w='full'
        maxW='260px'
        borderRadius='2xl'
        bg='auth.card.bg'
        border='1px solid'
        borderColor='auth.card.border'
        boxShadow='0 12px 32px -12px rgba(0,0,0,0.25)'
        overflow='hidden'
      >
        {/* window top bar */}
        <HStack px={3} py={2} borderBottom='1px solid' borderColor='auth.card.border' gap={2}>
          <HStack gap={1}>
            {['red.300', 'orange.300', 'green.300'].map((c) => (
              <Box key={c} boxSize={2} borderRadius='full' bg={c} />
            ))}
          </HStack>
          <HStack gap={1} ml='auto' color='texts.subtle'>
            <Icon as={LuLock} boxSize={3} />
            <Text fontSize='10px'>{t('voter_auth.preview.secure', { defaultValue: 'Secure ballot' })}</Text>
          </HStack>
        </HStack>

        <VStack align='stretch' gap={3} p={4} minH='220px'>
          <Text fontSize='sm' fontWeight='bold' color='texts.primary'>
            {t('voter_auth.preview.title', { defaultValue: 'Verify your identity to vote' })}
          </Text>

          {isEmpty ? (
            <VStack flex={1} justify='center' gap={1} py={4}>
              <Text fontSize='xs' color='texts.subtle' textAlign='center'>
                {t('voter_auth.preview.empty', { defaultValue: 'Select fields to build the voter screen' })}
              </Text>
            </VStack>
          ) : showCode ? (
            <PreviewCodeScreen method={method} />
          ) : (
            <VStack align='stretch' gap={2.5}>
              {selected.map((c) => (
                <PreviewField key={c.id} label={c.label} value={c.example} />
              ))}
              {use2FA && (
                <PreviewField key={`contact-${method}`} label={contactField.label} value={contactField.example} />
              )}
            </VStack>
          )}

          {!isEmpty && (
            <Box
              mt='auto'
              borderRadius='md'
              bg='brand.500'
              color='white'
              textAlign='center'
              py={2}
              fontSize='xs'
              fontWeight='semibold'
              css={{ animation: `${fadeUp} 0.3s ease both` }}
            >
              {ctaLabel}
            </Box>
          )}
        </VStack>
      </Box>
    </VStack>
  )
}
