interface ImportMeta {
  env: {
    NODE_ENV: string
    DEV: boolean
    BASE_URL: string
    VITEST: true | undefined
    VOCDONI_ENVIRONMENT: string
    CUSTOM_ORGANIZATION_DOMAINS: {
      [key: string]: string
    }
    PROCESS_IDS: string
    EMAILJS_SERVICE_ID: string
    EMAILJS_TEMPLATE_ID: string
    EMAILJS_PUBLIC_ID: string
    theme: string
    title: string
    CSP_URL: string
    CSP_PUBKEY: string
    DEFAULT_CENSUS_SIZE: number
    STRIPE_PUBLIC_KEY: string
    SAAS_URL: string
    OAUTH_URL: string
    PRIORITY_SUPPORT_PHONE: string
    CALCOM_EVENT_SLUG: string
    VIDEO_TUTORIAL: Record<string, string>
    GTM_CONTAINER_ID: string
    PLAUSIBLE_DOMAIN: string
    VOCDONI_CONTACT_EMAIL: string
    ANNOUNCEMENT: string
    PRIVACY_POLICY_URL: string
    TERMS_OF_SERVICE_URL: string
    WHATSAPP_PHONE_NUMBER: string
    LANGUAGES: Record<string, string>
    ANALYTICS_CLIENT_ID: string
    CRISP_WEBSITE_ID: string
    SHARED_CENSUS_ALWAYS_VISIBLE_TEXT?: Record<string, string>
    SHARED_CENSUS_DISCONNECTED_TEXT?: Record<string, string>
    SHARED_CENSUS_CONNECTED_TEXT?: Record<string, string>
    SHARED_CENSUS_POST_TEXT?: Record<string, string>
    STREAM_URL?: string
    HIDE_VOTER_COUNT: boolean
  }
}

declare global {
  var __APP_ENV__:
    | {
        VOCDONI_ENVIRONMENT?: string
        CUSTOM_ORGANIZATION_DOMAINS?: Record<string, string>
        PROCESS_IDS?: string
        DEFAULT_CENSUS_SIZE?: number
        title?: string
        STRIPE_PUBLIC_KEY?: string
        SAAS_URL?: string
        OAUTH_URL?: string
        PRIORITY_SUPPORT_PHONE?: string
        CALCOM_EVENT_SLUG?: string
        VIDEO_TUTORIAL?: Record<string, string>
        GTM_CONTAINER_ID?: string
        PLAUSIBLE_DOMAIN?: string
        VOCDONI_CONTACT_EMAIL?: string
        ANNOUNCEMENT?: string
        PRIVACY_POLICY_URL?: string
        TERMS_OF_SERVICE_URL?: string
        WHATSAPP_PHONE_NUMBER?: string
        LANGUAGES?: Record<string, string> | string
        ANALYTICS_CLIENT_ID?: string
        CRISP_WEBSITE_ID?: string
        SHARED_CENSUS_ALWAYS_VISIBLE_TEXT?: Record<string, string> | string
        SHARED_CENSUS_DISCONNECTED_TEXT?: Record<string, string> | string
        SHARED_CENSUS_CONNECTED_TEXT?: Record<string, string> | string
        SHARED_CENSUS_POST_TEXT?: Record<string, string> | string
        STREAM_URL?: string
        HIDE_VOTER_COUNT?: boolean
      }
    | undefined
}
