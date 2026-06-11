import { EnvOptions, VocdoniSDKClient } from '@vocdoni/sdk'

// Resolves the Vocdoni SDK client configuration from the runtime environment.
// The environment string is provided by the caller — React code passes
// useAppEnv().VOCDONI_ENVIRONMENT; server code passes getServerAppEnv().VOCDONI_ENVIRONMENT.
export const getVocdoniClientConfig = (environment: string = 'dev') => {
  const normalizedEnvironment = environment.toLowerCase()
  const clientEnv: EnvOptions = normalizedEnvironment === 'prod' ? EnvOptions.PROD : EnvOptions.DEV
  const options: { api_url?: string } = {}
  let explorerUrl: string | undefined

  if (clientEnv === EnvOptions.DEV) {
    options.api_url = 'https://one-dev.vocdoni.net/v2'
    // The SDK defaults the dev explorer to https://dev.explorer.vote, which does
    // not know about the one-dev (vocone) network we point the api_url to. Pin it
    // to the matching one-dev explorer so links resolve instead of returning
    // "election not found".
    explorerUrl = 'https://one-dev.explorer.vote'
  }

  return { clientEnv, options, explorerUrl }
}

export const createVocdoniSdkClient = (environment?: string) => {
  const { clientEnv, options, explorerUrl } = getVocdoniClientConfig(environment)

  const client = new VocdoniSDKClient({
    env: clientEnv,
    ...options,
  })

  if (explorerUrl) {
    client.explorerUrl = explorerUrl
  }

  return client
}
