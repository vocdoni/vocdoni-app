import { Box, Button, HStack, Icon, Stack, Text } from '@chakra-ui/react'
import type { TFunction } from 'i18next'
import { useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { LuEye } from 'react-icons/lu'
import { getAuthFieldLabel, getContactFieldLabel } from '~components/Process/CSP/fields'
import { CodeMethod, getCodeTwoFaFields } from './utils'

const getSampleValue = (t: TFunction, field: string) => {
  switch (field) {
    case 'memberNumber':
      return t('voter_auth.sample.memberNumber', { defaultValue: '00482' })
    case 'name':
      return t('voter_auth.sample.name', { defaultValue: 'Laura' })
    case 'surname':
      return t('voter_auth.sample.surname', { defaultValue: 'Smith' })
    case 'nationalId':
      return t('voter_auth.sample.nationalId', { defaultValue: '12345678Z' })
    case 'birthDate':
      return t('voter_auth.sample.birthDate', { defaultValue: '03/14/1979' })
    default:
      return ''
  }
}

const getSampleContact = (t: TFunction, method: CodeMethod) =>
  method === 'sms'
    ? t('voter_auth.sample.phone', { defaultValue: '+1 555 010 0100' })
    : t('voter_auth.sample.email', { defaultValue: 'laura@example.org' })

// Looks like an input without being one: the preview must stay inert, and a
// real input here would also shadow the modal's own controls for anyone
// locating them by value.
const FakeInput = ({ children }: { children: string }) => (
  <Box
    h={9}
    px={3}
    display='flex'
    alignItems='center'
    borderWidth='1px'
    borderColor='border'
    borderRadius='l2'
    fontSize='sm'
    color='fg.muted'
  >
    {children}
  </Box>
)

const FakeButton = ({ children }: { children: string }) => (
  <Box
    h={9}
    display='flex'
    alignItems='center'
    justifyContent='center'
    bg='colorPalette.solid'
    color='colorPalette.contrast'
    borderRadius='l2'
    fontSize='sm'
    fontWeight='medium'
  >
    {children}
  </Box>
)

const SignInScreen = ({ credentials, codeMethod }: { credentials: readonly string[]; codeMethod: CodeMethod }) => {
  const { t } = useTranslation()
  const hasCode = codeMethod !== 'none'

  return (
    <Stack gap={3}>
      {credentials.map((field) => (
        <Box key={field}>
          <Text fontSize='sm' fontWeight='medium' mb={1.5}>
            {getAuthFieldLabel(t, field)} *
          </Text>
          <FakeInput>{getSampleValue(t, field)}</FakeInput>
        </Box>
      ))}
      {hasCode && (
        <Box>
          <Text fontSize='sm' fontWeight='medium' mb={1.5}>
            {getContactFieldLabel(t, getCodeTwoFaFields(codeMethod))} *
          </Text>
          <FakeInput>{getSampleContact(t, codeMethod)}</FakeInput>
          <Text fontSize='xs' color='fg.muted' mt={1}>
            <Text as='span' fontSize='inherit' fontWeight='bold'>
              {t('csp.important', { defaultValue: 'Important' })}:
            </Text>{' '}
            {t('csp.contact_match_help', 'Must match the one registered in the system')}
          </Text>
        </Box>
      )}
      <HStack align='start' gap={1.5} fontSize='xs' color='fg.muted'>
        <Box boxSize={3} flexShrink={0} mt={0.5} borderWidth='1px' borderColor='border.emphasized' borderRadius='xs' />
        {/* Same children as the real form, so the <2>/<6> slots resolve alike. */}
        <Text fontSize='inherit'>
          <Trans i18nKey='csp.terms_acceptance'>
            I have read and accept the{' '}
            <Text as='span' fontSize='inherit' textDecoration='underline'>
              Terms and Conditions
            </Text>{' '}
            and the{' '}
            <Text as='span' fontSize='inherit' textDecoration='underline'>
              Privacy Policy
            </Text>
            .
          </Trans>
        </Text>
      </HStack>
      <FakeButton>{hasCode ? t('csp.receive_code', 'Receive Code') : t('csp.authenticate', 'Authenticate')}</FakeButton>
    </Stack>
  )
}

const CodeScreen = () => {
  const { t } = useTranslation()

  return (
    <Stack gap={3}>
      <Text fontSize='sm' fontWeight='medium'>
        {t('csp.step1.subtitle', { defaultValue: 'Enter the verification code' })}
      </Text>
      <HStack gap={1.5}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Box key={index} flex='1' h={10} borderWidth='1px' borderColor='border' borderRadius='l2' />
        ))}
      </HStack>
      <Text fontSize='xs' color='fg.muted'>
        <Trans
          i18nKey='csp.step1.resend_text'
          defaults="Didn't receive the code? <resendBtn>Resend it</resendBtn>"
          components={{ resendBtn: <Text as='span' fontSize='inherit' textDecoration='underline' /> }}
        />
      </Text>
      <FakeButton>{t('csp.authenticate', 'Authenticate')}</FakeButton>
    </Stack>
  )
}

type Screen = 'signIn' | 'code'

// Stands in for the form while nothing is chosen: a sign-in screen's shape,
// without repeating the "choose something" prompt the modal already shows.
const EmptyScreen = () => (
  <Stack gap={3} aria-hidden>
    <Box h={2} w='40%' borderRadius='full' bg='bg.emphasized' />
    <Box h={9} borderRadius='l2' bg='bg.muted' />
    <Box h={2} w='55%' borderRadius='full' bg='bg.emphasized' />
    <Box h={9} borderRadius='l2' bg='bg.muted' />
    <Box h={9} borderRadius='l2' bg='bg.emphasized' />
  </Stack>
)

/**
 * A static rendering of the voter sign-in dialog (`CSP/Step0` and `Step1`) for
 * the configuration being edited, with sample values. Labels and button texts
 * come from the same translation keys and helpers as the real dialog.
 */
export const VoterSignInPreview = ({
  credentials,
  codeMethod,
}: {
  credentials: readonly string[]
  codeMethod: CodeMethod
}) => {
  const { t } = useTranslation()
  const [screen, setScreen] = useState<Screen>('signIn')
  const hasConfig = credentials.length > 0 || codeMethod !== 'none'
  const visibleScreen = codeMethod === 'none' ? 'signIn' : screen

  // Any edit shows the first step again: with the second step on screen, a
  // change to what voters type would otherwise look like it did nothing.
  const configKey = `${credentials.join()}|${codeMethod}`
  useEffect(() => setScreen('signIn'), [configKey])

  return (
    <Stack gap={3} as='section' aria-labelledby='voter-signin-preview-title' data-testid='voter-signin-preview'>
      {/* Heading and toggle on separate rows: side by side, the heading wrapped
          as soon as the toggle appeared (and sooner in longer languages). */}
      <Stack gap={2}>
        {/* Muted, with an icon: a label for this zone, not a third step. On
            phones the fold button above already carries the same words. */}
        <HStack gap={1.5} color='fg.muted' display={{ base: 'none', md: 'flex' }}>
          <Icon as={LuEye} boxSize={3.5} />
          <Text id='voter-signin-preview-title' fontSize='sm' fontWeight='medium' whiteSpace='nowrap'>
            {t('voter_auth.preview.title', { defaultValue: 'What voters will see' })}
          </Text>
        </HStack>
        {codeMethod !== 'none' && (
          <HStack gap={0.5} p={0.5} bg='bg.panel' borderWidth='1px' borderColor='border' borderRadius='l2'>
            {(['signIn', 'code'] as const).map((value) => (
              <Button
                key={value}
                size='xs'
                flex='1'
                variant='ghost'
                bg={visibleScreen === value ? 'bg.emphasized' : undefined}
                fontWeight={visibleScreen === value ? 'semibold' : 'normal'}
                aria-pressed={visibleScreen === value}
                onClick={() => setScreen(value)}
              >
                {value === 'signIn'
                  ? t('voter_auth.preview.first_step', { defaultValue: 'First step' })
                  : t('voter_auth.preview.second_step', { defaultValue: 'Second step' })}
              </Button>
            ))}
          </HStack>
        )}
      </Stack>
      {/* Raised on the rail's backdrop, like the real dialog over the page. */}
      <Box borderWidth='1px' borderColor='border' borderRadius='l3' bg='bg.panel' shadow='md' p={5}>
        <Text fontSize='lg' fontWeight='semibold' mb={4}>
          {t('csp.step1.title', { defaultValue: 'Authentication' })}
        </Text>
        {!hasConfig ? (
          <EmptyScreen />
        ) : visibleScreen === 'signIn' ? (
          <SignInScreen credentials={credentials} codeMethod={codeMethod} />
        ) : (
          <CodeScreen />
        )}
      </Box>
    </Stack>
  )
}
