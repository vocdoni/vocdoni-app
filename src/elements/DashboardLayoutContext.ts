import { createContext } from 'react'

export type DashboardOutletContext = {
  reduced: boolean
}

// Kept in its own leaf module (imported by both the layout shell and the menu components) so the
// shared dashboard layout can be reused by admin and integrators without an import cycle.
export const DashboardLayoutContext = createContext<DashboardOutletContext | undefined>(undefined)
