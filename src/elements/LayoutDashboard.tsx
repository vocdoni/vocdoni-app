import React from 'react'
import { useAdminMenuConfig } from '~components/Dashboard/Menu/menus'
import DashboardShell from '~elements/DashboardShell'

// Re-exported for backwards compatibility with existing importers (dashboard pages read the
// outlet's `reduced` flag via DashboardOutletContext).
export { DashboardLayoutContext } from '~elements/DashboardLayoutContext'
export type { DashboardOutletContext } from '~elements/DashboardLayoutContext'

const LayoutDashboard: React.FC = () => {
  const menu = useAdminMenuConfig()
  return <DashboardShell menu={menu} />
}

export default LayoutDashboard
