import { VocdoniApiClient } from '@vocdoni/api-client'

export type VocdoniEnv = 'dev' | 'stg' | 'prod'

// Explorer base per environment, kept here so explorer links can be built without any chain client.
const explorerUrls: Record<VocdoniEnv, string> = {
  dev: 'https://dev.explorer.vote',
  stg: 'https://stg.explorer.vote',
  prod: 'https://explorer.vote',
}

// Resolves the Vocdoni network configuration from the runtime environment.
// The environment string is provided by the caller — React code passes
// useAppEnv().VOCDONI_ENVIRONMENT; server code passes getServerAppEnv().VOCDONI_ENVIRONMENT.
export const getVocdoniClientConfig = (environment: string = 'dev') => {
  const env = environment.toLowerCase()
  const clientEnv: VocdoniEnv = env === 'prod' || env === 'stg' ? env : 'dev'
  return { clientEnv, explorerUrl: explorerUrls[clientEnv] }
}

// Unauthenticated v2 SaaS client for SSR public page loads. `lang` is a plain value,
// not a getter: each request builds its own client and its language never changes.
export const createVocdoniApiClient = (apiUrl: string, lang?: string) => new VocdoniApiClient({ apiUrl, lang })
