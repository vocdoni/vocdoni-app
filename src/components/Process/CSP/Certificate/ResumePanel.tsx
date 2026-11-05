import { Button, Heading, HStack, Spinner } from '@chakra-ui/react'
import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Panel } from './kit'

/**
 * Shown in the real browser after the escape hand-off, just before the certificate flow starts on its
 * own. The tap in the app's viewer was the consent, so there is no consent line here.
 */
export const ResumePanel = forwardRef<HTMLHeadingElement, { onCancel(): void }>(function ResumePanel(
  { onCancel },
  ref
) {
  const { t } = useTranslation()
  return (
    <Panel as='section' aria-labelledby='resume-title'>
      <HStack gap={3} mb={4} align='center' role='status'>
        <Spinner size='md' flexShrink={0} />
        <Heading
          id='resume-title'
          ref={ref}
          as='h2'
          fontSize='xl'
          fontWeight='semibold'
          lineHeight='1.3'
          tabIndex={-1}
          outline='none'
        >
          {t('cert_auth.escape.resume_title', { defaultValue: 'Asking for your certificate...' })}
        </Heading>
      </HStack>
      <Button variant='outline' size='lg' w={{ base: 'full', sm: 'auto' }} onClick={onCancel}>
        {t('cert_auth.escape.cancel', { defaultValue: 'Cancel' })}
      </Button>
    </Panel>
  )
})
