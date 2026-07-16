import { EnvOptions, VocdoniSDKClient } from '@vocdoni/sdk'

// Resolves the Vocdoni SDK client configuration from the runtime environment.
// The environment string is provided by the caller — React code passes
// useAppEnv().VOCDONI_ENVIRONMENT; server code passes getServerAppEnv().VOCDONI_ENVIRONMENT.
export const getVocdoniClientConfig = (environment: string = 'dev') => {
  const normalizedEnvironment = environment.toLowerCase()
  const clientEnv: EnvOptions = normalizedEnvironment === 'prod' ? EnvOptions.PROD : EnvOptions.DEV

  return { clientEnv }
}

export const createVocdoniSdkClient = (environment?: string) => {
  const { clientEnv } = getVocdoniClientConfig(environment)

  return new VocdoniSDKClient({
    env: clientEnv,
  })
}
