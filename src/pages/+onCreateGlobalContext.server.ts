import type { GlobalContextServer } from 'vike/types'
import { getServerAppEnv } from '~src/app-env-server'
import { resolveCommitSha } from '~src/ssr/commit-sha'

// Runs once at server boot: resolves the public env (forwarded to the client, see +config.ts) and the build commit
// (server-only), so no render waits on git.
export default function onCreateGlobalContext(globalContext: GlobalContextServer) {
  globalContext.appEnv = getServerAppEnv()
  globalContext.commitSha = resolveCommitSha()
}
