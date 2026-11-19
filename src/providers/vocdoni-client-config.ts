import { explorerUrl, VocdoniApiClient } from '@vocdoni/api-client'
import { getVocdoniNetwork } from '~utils/vocdoni-network'

// Resolves the Vocdoni network configuration from the runtime environment.
// The environment string is provided by the caller — React code passes
// useAppEnv().VOCDONI_ENVIRONMENT; server code passes getServerAppEnv().VOCDONI_ENVIRONMENT.
export const getVocdoniClientConfig = (environment: string = 'dev') => {
  const clientEnv = getVocdoniNetwork(environment)
  return { clientEnv, explorerUrl: explorerUrl(clientEnv) }
}

// Unauthenticated v2 SaaS client for SSR public page loads. `lang` is a plain value,
// not a getter: each request builds its own client and its language never changes.
export const createVocdoniApiClient = (apiUrl: string, lang?: string) => new VocdoniApiClient({ apiUrl, lang })
