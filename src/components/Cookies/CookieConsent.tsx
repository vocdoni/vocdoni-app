import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppEnv } from '~src/app-env'

import { AlertRoot as Alert, AlertDescription, AlertTitle, Box, Button, HStack, Link } from '@chakra-ui/react'
import { getCookieConsent, hasCookieConsent, initializeGTM, setCookieConsent } from './utils'

export function CookieConsent() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const privacyPolicyUrl = AppEnv.PRIVACY_POLICY_URL

  useEffect(() => {
    setMounted(true)
    // Check if user has already made a choice
    const hasConsent = hasCookieConsent()

    if (hasConsent) {
      // User has already made a choice, initialize GTM accordingly
      const consent = getCookieConsent()
      const accepted = consent === 'accepted'
      initializeGTM(accepted)
    } else {
      // Show the cookie consent banner
      setOpen(true)
    }
  }, [])

  const handleAccept = () => {
    setCookieConsent(true)
    initializeGTM(true)
    setOpen(false)
  }

  const handleReject = () => {
    setCookieConsent(false)
    initializeGTM(false)
    setOpen(false)
  }

  // Don't render anything on server-side or if banner is closed
  if (!mounted || !open) return null

  return (
    <Alert
      status='neutral'
      role='dialog'
      aria-label={t('cookies.aria_label', { defaultValue: 'Cookie consent banner' })}
      position='fixed'
      bottom={{ base: 4, md: 6 }}
      left='50%'
      transform='translateX(-50%)'
      w='calc(100% - 2rem)'
      maxW='cookies-consent'
      zIndex='top'
      flexDirection={{ base: 'column', md: 'row' }}
      alignItems={{ base: 'stretch', md: 'center' }}
      justifyContent='space-between'
    >
      <Box>
        <AlertTitle fontSize='md' mb={1}>
          {t('cookies.title', { defaultValue: 'Cookie consent' })}
        </AlertTitle>
        <AlertDescription fontSize='sm'>
          {t('cookies.description', {
            defaultValue:
              'We use cookies and analytics tools to improve your experience and understand how you interact with our website. You can choose to accept or reject cookies.',
          })}{' '}
          <Link href={privacyPolicyUrl} target='_blank' rel='noopener noreferrer' textDecoration='underline'>
            {t('cookies.learnMore', { defaultValue: 'Learn more' })}
          </Link>
        </AlertDescription>
      </Box>

      <HStack justify='end' gap={2}>
        <Button variant='outline' size='sm' onClick={handleReject}>
          {t('cookies.reject', { defaultValue: 'Reject' })}
        </Button>
        <Button size='sm' onClick={handleAccept}>
          {t('cookies.accept', { defaultValue: 'Accept' })}
        </Button>
      </HStack>
    </Alert>
  )
}
