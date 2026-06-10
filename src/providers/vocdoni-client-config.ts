import { EnvOptions, VocdoniSDKClient } from '@vocdoni/sdk'

// Resolves the Vocdoni SDK client configuration from the runtime environment.
// The environment string is provided by the caller — React code passes
// useAppEnv().VOCDONI_ENVIRONMENT; server code passes getServerAppEnv().VOCDONI_ENVIRONMENT.
export const getVocdoniClientConfig = (environment: string = 'dev') => {
  const normalizedEnvironment = environment.toLowerCase()
  const clientEnv: EnvOptions = normalizedEnvironment === 'prod' ? EnvOptions.PROD : EnvOptions.DEV
  const options: { api_url?: string } = {}

  if (clientEnv === EnvOptions.DEV) {
    options.api_url = 'https://one-dev.vocdoni.net/v2'
  }

  return { clientEnv, options }
}

export const createVocdoniSdkClient = (environment?: string) => {
  const { clientEnv, options } = getVocdoniClientConfig(environment)

  return new VocdoniSDKClient({
    env: clientEnv,
    ...options,
  })
}
