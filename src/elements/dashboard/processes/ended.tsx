import Votings from '~components/Organization/Dashboard/Votings'
import { Routes } from '~routes'

const EndedProcesses = () => <Votings path={Routes.dashboard.processes.ended} />

export default EndedProcesses
