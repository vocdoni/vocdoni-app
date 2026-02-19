import { useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { DashboardContents } from '~components/Dashboard/Contents'
import OrganizationDashboard from '~components/Organization/Dashboard'
import { DashboardLayoutContext } from '~elements/LayoutDashboard'

const Dashboard = () => {
  const { setBreadcrumb } = useOutletContext<DashboardLayoutContext>()

  useEffect(() => {
    setBreadcrumb([])
  }, [setBreadcrumb])

  return (
    <DashboardContents>
      <OrganizationDashboard />
    </DashboardContents>
  )
}

export default Dashboard
