import { resolveLanguagesSlice } from '~i18n/languages'

/**
 * Shape of the public runtime configuration exposed to the app. Resolved on the
 * server from process.env (see buildAppEnv) and delivered to the client through
 * Vike's globalContext + passToClient.
 */
export type AppEnv = {
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
  POSTHOG_KEY?: string
  POSTHOG_HOST?: string
  VOCDONI_CONTACT_EMAIL?: string
  ANNOUNCEMENT?: string
  APP_URL?: string
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

type AppEnvObject = AppEnv
type EnvSource = Record<string, string | undefined>

const trimTrailingSlash = (value: string) => (value.endsWith('/') ? value.slice(0, -1) : value)

const defaultVideoTutorial = {
  en: 'https://www.youtube.com/watch?v=bIKxUTS4X8E',
}

const resolveVideoTutorials = (rawValue?: string): Record<string, string> => {
  if (!rawValue) {
    return defaultVideoTutorial
  }

  try {
    const parsed = JSON.parse(rawValue)

    if (typeof parsed !== 'object' || parsed === null || !parsed.en) {
      console.warn('VIDEO_TUTORIAL must be a JSON object containing at least the "en" key. Falling back to default.')
      return defaultVideoTutorial
    }

    return parsed
  } catch {
    console.warn('Invalid JSON format for VIDEO_TUTORIAL. Falling back to default "en" video.')
    return defaultVideoTutorial
  }
}

const resolveCustomOrganizationDomains = (rawValue?: string): Record<string, string> => {
  if (!rawValue) {
    return {}
  }

  try {
    const parsed = JSON.parse(rawValue)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      console.warn('CUSTOM_ORGANIZATION_DOMAINS must be a JSON object. Falling back to empty mapping.')
      return {}
    }
    return parsed
  } catch {
    console.warn('Invalid JSON format for CUSTOM_ORGANIZATION_DOMAINS. Falling back to empty mapping.')
    return {}
  }
}

// Validates a SHARED_CENSUS_* JSON map. Unlike the previous build-time plugin
// (which threw to fail the build), this is lenient: at runtime an invalid value
// is logged and dropped so a config typo never takes down SSR for every request.
const resolveSharedCensusText = (
  rawValue: string | undefined,
  variableName: string,
  defaultLanguage: string
): Record<string, string> | undefined => {
  if (!rawValue) {
    return undefined
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(rawValue)
  } catch (error: any) {
    console.warn(`${variableName} must be valid JSON. Ignoring. ${error.message}`)
    return undefined
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    console.warn(`${variableName} must be a JSON object mapping language codes to markdown strings. Ignoring.`)
    return undefined
  }

  if (!Object.prototype.hasOwnProperty.call(parsed, defaultLanguage)) {
    console.warn(`${variableName} must include the default language "${defaultLanguage}". Ignoring.`)
    return undefined
  }

  for (const [lang, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (typeof value !== 'string') {
      console.warn(`${variableName} values must be strings. Invalid value for "${lang}". Ignoring.`)
      return undefined
    }
  }

  return parsed as Record<string, string>
}

const resolveStreamUrl = (value: string | undefined): string | undefined => {
  if (!value) {
    return undefined
  }

  try {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol)) {
      console.warn('STREAM_URL must use http or https. Ignoring.')
      return undefined
    }
    return url.toString()
  } catch (error: any) {
    console.warn(`Invalid STREAM_URL. Ignoring. ${error.message}`)
    return undefined
  }
}

/**
 * Resolves the public application environment from a raw env source (e.g.
 * `process.env`). This used to run only at build time and was inlined into the
 * bundle via Vite's `define`, which froze the values into the Docker image.
 *
 * It now runs once on the server (at globalContext creation) so the same image
 * can be configured per environment with plain runtime env vars (`docker run -e ...`).
 * The result is stored on Vike's globalContext and forwarded to the client via
 * `passToClient` (see src/pages/+onCreateGlobalContext.server.ts and +config.ts).
 */
export const buildAppEnv = (env: EnvSource = {}): AppEnvObject => {
  const languagesSlice = resolveLanguagesSlice(env.LANGUAGES)
  const defaultLanguage = Object.keys(languagesSlice)[0]

  return {
    VOCDONI_ENVIRONMENT: env.VOCDONI_ENVIRONMENT || 'dev',
    CUSTOM_ORGANIZATION_DOMAINS: resolveCustomOrganizationDomains(env.CUSTOM_ORGANIZATION_DOMAINS),
    PROCESS_IDS: env.PROCESS_IDS || '',
    DEFAULT_CENSUS_SIZE: Number(env.DEFAULT_CENSUS_SIZE) || 5000,
    // Only set when explicitly configured: consumers fall back to the
    // localized default title (see src/pages/shared/defaultHeadMeta.ts).
    title: env.APP_TITLE || undefined,
    APP_URL: env.APP_URL,
    STRIPE_PUBLIC_KEY: env.STRIPE_PUBLIC_KEY,
    SAAS_URL: trimTrailingSlash(env.SAAS_URL || 'https://saas-api-dev.vocdoni.net'),
    OAUTH_URL: env.OAUTH_URL || 'https://oauth.vocdoni.io',
    PRIORITY_SUPPORT_PHONE: env.PRIORITY_SUPPORT_PHONE,
    CALCOM_EVENT_SLUG: env.CALCOM_EVENT_SLUG,
    VIDEO_TUTORIAL: resolveVideoTutorials(env.VIDEO_TUTORIAL),
    GTM_CONTAINER_ID: env.GTM_CONTAINER_ID,
    PLAUSIBLE_DOMAIN: env.PLAUSIBLE_DOMAIN,
    POSTHOG_KEY: env.POSTHOG_KEY,
    POSTHOG_HOST: trimTrailingSlash(env.POSTHOG_HOST || 'https://eu.i.posthog.com'),
    VOCDONI_CONTACT_EMAIL: env.VOCDONI_CONTACT_EMAIL || 'hello@vocdoni.io',
    ANNOUNCEMENT: env.ANNOUNCEMENT,
    PRIVACY_POLICY_URL: trimTrailingSlash(env.PRIVACY_POLICY_URL || 'https://vocdoni.io/privacy'),
    TERMS_OF_SERVICE_URL: trimTrailingSlash(env.TERMS_OF_SERVICE_URL || 'https://vocdoni.io/terms'),
    WHATSAPP_PHONE_NUMBER: env.WHATSAPP_PHONE_NUMBER || '+34 621 501 155',
    LANGUAGES: languagesSlice,
    ANALYTICS_CLIENT_ID: env.ANALYTICS_CLIENT_ID || '',
    CRISP_WEBSITE_ID: env.CRISP_WEBSITE_ID || '',
    HIDE_VOTER_COUNT: env.HIDE_VOTER_COUNT === 'true',
    SHARED_CENSUS_ALWAYS_VISIBLE_TEXT: resolveSharedCensusText(
      env.SHARED_CENSUS_ALWAYS_VISIBLE_TEXT,
      'SHARED_CENSUS_ALWAYS_VISIBLE_TEXT',
      defaultLanguage
    ),
    SHARED_CENSUS_DISCONNECTED_TEXT: resolveSharedCensusText(
      env.SHARED_CENSUS_DISCONNECTED_TEXT,
      'SHARED_CENSUS_DISCONNECTED_TEXT',
      defaultLanguage
    ),
    SHARED_CENSUS_CONNECTED_TEXT: resolveSharedCensusText(
      env.SHARED_CENSUS_CONNECTED_TEXT,
      'SHARED_CENSUS_CONNECTED_TEXT',
      defaultLanguage
    ),
    SHARED_CENSUS_POST_TEXT: resolveSharedCensusText(
      env.SHARED_CENSUS_POST_TEXT,
      'SHARED_CENSUS_POST_TEXT',
      defaultLanguage
    ),
    STREAM_URL: resolveStreamUrl(env.STREAM_URL),
  }
}
