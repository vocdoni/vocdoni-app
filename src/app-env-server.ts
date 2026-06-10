import { buildAppEnv, type AppEnv } from './app-env-build'

// Server-only access to the resolved public runtime env.
//
// The env is constant for the lifetime of the process, so it is resolved from
// process.env exactly once (at first access / server boot) and memoized. Use
// this from server-only / non-React code (Vike server hooks, +data loaders, SSR
// helpers). React code must read the env through useAppEnv() instead, and route
// functions through pageContext.globalContext.appEnv.
let cached: AppEnv | undefined

export const getServerAppEnv = (): AppEnv => {
  if (!cached) {
    cached = buildAppEnv(typeof process !== 'undefined' ? process.env : {})
  }
  return cached
}
