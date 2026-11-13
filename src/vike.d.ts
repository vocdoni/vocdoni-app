import type {} from 'vike/types'
import type { AppEnv } from './app-env-build'

declare global {
  namespace Vike {
    interface GlobalContext {
      // Public runtime env resolved on the server (see
      // src/pages/+onCreateGlobalContext.server.ts) and forwarded to the client
      // via `passToClient`. Read in React through usePageContext().globalContext.appEnv.
      appEnv?: AppEnv
    }
    interface GlobalContextServer {
      // Short build commit for the build-commit meta tag, resolved at server boot (see
      // src/pages/+onCreateGlobalContext.server.ts). Server-only: it is not in passToClient.
      commitSha: string
    }
  }
}

export {}
