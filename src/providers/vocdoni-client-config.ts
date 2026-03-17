import { EnvOptions, VocdoniSDKClient } from '@vocdoni/sdk'
import { VocdoniEnvironment } from '~constants'

export const getVocdoniClientConfig = () => {
  const normalizedEnvironment = VocdoniEnvironment.toLowerCase()
  const clientEnv: EnvOptions = normalizedEnvironment === 'prod' ? EnvOptions.PROD : EnvOptions.DEV
  const options: { api_url?: string } = {}

  if (clientEnv === EnvOptions.DEV) {
    options.api_url = 'https://one-dev.vocdoni.net/v2'
  }

  return { clientEnv, options }
}

export const createVocdoniSdkClient = () => {
  const { clientEnv, options } = getVocdoniClientConfig()

  return new VocdoniSDKClient({
    env: clientEnv,
    ...options,
  })
}
