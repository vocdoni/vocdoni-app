import { Crisp } from 'crisp-sdk-web'
import { useEffect, useState } from 'react'

import { COOKIE_CONSENT_CHANGE_EVENT, getCookieConsent } from '~components/Cookies/utils'
import { AppEnv } from '~src/app-env'

const CrispChat = () => {
  const websiteId = AppEnv.CRISP_WEBSITE_ID
  const [hasConsent, setHasConsent] = useState(() => getCookieConsent() === 'accepted')

  useEffect(() => {
    if (!websiteId || typeof window === 'undefined' || !hasConsent) {
      return
    }

    Crisp.configure(websiteId)
  }, [hasConsent, websiteId])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const syncConsent = () => {
      setHasConsent(getCookieConsent() === 'accepted')
    }

    window.addEventListener(COOKIE_CONSENT_CHANGE_EVENT, syncConsent)

    return () => {
      window.removeEventListener(COOKIE_CONSENT_CHANGE_EVENT, syncConsent)
    }
  }, [])

  return null
}

export default CrispChat
