import React from 'react'
import { useAdminMenuConfig } from '~components/Dashboard/Menu/menus'
import DashboardShell from '~elements/DashboardShell'

const LayoutDashboard: React.FC = () => {
  const menu = useAdminMenuConfig()
  return <DashboardShell menu={menu} />
}

export default LayoutDashboard
