import { VocdoniApiError } from '@vocdoni/api-client'
import { ApiError, ErrorCode } from '~components/Auth/api'

/**
 * The draft limit is reported by the SaaS API either through the app's own
 * `api()` wrapper or through the integrator-sdk client, depending on the call.
 */
export const isDraftLimitError = (error: unknown) =>
  (error instanceof ApiError && error.apiError?.code === ErrorCode.DraftLimitReached) ||
  (error instanceof VocdoniApiError && error.code === ErrorCode.DraftLimitReached)
