import { Box, HStack, Icon, Switch, Text, VStack } from '@chakra-ui/react'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuShieldCheck } from 'react-icons/lu'
import { EASE } from './motion'
import { VoterAuthFormData } from './utils'

/** Large card housing the 2FA on/off switch — far more legible than a bare toggle. */
export const TwoFactorToggleCard = () => {
  const { t } = useTranslation()
  const { control, watch } = useFormContext<VoterAuthFormData>()
  const use2FA = watch('use2FA')

  return (
    <Box
      borderWidth='2px'
      borderStyle='solid'
      borderColor={use2FA ? 'brand.500' : 'table.border'}
      borderRadius='xl'
      p={4}
      bg={use2FA ? 'auth.bg' : 'transparent'}
      css={{ transition: `border-color 0.2s ${EASE}, background-color 0.2s ${EASE}` }}
    >
      <HStack justify='space-between' gap={4}>
        <HStack gap={3} align='start'>
          <Box
            color={use2FA ? 'green.500' : 'texts.subtle'}
            bg={use2FA ? 'green.50' : 'auth.bg'}
            p={2}
            borderRadius='lg'
            lineHeight={0}
            css={{ transition: `color 0.2s ${EASE}, background-color 0.2s ${EASE}` }}
          >
            <Icon as={LuShieldCheck} boxSize={5} />
          </Box>
          <VStack align='start' gap={0.5}>
            <Text fontWeight='semibold'>
              {t('voter_auth.step.verification.toggle_title', { defaultValue: 'Require a one-time code' })}
            </Text>
            <Text fontSize='sm' color='texts.subtle'>
              {t('voter_auth.step.verification.toggle_subtitle', {
                defaultValue: 'Voters confirm a code sent to their email or phone before voting.',
              })}
            </Text>
          </VStack>
        </HStack>
        <Controller
          control={control}
          name='use2FA'
          render={({ field }) => (
            <Switch.Root
              checked={field.value}
              onCheckedChange={({ checked }) => field.onChange(checked)}
              display='inline-flex'
              flexShrink={0}
            >
              <Switch.HiddenInput />
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
            </Switch.Root>
          )}
        />
      </HStack>
    </Box>
  )
}
