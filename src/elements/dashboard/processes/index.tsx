import { Outlet } from 'react-router'
import { DashboardContents } from '~components/Dashboard/Contents'
import { VotesPage } from '~components/Votes/VotesPage'

// The filter routes are children with no element of their own; the Outlet lets `/admin/processes` redirect to `all`.
// The board's page padding: 20/40 on a phone, 28/48 on a tablet, 36/40 from `lg` (the sides are the shell's gutter).
const OrganizationVotings = () => (
  <DashboardContents rhythm='board'>
    <VotesPage />
    <Outlet />
  </DashboardContents>
)

export default OrganizationVotings
