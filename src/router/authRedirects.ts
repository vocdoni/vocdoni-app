import { Routes } from './routes'

export const normalizeAuthRedirectTarget = (target?: string | null) => {
  if (!target) return Routes.dashboard.base

  const normalizedTarget = target.trim()

  if (!normalizedTarget) return Routes.dashboard.base

  const localizedAdminMatch = normalizedTarget.match(/^\/[a-z]{2}(?:-[a-z]{2})?(\/admin(?:\/.*)?)/i)
  const strippedTarget = localizedAdminMatch?.[1] ?? normalizedTarget

  if (strippedTarget === Routes.dashboard.base || strippedTarget.startsWith(`${Routes.dashboard.base}/`)) {
    return strippedTarget
  }

  return normalizedTarget
}
