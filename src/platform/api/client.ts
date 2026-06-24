import { ErrorCode } from './endpoints'

const SAAS_URL = (import.meta.env.VITE_SAAS_URL || 'https://saas-api-dev.vocdoni.net').replace(/\/+$/, '')

type MethodTypes = 'GET' | 'POST' | 'PUT' | 'DELETE'

export interface IApiError {
  error: string
  code?: number
}

export class ApiError extends Error {
  public response?: Response
  public apiError?: IApiError

  constructor(apiError?: IApiError, response?: Response) {
    super(apiError?.error ? apiError.error : 'undefined api error')
    this.response = response
    this.apiError = apiError
  }
}

export class UnauthorizedApiError extends ApiError {}
export class BadRequestApiError extends ApiError {}
export class UnverifiedApiError extends ApiError {}

export const getApiErrorMessage = (error: unknown): string | undefined => {
  if (!error) return undefined
  if (error instanceof ApiError) {
    return error.apiError?.error || error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return undefined
}

export const getApiErrorCode = (error: unknown): number | undefined =>
  error instanceof ApiError ? error.apiError?.code : undefined

export type ApiParams = {
  body?: unknown
  method?: MethodTypes
  headers?: Headers
}

/**
 * Thin fetch wrapper around the Vocdoni SaaS API. Serializes JSON bodies, parses the documented
 * `{ code, error }` error envelope, and throws typed errors so callers can branch on auth/validation.
 */
export const api = <T>(
  path: string,
  { body, method = 'GET', headers = new Headers({}) }: ApiParams = {}
): Promise<T> => {
  const isFormData = typeof body === 'object' && body instanceof FormData
  if (!headers.has('Content-Type') && !isFormData) {
    headers.append('Content-Type', 'application/json')
  }
  const formatted = isFormData || typeof body === 'string' ? body : JSON.stringify(body)

  return fetch(`${SAAS_URL}/${path}`, {
    method,
    headers,
    body: formatted as BodyInit | undefined,
  }).then(async (response) => {
    const sanitized = (await response.text()).replace('\n', '')
    if (!response.ok) {
      let error: IApiError
      try {
        error = JSON.parse(sanitized) as IApiError
      } catch {
        error = { error: sanitized.length ? sanitized : response.statusText }
      }
      if (response.status === ErrorCode.Unauthorized) {
        if (error?.code === ErrorCode.UserNotVerified) {
          throw new UnverifiedApiError(error, response)
        }
        throw new UnauthorizedApiError(error, response)
      }
      if (response.status === ErrorCode.BadRequest) {
        throw new BadRequestApiError(error, response)
      }
      throw new ApiError(error, response)
    }
    return (sanitized ? (JSON.parse(sanitized) as T) : undefined) as T
  })
}
