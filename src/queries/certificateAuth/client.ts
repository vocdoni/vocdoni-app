import { api, ApiEndpoints, ApiError } from '~components/Auth/api'
import {
  CertAuthError,
  isCertAuthServerCode,
  type CertAuthErrorData,
  type CreateCertAuthRequest,
  type CreateCertAuthResponse,
  type RedeemCertAuthRequest,
  type RedeemCertAuthResponse,
} from './types'

/** The app's whole certificate surface. SP3 replaces the HTTP adapter with SDK calls, nothing else. */
export type CertificateAuthApi = {
  create(processId: string, body: CreateCertAuthRequest): Promise<CreateCertAuthResponse>
  redeem(processId: string, body: RedeemCertAuthRequest, signal?: AbortSignal): Promise<RedeemCertAuthResponse>
  probe(url: string, signal?: AbortSignal): Promise<void>
}

const isAbort = (error: unknown) =>
  error instanceof DOMException && (error.name === 'AbortError' || error.name === 'TimeoutError')

const readErrorData = (error: ApiError): Partial<CertAuthErrorData> | null => {
  const data = error.apiError?.data
  if (typeof data !== 'object' || data === null) return null
  const reason = (data as { reason?: unknown }).reason
  return isCertAuthServerCode(reason) ? (data as Partial<CertAuthErrorData>) : null
}

/** Every failure becomes a CertAuthError, except aborts: the caller owns its own timeout. */
export const toCertAuthError = (error: unknown): unknown => {
  if (error instanceof CertAuthError || isAbort(error)) return error
  if (error instanceof ApiError) {
    const data = readErrorData(error)
    return data?.reason ? new CertAuthError(data.reason, data) : new CertAuthError('internal')
  }
  // fetch rejects with a TypeError when the network fails.
  return new CertAuthError('network')
}

const path = (endpoint: ApiEndpoints, processId: string) =>
  endpoint.replace('{processId}', encodeURIComponent(processId))

export const httpCertificateAuthApi: CertificateAuthApi = {
  create: (processId, body) =>
    api<CreateCertAuthResponse>(path(ApiEndpoints.CertAuth, processId), { method: 'POST', body }).catch((error) => {
      throw toCertAuthError(error)
    }),
  redeem: (processId, body, signal) =>
    api<RedeemCertAuthResponse>(path(ApiEndpoints.CertAuthRedeem, processId), { method: 'POST', body, signal }).catch(
      (error) => {
        throw toCertAuthError(error)
      }
    ),
  probe: async (url, signal) => {
    try {
      const response = await fetch(url, { mode: 'cors', cache: 'no-store', credentials: 'omit', signal })
      if (!response.ok) throw new CertAuthError('network')
    } catch (error) {
      throw error instanceof CertAuthError ? error : new CertAuthError('network')
    }
  },
}
