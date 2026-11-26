import type { PageContextServer } from 'vike/types'
import { baseLanguages } from '~i18n/languages'
import { colorModeScript, isPublicHomePath, isVoterPageId } from '~theme/color-mode-script'

// Runs on the server for every render, so the sha is the one of the running container.
// Cumulative hook: the build-commit tag is first, the notranslate tag follows it, then the colour-mode script.
export default function headHtmlBegin({ globalContext, pageId, urlPathname }: PageContextServer): string {
  // Chrome's "translate this page" offer keys off the notranslate meta tag, which is the
  // signal Google documents for opting a whole page out.
  const meta = `<meta name="build-commit" content="${globalContext.commitSha}" /><meta name="google" content="notranslate" />`
  const followSystem = isVoterPageId(pageId) || isPublicHomePath(urlPathname, Object.keys(baseLanguages))
  return `${meta}${colorModeScript(followSystem)}`
}
