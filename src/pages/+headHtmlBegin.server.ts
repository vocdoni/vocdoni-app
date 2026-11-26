import type { PageContextServer } from 'vike/types'
import { parseProcessIds } from '~components/Home/processIds'
import { normalizeLanguages, type AppEnv } from '~src/app-env'
import { colorModeScript, isPublicHomePath, isVoterPageId } from '~theme/color-mode-script'

// The host the browser sees (window.location.hostname on the client): the proxy's forwarded host or the request's
// own, first hop, port stripped.
const requestHostname = (headers: PageContextServer['headers']) =>
  String(headers?.['x-forwarded-host'] || headers?.host || '')
    .split(',')[0]
    .trim()
    .replace(/:\d+$/, '')

// The root shows the shared census or a custom organisation's home (see src/router/routes/home.tsx); without either it
// redirects to the dashboard, which keeps the saved choice.
const isSharedHome = (appEnv: Partial<AppEnv> | undefined, headers: PageContextServer['headers']) => {
  if (parseProcessIds(appEnv?.PROCESS_IDS).length > 0) return true
  const hostname = requestHostname(headers)
  return !!hostname && Object.keys(appEnv?.CUSTOM_ORGANIZATION_DOMAINS ?? {}).includes(hostname)
}

// Runs on the server for every render, so the sha is the one of the running container.
// Cumulative hook: the build-commit tag is first, the notranslate tag follows it, then the colour-mode script.
export default function headHtmlBegin({ globalContext, pageId, urlPathname, headers }: PageContextServer): string {
  // Chrome's "translate this page" offer keys off the notranslate meta tag, which is the
  // signal Google documents for opting a whole page out.
  const meta = `<meta name="build-commit" content="${globalContext.commitSha}" /><meta name="google" content="notranslate" />`
  const appEnv = globalContext.appEnv
  const languages = Object.keys(normalizeLanguages(appEnv?.LANGUAGES))
  const followSystem =
    isVoterPageId(pageId) || (isPublicHomePath(urlPathname, languages) && isSharedHome(appEnv, headers))
  return `${meta}${colorModeScript(followSystem)}`
}
