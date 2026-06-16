import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { TwoFAMethod } from '../utils'
import { blink, fadeUp } from '../motion'

export type PreviewCodeScreenProps = {
  method: TwoFAMethod
}

/**
 * Mock of the voter's 6-digit code screen, shown in the preview when 2FA is on.
 * Purely illustrative — no interaction.
 */
export const PreviewCodeScreen = ({ method }: PreviewCodeScreenProps) => {
  const { t } = useTranslation()

  const destination =
    method === 'sms'
      ? t('voter_auth.preview.code_sent_phone', { defaultValue: 'your phone' })
      : method === 'voter_choice'
        ? t('voter_auth.preview.code_sent_choice', { defaultValue: 'your email or phone' })
        : t('voter_auth.preview.code_sent_email', { defaultValue: 'your email' })

  return (
    <VStack gap={4} align='stretch' css={{ animation: `${fadeUp} 0.3s ease both` }}>
      <Text fontSize='xs' color='texts.subtle' textAlign='center'>
        {t('voter_auth.preview.code_sent', {
          defaultValue: 'We sent a 6-digit code to {{destination}}',
          destination,
        })}
      </Text>
      <HStack gap={1.5} justify='center'>
        {Array.from({ length: 6 }).map((_, i) => (
          <Box
            key={i}
            w='28px'
            h='34px'
            borderRadius='md'
            border='1px solid'
            borderColor={i === 0 ? 'brand.500' : 'auth.card.border'}
            bg='auth.card.bg'
            display='flex'
            alignItems='center'
            justifyContent='center'
          >
            {i === 0 && (
              <Box w='1.5px' h='16px' bg='brand.500' css={{ animation: `${blink} 1.1s steps(1) infinite` }} />
            )}
          </Box>
        ))}
      </HStack>
    </VStack>
  )
}
