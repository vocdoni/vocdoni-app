import type { VocdoniNetwork } from '@vocdoni/api-client'

// The app environment (`VOCDONI_ENVIRONMENT`) → SDK network. Anything unknown falls back to dev.
export const getVocdoniNetwork = (environment: string = 'dev'): VocdoniNetwork => {
  const env = environment.toLowerCase()
  return env === 'prod' || env === 'stg' ? env : 'dev'
}
