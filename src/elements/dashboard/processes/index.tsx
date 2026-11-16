import { Outlet } from 'react-router'
import { DashboardContents } from '~components/Dashboard/Contents'
import { VotesPage } from '~components/Votes/VotesPage'

// The filter routes are children with no element of their own; the Outlet lets `/admin/processes` redirect to `all`.
const OrganizationVotings = () => (
  <DashboardContents>
    <VotesPage />
    <Outlet />
  </DashboardContents>
)

export default OrganizationVotings
