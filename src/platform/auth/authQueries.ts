import { useMutation, UseMutationOptions } from '@tanstack/react-query'
import { api } from '~platform/api/client'
import { ApiEndpoints } from '~platform/api/endpoints'

export type LoginResponse = { token: string; expirity: string }

export interface ILoginParams {
  email: string
  password: string
}

export interface IRegisterParams {
  firstName: string
  lastName: string
  email: string
  password: string
  confirm_password: string
}

export interface IVerifyParams {
  email: string
  code: string
}

export interface IResendVerificationParams {
  email: string
}

export interface IRecoveryParams {
  email: string
}

export interface IResetParams {
  email: string
  code: string
  newPassword: string
}

export const useLogin = (options?: Omit<UseMutationOptions<LoginResponse, Error, ILoginParams>, 'mutationFn'>) =>
  useMutation<LoginResponse, Error, ILoginParams>({
    mutationFn: (params) => api<LoginResponse>(ApiEndpoints.Login, { body: params, method: 'POST' }),
    ...options,
  })

// Registration deliberately omits organization details: integrators are enabled on an existing
// organization by Vocdoni, so the org-creation step from the main app does not apply here.
export const useRegister = (options?: Omit<UseMutationOptions<LoginResponse, Error, IRegisterParams>, 'mutationFn'>) =>
  useMutation<LoginResponse, Error, IRegisterParams>({
    mutationFn: (params) => api<LoginResponse>(ApiEndpoints.Register, { body: params, method: 'POST' }),
    ...options,
  })

export const useVerifyMail = (options?: Omit<UseMutationOptions<LoginResponse, Error, IVerifyParams>, 'mutationFn'>) =>
  useMutation<LoginResponse, Error, IVerifyParams>({
    mutationFn: (params) => api<LoginResponse>(ApiEndpoints.Verify, { body: params, method: 'POST' }),
    ...options,
  })

export const useResendVerificationMail = (
  options?: Omit<UseMutationOptions<void, Error, IResendVerificationParams>, 'mutationFn'>
) =>
  useMutation<void, Error, IResendVerificationParams>({
    mutationFn: (params) => api<void>(ApiEndpoints.VerifyCode, { body: params, method: 'POST' }),
    ...options,
  })

export const usePasswordRecovery = (options?: Omit<UseMutationOptions<void, Error, IRecoveryParams>, 'mutationFn'>) =>
  useMutation<void, Error, IRecoveryParams>({
    mutationFn: (params) => api<void>(ApiEndpoints.PasswordRecovery, { body: params, method: 'POST' }),
    ...options,
  })

export const usePasswordReset = (options?: Omit<UseMutationOptions<void, Error, IResetParams>, 'mutationFn'>) =>
  useMutation<void, Error, IResetParams>({
    mutationFn: (params) => api<void>(ApiEndpoints.PasswordReset, { body: params, method: 'POST' }),
    ...options,
  })
