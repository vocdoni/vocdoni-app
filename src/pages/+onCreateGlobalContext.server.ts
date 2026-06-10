import type { GlobalContextServer } from 'vike/types'
import { getServerAppEnv } from '~src/app-env-server'

// Runs once when the server's globalContext is created (server boot). Resolves
// the public runtime env from process.env and stores it on the globalContext.
// It is forwarded to the client via `passToClient: ['appEnv']` (see +config.ts),
// where React reads it through usePageContext().globalContext.appEnv.
export default function onCreateGlobalContext(globalContext: GlobalContextServer) {
  globalContext.appEnv = getServerAppEnv()
}
