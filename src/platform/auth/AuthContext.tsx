import { useQueryClient } from '@tanstack/react-query'
import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react'
import { api, ApiParams } from '~platform/api/client'
import { LoginResponse } from './authQueries'

export enum LocalStorageKeys {
  Token = 'authToken',
  Expiry = 'authExpiry',
}

const getItem = (key: string) => (typeof localStorage === 'undefined' ? null : localStorage.getItem(key))
const setItem = (key: string, value: string) => {
  if (typeof localStorage !== 'undefined') localStorage.setItem(key, value)
}
const removeItem = (key: string) => {
  if (typeof localStorage !== 'undefined') localStorage.removeItem(key)
}

type AuthContextValue = {
  bearer: string | null
  isAuthenticated: boolean
  bearedFetch: <T>(path: string, params?: ApiParams) => Promise<T>
  storeLogin: (data: LoginResponse) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [bearer, setBearer] = useState<string | null>(() => getItem(LocalStorageKeys.Token))
  const queryClient = useQueryClient()

  const bearedFetch = useCallback(
    <T,>(path: string, { headers = new Headers({}), ...params }: ApiParams = {}) => {
      if (bearer) headers.append('Authorization', `Bearer ${bearer}`)
      return api<T>(path, { headers, ...params })
    },
    [bearer]
  )

  const storeLogin = useCallback(({ token, expirity }: LoginResponse) => {
    setItem(LocalStorageKeys.Token, token)
    if (expirity) setItem(LocalStorageKeys.Expiry, expirity)
    setBearer(token)
  }, [])

  const logout = useCallback(() => {
    removeItem(LocalStorageKeys.Token)
    removeItem(LocalStorageKeys.Expiry)
    setBearer(null)
    queryClient.clear()
  }, [queryClient])

  const value = useMemo<AuthContextValue>(
    () => ({ bearer, isAuthenticated: !!bearer, bearedFetch, storeLogin, logout }),
    [bearer, bearedFetch, storeLogin, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
