import vikeReact from 'vike-react/config'
import type { Config } from 'vike/types'
import { resolveCommitSha } from '~src/ssr/commit-sha'

// Vike evaluates this file in Node at build and dev-server start and serializes the value, so git never runs at runtime.
const commitMeta = `<meta name="build-commit" content="${resolveCommitSha()}" />`

export default {
  extends: [vikeReact],
  favicon: '/favicon.ico',
  // Browser translators replace React-owned text nodes and can break insertBefore/removeChild.
  // Emit the opt-out before React mounts, including for SPA routes; use the native language selector instead.
  htmlAttributes: { translate: 'no', class: 'notranslate' },
  // The attributes above only stop a translator that is already walking the document;
  // Chrome's "translate this page" offer keys off this meta tag, which is also the
  // signal Google documents for opting a whole page out.
  headHtmlBegin: `${commitMeta}<meta name="google" content="notranslate" />`,
  // Forward the server-resolved runtime env (set on globalContext in
  // +onCreateGlobalContext.server.ts) to the client.
  passToClient: ['appEnv'],
} satisfies Config
