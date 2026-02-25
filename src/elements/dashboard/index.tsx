import { DashboardContents } from '~components/Dashboard/Contents'
import OrganizationDashboard from '~components/Organization/Dashboard'

const Dashboard = () => {
  return (
    <DashboardContents>
      <OrganizationDashboard />
    </DashboardContents>
  )
}

export default Dashboard
