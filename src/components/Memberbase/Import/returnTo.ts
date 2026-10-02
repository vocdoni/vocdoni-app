import { matchPath } from 'react-router'
import { Routes } from '~routes'

/**
 * Where the import goes back to when it was opened from elsewhere in the dashboard (a draft's
 * "Who can vote"). Only paths inside the dashboard: anything else (another site, `//host`) is ignored.
 */
export const safeReturnTo = (value: string | null | undefined): string | null => {
  if (!value) return null
  if (!value.startsWith(`${Routes.dashboard.base}/`) || value.startsWith('//') || /[\\\s]/.test(value)) return null
  try {
    // Resolving against a placeholder origin must not move it elsewhere
    const url = new URL(value, 'https://app.invalid')
    // …and dot segments must not climb out of the dashboard
    if (url.origin !== 'https://app.invalid' || !url.pathname.startsWith(`${Routes.dashboard.base}/`)) return null
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return null
  }
}

export type ReturnToKind = 'draft' | 'vote' | 'members' | 'other'

/** What the return path is, to name it on its button. */
export const returnToKind = (path: string): ReturnToKind => {
  const pathname = path.split(/[?#]/)[0]
  if (matchPath(Routes.processes.create, pathname)) return 'draft'
  if (matchPath({ path: Routes.dashboard.process, end: false }, pathname)) return 'vote'
  if (matchPath({ path: Routes.dashboard.memberbase.base, end: false }, pathname)) return 'members'
  return 'other'
}
