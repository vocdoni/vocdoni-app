const isStringRecord = (value: unknown): value is Record<string, string> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const DEFAULT_LANGUAGES: Record<string, string> = { en: 'English' }
const serverRuntimeEnv = typeof process !== 'undefined' ? process.env : undefined
const getClientRuntimeEnv = () => globalThis.__APP_ENV__

const getEnvValue = <K extends keyof NonNullable<typeof globalThis.__APP_ENV__>>(key: K) => {
  const clientValue = getClientRuntimeEnv()?.[key]
  if (clientValue !== undefined) {
    return clientValue
  }

  return serverRuntimeEnv?.[key as string]
}

const getDevMode = () => {
  try {
    return import.meta.env.DEV
  } catch {
    return false
  }
}

export const AppEnv = {
  get ANALYTICS_CLIENT_ID() {
    return getEnvValue('ANALYTICS_CLIENT_ID')
  },
  get ANNOUNCEMENT() {
    return getEnvValue('ANNOUNCEMENT')
  },
  get CALCOM_EVENT_SLUG() {
    return getEnvValue('CALCOM_EVENT_SLUG')
  },
  get CRISP_WEBSITE_ID() {
    return getEnvValue('CRISP_WEBSITE_ID')
  },
  get CUSTOM_ORGANIZATION_DOMAINS() {
    return getEnvValue('CUSTOM_ORGANIZATION_DOMAINS')
  },
  get DEV() {
    return getDevMode()
  },
  get GTM_CONTAINER_ID() {
    return getEnvValue('GTM_CONTAINER_ID')
  },
  get HIDE_VOTER_COUNT() {
    return getEnvValue('HIDE_VOTER_COUNT')
  },
  get LANGUAGES() {
    return getEnvValue('LANGUAGES')
  },
  get OAUTH_URL() {
    return getEnvValue('OAUTH_URL')
  },
  get PLAUSIBLE_DOMAIN() {
    return getEnvValue('PLAUSIBLE_DOMAIN')
  },
  get PRIORITY_SUPPORT_PHONE() {
    return getEnvValue('PRIORITY_SUPPORT_PHONE')
  },
  get PRIVACY_POLICY_URL() {
    return getEnvValue('PRIVACY_POLICY_URL')
  },
  get PROCESS_IDS() {
    return getEnvValue('PROCESS_IDS')
  },
  get SAAS_URL() {
    return getEnvValue('SAAS_URL')
  },
  get SHARED_CENSUS_ALWAYS_VISIBLE_TEXT() {
    return getEnvValue('SHARED_CENSUS_ALWAYS_VISIBLE_TEXT')
  },
  get SHARED_CENSUS_CONNECTED_TEXT() {
    return getEnvValue('SHARED_CENSUS_CONNECTED_TEXT')
  },
  get SHARED_CENSUS_DISCONNECTED_TEXT() {
    return getEnvValue('SHARED_CENSUS_DISCONNECTED_TEXT')
  },
  get SHARED_CENSUS_POST_TEXT() {
    return getEnvValue('SHARED_CENSUS_POST_TEXT')
  },
  get STREAM_URL() {
    return getEnvValue('STREAM_URL')
  },
  get STRIPE_PUBLIC_KEY() {
    return getEnvValue('STRIPE_PUBLIC_KEY')
  },
  get TERMS_OF_SERVICE_URL() {
    return getEnvValue('TERMS_OF_SERVICE_URL')
  },
  get title() {
    return getEnvValue('title') ?? getEnvValue('APP_TITLE')
  },
  get VIDEO_TUTORIAL() {
    return getEnvValue('VIDEO_TUTORIAL')
  },
  get VOCDONI_ENVIRONMENT() {
    return getEnvValue('VOCDONI_ENVIRONMENT')
  },
  get WHATSAPP_PHONE_NUMBER() {
    return getEnvValue('WHATSAPP_PHONE_NUMBER')
  },
}

export const getLanguagesEnv = (): Record<string, string> => {
  const value = AppEnv.LANGUAGES

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return isStringRecord(parsed) && Object.keys(parsed).length > 0 ? parsed : DEFAULT_LANGUAGES
    } catch {
      return DEFAULT_LANGUAGES
    }
  }

  return isStringRecord(value) && Object.keys(value).length > 0 ? value : DEFAULT_LANGUAGES
}

export const getCustomOrganizationDomainsEnv = (): Record<string, string> => {
  const value = AppEnv.CUSTOM_ORGANIZATION_DOMAINS
  return isStringRecord(value) ? value : {}
}
