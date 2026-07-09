import { createContext } from 'react'

export type DashboardOutletContext = {
  reduced: boolean
}

export type DashboardLayoutContextValue = {
  reduced: boolean
  // DOM node in the shared top bar (next to the sidebar toggle) where a page can portal a
  // right-aligned header action — e.g. the integrator "Upgrade plan" button — so it lines up with
  // the collapse/expand button instead of sitting lower down in the page header.
  headerActionsNode?: HTMLElement | null
}

// Kept in its own leaf module (imported by both the layout shell and the menu components) so the
// shared dashboard layout can be reused by admin and integrators without an import cycle.
export const DashboardLayoutContext = createContext<DashboardLayoutContextValue | undefined>(undefined)
