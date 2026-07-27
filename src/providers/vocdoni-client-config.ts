import { VocdoniApiClient } from '@vocdoni/api-client'
import { EnvOptions } from '@vocdoni/sdk'

// Resolves the Vocdoni client configuration from the runtime environment.
// The environment string is provided by the caller — React code passes
// useAppEnv().VOCDONI_ENVIRONMENT; server code passes getServerAppEnv().VOCDONI_ENVIRONMENT.
export const getVocdoniClientConfig = (environment: string = 'dev') => {
  const normalizedEnvironment = environment.toLowerCase()
  const clientEnv: EnvOptions = normalizedEnvironment === 'prod' ? EnvOptions.PROD : EnvOptions.DEV
  // Explorer base matching the SDK's own default for each env (what the legacy
  // client exposed as `client.explorerUrl`) — kept here so signer-free code can
  // build explorer links without instantiating a client.
  const explorerUrl = clientEnv === EnvOptions.PROD ? 'https://explorer.vote' : 'https://dev.explorer.vote'

  return { clientEnv, explorerUrl }
}

// Unauthenticated v2 SaaS client for server-side (SSR) public page loads.
export const createVocdoniApiClient = (apiUrl: string) => new VocdoniApiClient({ apiUrl })
