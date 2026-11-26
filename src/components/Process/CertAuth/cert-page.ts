// The voting page's own link, as the certificate flow shares it: the voter opens it elsewhere, or from an in-app
// browser through Android's intent.

/** This voting page without query or fragment: what the voter opens elsewhere. */
const pageUrl = () => window.location.origin + window.location.pathname

/** Copies the voting page's link; resolves to whether it worked. */
export const copyPageLink = (): Promise<'copied' | 'failed'> =>
  navigator.clipboard.writeText(pageUrl()).then(
    () => 'copied',
    () => 'failed'
  )

/** Opens the page in the default browser (or asks which one): no package, so Android chooses. */
export const androidIntentUrl = () =>
  `intent://${window.location.host}${window.location.pathname}#Intent;scheme=https;end`
