import React from 'react'
import { useIntegratorMenuConfig } from '~components/Dashboard/Menu/menus'
import DashboardShell from '~elements/DashboardShell'

// The integrator app reuses the exact same dashboard layout and user menu as admin; only the
// sidebar nav items differ (see useIntegratorMenuConfig).
const LayoutIntegrators: React.FC = () => {
  const menu = useIntegratorMenuConfig()
  return <DashboardShell menu={menu} />
}

export default LayoutIntegrators
