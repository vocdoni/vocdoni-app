import { createContext, PropsWithChildren, useContext, useEffect } from 'react'
import { useAppEnv } from '~src/app-env'
import {
  AnalyticsEvent,
  initializeGTM,
  initializePlausible,
  trackGTMEvent,
  trackPlausibleEvent,
} from '~utils/analytics'

const useAnalyticsProvider = () => {
  const { GTM_CONTAINER_ID: gtmContainerId, PLAUSIBLE_DOMAIN: plausibleDomain, ANALYTICS_CLIENT_ID } = useAppEnv()
  const analyticsClientId = ANALYTICS_CLIENT_ID?.trim() || undefined

  useEffect(() => {
    if (plausibleDomain) {
      initializePlausible({ domain: plausibleDomain }, analyticsClientId)
    }

    if (gtmContainerId && window.location.pathname === '/') {
      initializeGTM({ gtmId: gtmContainerId }, analyticsClientId)
    }
  }, [gtmContainerId, plausibleDomain, analyticsClientId])

  const trackEvent = (event: AnalyticsEvent) => {
    trackPlausibleEvent(event)
    trackGTMEvent(event)
  }

  return {
    trackEvent,
    trackPlausibleEvent,
    trackGTMEvent,
  }
}

type AnalyticsContextValue = ReturnType<typeof useAnalyticsProvider>
const AnalyticsContext = createContext<AnalyticsContextValue | null>(null)

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider')
  }
  return context
}

export const AnalyticsProvider = ({ children }: PropsWithChildren) => {
  const value = useAnalyticsProvider()

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
}
