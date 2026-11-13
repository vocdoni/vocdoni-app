import { getCommitSha } from '~src/ssr/commit-sha'

// Runs on the server for every render, so the sha is the one of the running container.
// Cumulative hook: the build-commit tag is first, the notranslate tag follows it.
export default function headHtmlBegin(): string {
  // Chrome's "translate this page" offer keys off the notranslate meta tag, which is the
  // signal Google documents for opting a whole page out.
  return `<meta name="build-commit" content="${getCommitSha()}" /><meta name="google" content="notranslate" />`
}
