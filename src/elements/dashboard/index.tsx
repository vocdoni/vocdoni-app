import { Progress } from '@chakra-ui/react'
import { Navigate } from 'react-router-dom'
import { DashboardContents } from '~components/Dashboard/Contents'
import OrganizationDashboard from '~components/Organization/Dashboard'
import { useIntegratorInfo } from '~queries/integrator'
import { Routes } from '~routes'

const Dashboard = () => {
  // Integrators and regular orgs share the login portal but land in different apps. Detect the
  // current org's integrator status and route integrators to their dedicated dashboard. The loader
  // avoids briefly flashing the regular dashboard before redirecting.
  const { data, isLoading } = useIntegratorInfo()

  if (isLoading) {
    return (
      <DashboardContents>
        <Progress.Root size='xs' value={null} colorPalette='gray'>
          <Progress.Track>
            <Progress.Range />
          </Progress.Track>
        </Progress.Root>
      </DashboardContents>
    )
  }

  if (data?.enabled) {
    return <Navigate to={Routes.dashboard.integrator.base} replace />
  }

  return (
    <DashboardContents>
      <OrganizationDashboard />
    </DashboardContents>
  )
}

export default Dashboard
