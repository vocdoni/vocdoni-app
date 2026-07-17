import { useMutation, UseMutationOptions } from '@tanstack/react-query'
import { api, ApiEndpoints } from '~components/Auth/api'

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

export const useLogin = (options?: Omit<UseMutationOptions<LoginResponse, Error, ILoginParams>, 'mutationFn'>) => {
  return useMutation<LoginResponse, Error, ILoginParams>({
    mutationFn: (params: ILoginParams) => api<LoginResponse>(ApiEndpoints.Login, { body: params, method: 'POST' }),
    ...options,
  })
}

export const useRegister = (
  options?: Omit<UseMutationOptions<LoginResponse, Error, IRegisterParams>, 'mutationFn'>
) => {
  return useMutation<LoginResponse, Error, IRegisterParams>({
    mutationFn: (params: IRegisterParams) =>
      api<LoginResponse>(ApiEndpoints.Register, { body: params, method: 'POST' }),
    ...options,
  })
}

export const useVerifyMail = (
  options?: Omit<UseMutationOptions<LoginResponse, Error, IVerifyParams>, 'mutationFn'>
) => {
  return useMutation<LoginResponse, Error, IVerifyParams>({
    mutationFn: (params: IVerifyParams) => api<LoginResponse>(ApiEndpoints.Verify, { body: params, method: 'POST' }),
    ...options,
  })
}

export const useResendVerificationMail = (
  options?: Omit<UseMutationOptions<void, Error, IResendVerificationParams>, 'mutationFn'>
) => {
  return useMutation<void, Error, IResendVerificationParams>({
    mutationFn: (params: IResendVerificationParams) =>
      api<void>(ApiEndpoints.VerifyCode, { body: params, method: 'POST' }),
    ...options,
  })
}

export const useVerificationCodeStatus = () =>
  useMutation({
    mutationFn: async (email: string) => {
      return await api<{ email: string; expiration: string; valid: boolean }>(
        `${ApiEndpoints.VerifyCode}?email=${encodeURIComponent(email)}`
      )
    },
  })

export const useResendVerificationCode = () =>
  useMutation({
    mutationFn: async (email: string) => {
      await api(ApiEndpoints.VerifyCode, {
        method: 'POST',
        body: { email },
      })
    },
  })
