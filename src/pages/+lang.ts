// Localized routes (`/:lang/...`) carry the language as a route param: emit it as the
// document language so the served HTML matches the copy it contains. Without it
// vike-react falls back to `en`, and browsers offer to translate an already-localized
// page — a translator rewriting React-owned text nodes then breaks insertBefore/
// removeChild. Public SSR pages resolve the language from their own data and override
// this with their own +lang.ts; routes without a language prefix keep the `en` default.
//
// Shared with +title.ts/+description.ts (via defaultHeadMeta) on purpose: `<html lang>`
// and the localized <title>/<meta description> must always name the same language.
export { resolveRouteLanguage as default } from './shared/defaultHeadMeta'
