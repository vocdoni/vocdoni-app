import { createContext, useContext, useMemo, type PropsWithChildren, type ReactNode } from 'react'
import { buildAppEnv, type AppEnv } from './app-env-build'

const isStringRecord = (value: unknown): value is Record<string, string> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const DEFAULT_LANGUAGES: Record<string, string> = { en: 'English' }

/**
 * Normalizes the LANGUAGES value (which may be an object or, defensively, a JSON
 * string) into a non-empty languages map, falling back to English.
 */
export const normalizeLanguages = (value: AppEnv['LANGUAGES']): Record<string, string> => {
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

let warnedMissingAppEnv = false

/**
 * Resolves the runtime env coming from Vike's globalContext.
 *
 * The defaults fallback keeps an unexpected render outside the Vike runtime
 * working, but in a real deployment a missing `appEnv` means the server ->
 * client wiring broke and *every* runtime setting silently reverted to its
 * default (PRIMARY_COLOR, SAAS_URL, LANGUAGES...). That degrades quietly and
 * looks like a styling bug, so say it out loud once per process instead.
 */
export const resolveAppEnv = (appEnv: AppEnv | undefined): AppEnv => {
  if (appEnv) {
    return appEnv
  }

  if (!warnedMissingAppEnv) {
    warnedMissingAppEnv = true
    console.warn(
      'appEnv is missing from Vike globalContext: falling back to defaults, so PRIMARY_COLOR, ' +
        'SAAS_URL, LANGUAGES and every other runtime env var are being ignored. Check ' +
        'passToClient in src/pages/+config.ts and src/pages/+onCreateGlobalContext.server.ts.'
    )
  }

  return buildAppEnv({})
}

const AppEnvContext = createContext<AppEnv | null>(null)

/**
 * Provides the public runtime env to the React tree. In the app it is seeded
 * from Vike's globalContext (see AppProviders); in tests it can be provided
 * directly with arbitrary values.
 */
export const AppEnvProvider = ({ value, children }: PropsWithChildren<{ value: AppEnv }>): ReactNode => (
  <AppEnvContext.Provider value={value}>{children}</AppEnvContext.Provider>
)

export const useAppEnv = (): AppEnv => {
  const value = useContext(AppEnvContext)
  if (!value) {
    throw new Error('useAppEnv must be used within an <AppEnvProvider>')
  }
  return value
}

export const useLanguagesEnv = (): Record<string, string> => {
  const { LANGUAGES } = useAppEnv()
  // A JSON-string LANGUAGES value parses into a fresh object on every call;
  // memoize so callers can safely use the map as a hook dependency.
  return useMemo(() => normalizeLanguages(LANGUAGES), [LANGUAGES])
}

export const useCustomOrganizationDomains = (): Record<string, string> => {
  const { CUSTOM_ORGANIZATION_DOMAINS } = useAppEnv()
  return isStringRecord(CUSTOM_ORGANIZATION_DOMAINS) ? CUSTOM_ORGANIZATION_DOMAINS : {}
}
