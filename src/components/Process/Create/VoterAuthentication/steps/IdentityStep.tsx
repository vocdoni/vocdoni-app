import { Box, Heading, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { CredentialCard } from '../CredentialCard'
import { useCredentialMeta } from '../credentialMeta'
import { SecurityGauge } from '../SecurityGauge'
import { VoterAuthFormData } from '../utils'

/**
 * Step 1 — choose which identity fields voters must provide. Cards (not
 * checkboxes) make each field tangible, and the live gauge shows the security
 * impact of every choice. Admins may select as many fields as are available.
 */
export const IdentityStep = () => {
  const { t } = useTranslation()
  const { control, watch } = useFormContext<VoterAuthFormData>()
  const { identityCredentials } = useCredentialMeta()
  const credentials = watch('credentials') ?? []
  const use2FA = watch('use2FA')

  return (
    <VStack align='stretch' gap={5}>
      <Box>
        <Heading size='md'>
          {t('voter_auth.step.identity.heading', { defaultValue: 'How will voters prove their identity?' })}
        </Heading>
        <Text color='texts.subtle' fontSize='sm' mt={1}>
          {t('voter_auth.step.identity.subheading', {
            defaultValue:
              'Pick the details members must enter to reach the ballot. Two fields strike the best balance of security and ease.',
          })}
        </Text>
      </Box>

      <Controller
        control={control}
        name='credentials'
        render={({ field }) => {
          const value: string[] = field.value ?? []
          const toggle = (id: string) => {
            if (value.includes(id)) {
              field.onChange(value.filter((v) => v !== id))
            } else {
              field.onChange([...value, id])
            }
          }
          return (
            <VStack align='stretch' gap={4}>
              <SimpleGrid columns={2} gap={3}>
                {identityCredentials.map((meta, index) => {
                  const isSelected = value.includes(meta.id)
                  return (
                    <CredentialCard
                      key={meta.id}
                      meta={meta}
                      index={index}
                      isSelected={isSelected}
                      onToggle={() => toggle(meta.id)}
                    />
                  )
                })}
              </SimpleGrid>

              <Text fontSize='xs' color='texts.subtle'>
                {t('voter_auth.step.identity.counter_selected', {
                  defaultValue: '{{count}} selected',
                  count: value.length,
                })}
              </Text>
            </VStack>
          )
        }}
      />

      <Box pt={1}>
        <SecurityGauge credentials={credentials} use2FA={use2FA} />
      </Box>
    </VStack>
  )
}
