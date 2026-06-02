import { AppEnv } from '~src/app-env'
import i18n from '~i18n'

type MethodTypes = 'GET' | 'POST' | 'PUT' | 'DELETE'

export enum ApiEndpoints {
  InviteAccept = 'organizations/{address}/users/accept',
  Login = 'auth/login',
  Me = 'users/me',
  Organization = 'organizations/{address}',
  OrganizationUsers = 'organizations/{address}/users',
  OrganizationUser = 'organizations/{address}/users/{userId}',
  OrganizationPendingUsers = 'organizations/{address}/users/pending',
  OrganizationPendingUser = 'organizations/{address}/users/pending/{inviteId}',
  Organizations = 'organizations',
  OrganizationsRoles = 'organizations/roles',
  OrganizationsTypes = 'organizations/types',
  OrganizationSubscription = 'organizations/{address}/subscription',
  OrganizationsSupport = 'organizations/{address}/ticket',
  OrganizationMeta = 'organizations/{address}/meta',
  OrganizationMembers = 'organizations/{address}/members',
  OrganizationMembersImport = 'organizations/{address}/members/job/{jobId}',
  OrganizationGroups = 'organizations/{address}/groups',
  OrganizationGroup = 'organizations/{address}/groups/{groupId}',
  OrganizationGroupMembers = 'organizations/{address}/groups/{groupId}/members',
  OrganizationGroupValidate = 'organizations/{address}/groups/{groupId}/validate',
  OrganizationProcesses = 'process',
  OrganizationProcess = 'process/{processId}',
  OrganizationDrafts = 'organizations/{address}/processes/drafts',
  OrganizationCensuses = 'census',
  OrganizationCensusPublish = 'census/{censusId}/group/{groupId}/publish',
  ProcessBundle = 'process/bundle',
  ProcessBundleParticipantsCheck = 'process/bundle/{bundleId}/participants/check',
  OAuthLink = 'auth/oauth',
  OAuthUnlink = 'auth/oauth/{provider}',
  Password = 'users/password',
  PasswordRecovery = 'users/password/recovery',
  PasswordReset = 'users/password/reset',
  Plans = 'plans',
  Refresh = 'auth/refresh',
  Register = 'users',
  SubscriptionCheckout = 'subscriptions/checkout',
  SubscriptionPortal = 'subscriptions/{address}/portal',
  Verify = 'users/verify',
  VerifyCode = 'users/verify/code',
  Storage = 'storage',
}

export enum ErrorCode {
  // HTTP errors
  BadRequest = 400,
  Unauthorized = 401,
  // Custom API errors
  MalformedJSONBody = 40004,
  UserNotVerified = 40014,
  UserAlreadyVerified = 40015,
  DraftLimitReached = 40031,
}

interface IApiError {
  error: string
  code?: number
}

export class ApiError extends Error {
  public response: Response
  public apiError: IApiError

  constructor(apiError?: IApiError, response?: Response) {
    super(apiError?.error ? apiError.error : 'undefined api error')
    this.response = response
    this.apiError = apiError
  }
}

export class UnauthorizedApiError extends ApiError {}

export class BadRequestApiError extends ApiError {}

export class UnverifiedApiError extends ApiError {}

export class UserAlreadyVerifiedApiError extends ApiError {}

export const getApiErrorMessage = (error: unknown) => {
  if (!error) return undefined
  if (error instanceof ApiError) {
    return error.apiError?.error || error.message
  }

  if (typeof error === 'object' && error !== null) {
    const maybeError = error as { apiError?: { error?: string }; message?: string }
    return maybeError.apiError?.error || maybeError.message
  }

  return undefined
}

export type ApiParams = {
  body?: unknown
  method?: MethodTypes
  headers?: Headers
}

export const api = <T>(
  path: string,
  { body, method = 'GET', headers = new Headers({}) }: ApiParams = {}
): Promise<T> => {
  const isFormData = typeof body === 'object' && body instanceof FormData
  // Append headers when not present
  if (!headers.has('Content-Type') && !isFormData) {
    headers.append('Content-Type', 'application/json')
  }
  // Format body if it's an object (and not FormData)
  const formatted = isFormData || typeof body === 'string' ? body : JSON.stringify(body)
  // Append lang query param
  const [basePath, queryString] = path.split('?', 2)
  const params = new URLSearchParams(queryString || '')
  params.set('lang', i18n.language)
  path = `${basePath}?${params.toString()}`

  return fetch(`${AppEnv.SAAS_URL}/${path}`, {
    method,
    headers,
    body: formatted,
  })
    .then(async (response) => {
      const sanitized = (await response.text()).replace('\n', '')
      // Parse error response
      if (!response.ok) {
        let error: IApiError
        try {
          error = JSON.parse(sanitized) as IApiError
        } catch (e) {
          // If parsing fails, use the raw text as the error message
          error = { error: sanitized.length ? sanitized : response.statusText }
        }
        // Handle unauthorized error
        if (response.status === ErrorCode.Unauthorized) {
          if (error?.code === ErrorCode.UserNotVerified) {
            throw new UnverifiedApiError(error, response)
          }
          throw new UnauthorizedApiError(error, response)
        }

        if (response.status === ErrorCode.BadRequest) {
          if (error?.code === ErrorCode.UserAlreadyVerified) {
            throw new UserAlreadyVerifiedApiError(error, response)
          }
          throw new BadRequestApiError(error, response)
        }

        throw new ApiError(error, response)
      }
      return sanitized ? (JSON.parse(sanitized) as T) : undefined
    })
    .catch((error: Error | IApiError) => {
      throw error
    })
}
