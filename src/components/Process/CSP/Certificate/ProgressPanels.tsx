import { Button, Heading, HStack, Icon, Spinner } from '@chakra-ui/react'
import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { LuRefreshCw } from 'react-icons/lu'
import { P, Panel } from './kit'

/** Shown while the browser certificate picker is open. Focus moves to the heading. */
export const OpeningPanel = forwardRef<HTMLHeadingElement>(function OpeningPanel(_props, ref) {
  const { t } = useTranslation()
  return (
    <Panel aria-live='polite'>
      <HStack gap={3} mb={2} align='center'>
        <Spinner size='md' />
        <Heading as='h2' ref={ref} tabIndex={-1} outline='none' fontSize='xl' fontWeight='semibold'>
          {t('cert_auth.opening.title', { defaultValue: 'Opening the certificate window...' })}
        </Heading>
      </HStack>
      <P>{t('cert_auth.opening.body', { defaultValue: 'Choose the certificate with your name and press OK.' })}</P>
    </Panel>
  )
})

type CheckingPanelProps = {
  /** Show the "still checking" copy when the first attempt is taking longer than expected. */
  slow?: boolean
}

/** Shown while the backend is verifying the certificate. Announced to screen readers. */
export const CheckingPanel = forwardRef<HTMLHeadingElement, CheckingPanelProps>(function CheckingPanel({ slow }, ref) {
  const { t } = useTranslation()
  return (
    <Panel aria-live='polite'>
      <HStack gap={3} mb={2} align='center'>
        <Spinner size='md' />
        <Heading as='h2' ref={ref} tabIndex={-1} outline='none' fontSize='xl' fontWeight='semibold'>
          {slow
            ? t('cert_auth.checking.slow_title', { defaultValue: 'Still checking with your certificate provider...' })
            : t('cert_auth.checking.title', { defaultValue: 'Checking your certificate...' })}
        </Heading>
      </HStack>
      <P color='fg.muted'>
        {slow
          ? t('cert_auth.checking.slow_body', { defaultValue: 'Keep this page open. It can take up to 30 seconds.' })
          : t('cert_auth.checking.body', { defaultValue: 'This can take up to 30 seconds.' })}
      </P>
    </Panel>
  )
})

type StalledPanelProps = {
  onRetry(): void
}

/** Shown when the certificate check timed out. Lets the voter retry without re-choosing. */
export const StalledPanel = forwardRef<HTMLHeadingElement, StalledPanelProps>(function StalledPanel({ onRetry }, ref) {
  const { t } = useTranslation()
  return (
    <Panel>
      <HStack gap={3} mb={2} align='center'>
        <Icon as={LuRefreshCw} boxSize={6} mt='2px' flexShrink={0} aria-hidden />
        <Heading as='h2' ref={ref} tabIndex={-1} outline='none' fontSize='xl' fontWeight='semibold'>
          {t('cert_auth.stalled.title', { defaultValue: "The check didn't finish" })}
        </Heading>
      </HStack>
      <P mb={4}>
        {t('cert_auth.stalled.body', {
          defaultValue:
            "This is usually a slow connection. Press Try again: you won't need to choose your certificate again.",
        })}
      </P>
      <Button size='lg' w={{ base: 'full', md: 'auto' }} onClick={onRetry}>
        <Icon as={LuRefreshCw} />
        {t('cert_auth.actions.try_again', { defaultValue: 'Try again' })}
      </Button>
    </Panel>
  )
})
