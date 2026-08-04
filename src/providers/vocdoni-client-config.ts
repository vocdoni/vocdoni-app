import { VocdoniApiClient } from '@vocdoni/api-client'

export type VocdoniEnv = 'dev' | 'prod'

// Resolves the Vocdoni network configuration from the runtime environment.
// The environment string is provided by the caller — React code passes
// useAppEnv().VOCDONI_ENVIRONMENT; server code passes getServerAppEnv().VOCDONI_ENVIRONMENT.
export const getVocdoniClientConfig = (environment: string = 'dev') => {
  const clientEnv: VocdoniEnv = environment.toLowerCase() === 'prod' ? 'prod' : 'dev'
  // Explorer base matching the legacy SDK's default for each env — kept here so
  // explorer links can be built without any chain client.
  const explorerUrl = clientEnv === 'prod' ? 'https://explorer.vote' : 'https://dev.explorer.vote'

  return { clientEnv, explorerUrl }
}

// Unauthenticated v2 SaaS client for server-side (SSR) public page loads.
export const createVocdoniApiClient = (apiUrl: string) => new VocdoniApiClient({ apiUrl })
