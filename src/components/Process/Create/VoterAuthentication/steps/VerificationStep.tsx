import { Box, Heading, Text, VStack } from '@chakra-ui/react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuMail, LuPhone, LuSmartphone } from 'react-icons/lu'
import { MethodCard } from '../MethodCard'
import { EASE } from '../motion'
import { SecurityGauge } from '../SecurityGauge'
import { TwoFactorToggleCard } from '../TwoFactorToggleCard'
import { TwoFAMethod, VoterAuthFormData } from '../utils'

/**
 * Step 2 — optional one-time-code verification. The method cards reveal
 * smoothly when 2FA is enabled, and the preview pane flips to the code screen.
 */
export const VerificationStep = () => {
  const { t } = useTranslation()
  const { watch, setValue } = useFormContext<VoterAuthFormData>()
  const use2FA = watch('use2FA')
  const credentials = watch('credentials') ?? []
  const method = watch('use2FAMethod')

  const methods: { value: TwoFAMethod; icon: typeof LuMail; label: string; description: string }[] = [
    {
      value: 'email',
      icon: LuMail,
      label: t('voter_auth.method.email_label', { defaultValue: 'Email code' }),
      description: t('voter_auth.method.email_desc', { defaultValue: 'A 6-digit code sent to their email' }),
    },
    {
      value: 'sms',
      icon: LuPhone,
      label: t('voter_auth.method.sms_label', { defaultValue: 'SMS code' }),
      description: t('voter_auth.method.sms_desc', { defaultValue: 'A 6-digit code sent by text message' }),
    },
    {
      value: 'voter_choice',
      icon: LuSmartphone,
      label: t('voter_auth.method.choice_label', { defaultValue: "Member's choice" }),
      description: t('voter_auth.method.choice_desc', { defaultValue: 'Let members pick email or SMS' }),
    },
  ]

  return (
    <VStack align='stretch' gap={5}>
      <Box>
        <Heading size='md'>
          {t('voter_auth.step.verification.heading', { defaultValue: 'Add an extra layer of security?' })}
        </Heading>
        <Text color='texts.subtle' fontSize='sm' mt={1}>
          {t('voter_auth.step.verification.subheading', {
            defaultValue:
              'A one-time code confirms voters are who they say they are. Recommended for high-stakes votes.',
          })}
        </Text>
      </Box>

      <TwoFactorToggleCard />

      <Box
        overflow='hidden'
        css={{
          maxHeight: use2FA ? '420px' : '0px',
          opacity: use2FA ? 1 : 0,
          transition: `max-height 0.32s ${EASE}, opacity 0.25s ${EASE}`,
        }}
      >
        <VStack align='stretch' gap={2.5} pt={1}>
          <Text fontSize='sm' fontWeight='medium'>
            {t('voter_auth.step.verification.method_title', { defaultValue: 'How should codes be delivered?' })}
          </Text>
          {methods.map((m, index) => (
            <MethodCard
              key={m.value}
              icon={m.icon}
              label={m.label}
              description={m.description}
              index={index}
              isSelected={method === m.value}
              onSelect={() => setValue('use2FAMethod', m.value)}
            />
          ))}
        </VStack>
      </Box>

      <Box pt={1}>
        <SecurityGauge credentials={credentials} use2FA={use2FA} />
      </Box>
    </VStack>
  )
}
