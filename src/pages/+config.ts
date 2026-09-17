import vikeReact from 'vike-react/config'
import type { Config } from 'vike/types'

export default {
  extends: [vikeReact],
  favicon: '/favicon.ico',
  // Browser translators replace React-owned text nodes and can break insertBefore/removeChild.
  // Emit the opt-out before React mounts, including for SPA routes; use the native language selector instead.
  htmlAttributes: { translate: 'no', class: 'notranslate' },
  // Forward the server-resolved runtime env (set on globalContext in
  // +onCreateGlobalContext.server.ts) to the client.
  passToClient: ['appEnv'],
} satisfies Config
