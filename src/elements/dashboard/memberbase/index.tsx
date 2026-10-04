import { Outlet } from 'react-router'
import { DashboardContents } from '~components/Dashboard/Contents'

/** The Members section's frame: its tabs, or the full-page import. */
const Memberbase = () => (
  <DashboardContents>
    <Outlet />
  </DashboardContents>
)

export default Memberbase
