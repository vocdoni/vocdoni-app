import type { GlobalContextServer } from 'vike/types'
import { loadLanguages } from '~i18n'
import { baseLanguages } from '~i18n/languages'
import { getServerAppEnv } from '~src/app-env-server'
import { resolveCommitSha } from '~src/ssr/commit-sha'

// Runs once at server boot: resolves the public env (forwarded to the client, see +config.ts) and the build commit
// (server-only), so no render waits on git. It also loads every language: the browser fetches only its own, but
// the server renders pages and titles in all of them.
export default async function onCreateGlobalContext(globalContext: GlobalContextServer) {
  globalContext.appEnv = getServerAppEnv()
  globalContext.commitSha = resolveCommitSha()
  await loadLanguages(Object.keys(baseLanguages))
}
