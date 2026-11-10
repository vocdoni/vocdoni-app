import type { GlobalContextServer } from 'vike/types'
import { loadLanguages } from '~i18n'
import { baseLanguages } from '~i18n/languages'
import { getServerAppEnv } from '~src/app-env-server'

// Runs once when the server's globalContext is created (server boot). Resolves
// the public runtime env from process.env and stores it on the globalContext.
// It is forwarded to the client via `passToClient: ['appEnv']` (see +config.ts),
// where React reads it through usePageContext().globalContext.appEnv.
// It also loads every language up front: the browser fetches only its own, but the
// server renders pages and titles in all of them.
export default async function onCreateGlobalContext(globalContext: GlobalContextServer) {
  globalContext.appEnv = getServerAppEnv()
  await loadLanguages(Object.keys(baseLanguages))
}
