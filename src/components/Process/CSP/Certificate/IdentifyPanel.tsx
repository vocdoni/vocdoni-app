import { Grid, Heading, HStack, Icon, Link, Stack } from '@chakra-ui/react'
import type { ForwardedRef, ReactNode } from 'react'
import { forwardRef } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { LuIdCard, LuShieldCheck } from 'react-icons/lu'
import { useAppEnv } from '~src/app-env'
import { CertButton } from './CertButton'
import { P, Panel, Small, Tiny } from './kit'

/** Consent line rendered under the button with links to Terms and Privacy Policy. */
export const Consent = ({ align = 'center' }: { align?: 'center' | 'start' }) => {
  const { TERMS_OF_SERVICE_URL, PRIVACY_POLICY_URL } = useAppEnv()
  const { t } = useTranslation()
  return (
    <Tiny color='fg.muted' textAlign={align}>
      <Trans
        i18nKey='cert_auth.identify.consent'
        defaults='By continuing you accept the <terms>Terms</terms> and <privacy>Privacy Policy</privacy>.'
        components={{
          terms: <Link href={TERMS_OF_SERVICE_URL} target='_blank' rel='noopener noreferrer' fontSize='xs' />,
          privacy: <Link href={PRIVACY_POLICY_URL} target='_blank' rel='noopener noreferrer' fontSize='xs' />,
        }}
      />
    </Tiny>
  )
}

const HelpLine = ({ icon, children }: { icon: typeof LuIdCard; children: ReactNode }) => (
  <HStack align='start' gap={2}>
    <Icon as={icon} boxSize={4} mt='3px' color='fg.muted' flexShrink={0} />
    <Small color='fg.muted'>{children}</Small>
  </HStack>
)

/** Two help lines shown next to the button: which certificates work and what we do with it. */
const HelpLines = () => {
  const { t } = useTranslation()
  return (
    <Stack gap={2}>
      <HelpLine icon={LuIdCard}>
        {t('cert_auth.identify.works_with', { defaultValue: 'Works with idCAT Certificat and FNMT certificates.' })}
      </HelpLine>
      <HelpLine icon={LuShieldCheck}>
        {t('cert_auth.identify.only_check', {
          defaultValue: "We only use your certificate to check you're on the voter list.",
        })}
      </HelpLine>
    </Stack>
  )
}

type IdentifyPanelProps = {
  onStart(): void
  resume?: boolean
  disabled?: boolean
  title?: string
  buttonLabel?: string
}

/**
 * Prominent sign-in panel above the ballot questions.
 * title/buttonLabel let other panels (e.g. pre-check) reuse this layout with different copy.
 */
export const IdentifyPanel = forwardRef(function IdentifyPanel(
  { onStart, resume, disabled, title, buttonLabel }: IdentifyPanelProps,
  ref: ForwardedRef<HTMLHeadingElement>
) {
  const { t } = useTranslation()
  const headingText = title ?? t('cert_auth.identify.title', { defaultValue: 'Identify to vote' })
  return (
    <Panel>
      <Heading as='h2' fontSize='xl' fontWeight='semibold' mb={4} tabIndex={-1} outline='none' ref={ref}>
        {headingText}
      </Heading>
      {resume && (
        <P mb={4}>
          {t('cert_auth.identify.resume', {
            defaultValue: "Let's finish identifying you. Press the button to continue.",
          })}
        </P>
      )}
      <Grid templateColumns={{ base: '1fr', md: 'minmax(0,1fr) minmax(0,1.2fr)' }} gap={{ base: 4, md: 8 }}>
        <Stack gap={3}>
          <CertButton onClick={onStart} disabled={disabled}>
            {buttonLabel}
          </CertButton>
          <Consent />
        </Stack>
        <HelpLines />
      </Grid>
    </Panel>
  )
})
