import { Box, Flex, HStack, Icon, Stack, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { LuEye, LuIdCard, LuShieldCheck } from 'react-icons/lu'

/**
 * Rail panel showing what the voter will see when they open a certificate census
 * vote. Ported from the validated V1 mockup without the "I don't have a certificate" link.
 */
export const CertificatePreview = () => {
  const { t } = useTranslation()

  return (
    <Stack gap={3}>
      <HStack gap={1.5} color='fg.muted'>
        <Icon as={LuEye} boxSize={3.5} />
        <Text fontSize='sm' fontWeight='medium'>
          {t('voter_auth.preview.title', { defaultValue: 'What voters will see' })}
        </Text>
      </HStack>
      <Box borderWidth='1px' borderColor='border' borderRadius='l3' bg='bg.panel' shadow='md' p={5}>
        <Text fontSize='lg' fontWeight='semibold' mb={4}>
          {t('voter_auth.certificate_preview.identify_to_vote', { defaultValue: 'Identify to vote' })}
        </Text>
        <Stack gap={3}>
          <Flex
            minH={9}
            py={2}
            px={3}
            gap={2}
            align='center'
            justify='center'
            bg='colorPalette.solid'
            color='colorPalette.contrast'
            borderRadius='l2'
            fontSize='sm'
            fontWeight='medium'
            textAlign='center'
          >
            <Icon as={LuIdCard} flexShrink={0} />
            {t('voter_auth.certificate_preview.button', { defaultValue: 'Access with your digital certificate' })}
          </Flex>
          <Text fontSize='xs' color='fg.muted' textAlign='center'>
            {t('voter_auth.certificate_preview.consent', {
              defaultValue: 'By continuing you accept the Terms and Privacy Policy.',
            })}
          </Text>
          {(
            [
              [
                LuIdCard,
                t('voter_auth.certificate_preview.help_cert', {
                  defaultValue: 'Works with idCAT Certificat and FNMT certificates.',
                }),
              ],
              [
                LuShieldCheck,
                t('voter_auth.certificate_preview.help_privacy', {
                  defaultValue: "We only use your certificate to check you're on the voter list.",
                }),
              ],
            ] as const
          ).map(([IconComp, line]) => (
            <HStack key={line} align='start' gap={2}>
              <Icon as={IconComp} boxSize={3.5} mt='2px' color='fg.muted' flexShrink={0} />
              <Text fontSize='xs' color='fg.muted'>
                {line}
              </Text>
            </HStack>
          ))}
        </Stack>
      </Box>
    </Stack>
  )
}
