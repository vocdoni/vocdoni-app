import { createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSaasAccount } from '~components/Account/SaasAccountProvider'
import { useSubscription } from '~components/Auth/Subscription'
import { useAuth } from '~components/Auth/useAuth'
import { COOKIE_CONSENT_CHANGE_EVENT, getCookieConsent } from '~components/Cookies/utils'
import { useProfile } from '~queries/account'
import { useAppEnv } from '~src/app-env'
import {
  applyPosthogConsent,
  identifyPosthogUser,
  initializeGTM,
  initializePlausible,
  initializePosthog,
  PosthogConsent,
  registerPosthogSuperProperties,
  resetPosthogUser,
  setPosthogOrganization,
  setPosthogSessionRecording,
  toPosthogConsent,
  trackAnalyticsEvent,
  trackGTMEvent,
  trackPlausibleEvent,
  trackPosthogEvent,
} from '~utils/analytics'

const useAnalyticsProvider = () => {
  const {
    GTM_CONTAINER_ID: gtmContainerId,
    PLAUSIBLE_DOMAIN: plausibleDomain,
    POSTHOG_KEY: posthogKey,
    POSTHOG_HOST: posthogHost,
    ANALYTICS_CLIENT_ID,
  } = useAppEnv()
  const analyticsClientId = ANALYTICS_CLIENT_ID?.trim() || undefined
  const { isAuthenticated } = useAuth()
  const { data: profile } = useProfile({ enabled: isAuthenticated })
  const { organization } = useSaasAccount()
  const { subscription } = useSubscription()
  const { i18n } = useTranslation()
  const [consent, setConsent] = useState<PosthogConsent>(() => toPosthogConsent(getCookieConsent()))

  useEffect(() => {
    const syncConsent = () => setConsent(toPosthogConsent(getCookieConsent()))
    window.addEventListener(COOKIE_CONSENT_CHANGE_EVENT, syncConsent)
    return () => window.removeEventListener(COOKIE_CONSENT_CHANGE_EVENT, syncConsent)
  }, [])

  useEffect(() => {
    if (plausibleDomain) {
      initializePlausible({ domain: plausibleDomain }, analyticsClientId)
    }

    if (gtmContainerId && window.location.pathname === '/') {
      initializeGTM({ gtmId: gtmContainerId }, analyticsClientId)
    }

    if (posthogKey) {
      initializePosthog({ key: posthogKey, host: posthogHost, analyticsClientId, consent })
    }
  }, [gtmContainerId, plausibleDomain, posthogKey, posthogHost, analyticsClientId, consent])

  useEffect(() => {
    applyPosthogConsent(consent)
  }, [consent])

  // Session replay only for consented, authenticated dashboard users
  useEffect(() => {
    setPosthogSessionRecording(consent === 'accepted' && isAuthenticated)
  }, [consent, isAuthenticated])

  // Keep the interface locale attached to every event
  useEffect(() => {
    const locale = i18n.resolvedLanguage || i18n.language
    if (locale) {
      registerPosthogSuperProperties({ locale })
    }
  }, [i18n.resolvedLanguage, i18n.language])

  // Identify dashboard users only after explicit cookie consent; anonymous
  // visitors and voters never get a person profile.
  const identifiedRef = useRef<string | null>(null)
  useEffect(() => {
    if (consent !== 'accepted' || !profile?.id || identifiedRef.current === profile.id) return

    identifyPosthogUser(profile.id, {
      email: profile.email,
      first_name: profile.firstName,
      last_name: profile.lastName,
      organizations_count: profile.organizations?.length,
    })
    identifiedRef.current = profile.id
  }, [consent, profile])

  // Unlink the device from the user on logout
  const wasAuthenticatedRef = useRef(false)
  useEffect(() => {
    if (wasAuthenticatedRef.current && !isAuthenticated) {
      resetPosthogUser()
      identifiedRef.current = null
    }
    wasAuthenticatedRef.current = isAuthenticated
  }, [isAuthenticated])

  // Organization-level BI: group profile plus super properties so insights can
  // break down by organization/plan even without the group analytics add-on.
  useEffect(() => {
    if (!organization?.address) return

    setPosthogOrganization(organization.address, {
      // PostHog labels a group by its `name` property; without it every
      // organization shows up as a bare address in insights and group lists.
      name: organization.account?.name?.default,
      type: organization.type,
      country: organization.country,
      size: organization.size,
      created_at: organization.createdAt,
      plan_id: subscription?.subscriptionDetails?.planId,
      plan_name: subscription?.plan?.name,
      subscription_active: subscription?.subscriptionDetails?.active,
      renewal_date: subscription?.subscriptionDetails?.renewalDate,
      max_census_size: subscription?.subscriptionDetails?.maxCensusSize,
      usage_processes: subscription?.usage?.processes,
      usage_users: subscription?.usage?.users,
      usage_sub_orgs: subscription?.usage?.subOrgs,
      usage_sent_emails: subscription?.usage?.sentEmails,
      usage_sent_sms: subscription?.usage?.sentSMS,
    })
    registerPosthogSuperProperties({
      org_address: organization.address,
      // Duplicated from the group profile on purpose: group properties are only
      // queryable with the group analytics add-on, whereas a super property
      // lands on every event and can always be broken down by.
      org_name: organization.account?.name?.default,
      org_plan: subscription?.plan?.name,
    })
  }, [
    organization?.address,
    organization?.account?.name?.default,
    organization?.type,
    organization?.country,
    organization?.size,
    organization?.createdAt,
    subscription,
  ])

  return {
    trackEvent: trackAnalyticsEvent,
    trackPlausibleEvent,
    trackGTMEvent,
    trackPosthogEvent,
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
