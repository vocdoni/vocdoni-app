import { useTranslation } from 'react-i18next'
import {
  LuBuilding2,
  LuHouse,
  LuLayoutDashboard,
  LuLifeBuoy,
  LuSettings,
  LuSlidersHorizontal,
  LuUsers,
  LuVote,
} from 'react-icons/lu'
import { Routes } from '~src/router/routes'
import { DashboardMenuItem } from './Item'

export type DashboardMenuSection = {
  title?: string
  items: DashboardMenuItem[]
  // Admin's "Help" section is hidden entirely in the reduced (icons-only) sidebar.
  hideWhenReduced?: boolean
}

// Describes a dashboard sidebar. The admin and integrator apps share the same layout shell and only
// differ in this config: which nav items to show, where the logo links, and whether the
// admin-specific "New vote" button and first-steps tutorial box are present.
export type DashboardMenuConfig = {
  homeRoute: string
  newVote?: boolean
  tutorial?: boolean
  sections: DashboardMenuSection[]
}

export const useAdminMenuConfig = (): DashboardMenuConfig => {
  const { t } = useTranslation()

  return {
    homeRoute: Routes.dashboard.base,
    newVote: true,
    tutorial: true,
    sections: [
      {
        title: t('section.platform', { defaultValue: 'Platform' }),
        items: [
          {
            label: t('organization.dashboard'),
            icon: LuHouse,
            route: Routes.dashboard.base,
            activeMatch: [{ path: Routes.dashboard.base, end: true }],
          },
          {
            label: t('voting_processes'),
            icon: LuVote,
            route: Routes.dashboard.processes.base,
            activeMatch: [
              { path: Routes.dashboard.processes.base, end: false },
              { path: Routes.dashboard.process, end: false },
            ],
          },
          {
            label: t('memberbase.title', { defaultValue: 'Memberbase' }),
            icon: LuUsers,
            route: Routes.dashboard.memberbase.base,
            activeMatch: [{ path: Routes.dashboard.memberbase.base, end: false }],
          },
          {
            label: t('settings'),
            icon: LuSettings,
            route: Routes.dashboard.settings.base,
            activeMatch: [{ path: Routes.dashboard.settings.base, end: false }],
          },
        ],
      },
      {
        title: t('section.help', { defaultValue: 'Help' }),
        hideWhenReduced: true,
        items: [
          {
            label: t('support'),
            icon: LuLifeBuoy,
            route: Routes.dashboard.settings.support,
          },
        ],
      },
    ],
  }
}

export const useIntegratorMenuConfig = (): DashboardMenuConfig => {
  const { t } = useTranslation()

  return {
    homeRoute: Routes.integrators.base,
    newVote: false,
    tutorial: false,
    sections: [
      {
        title: t('section.platform', { defaultValue: 'Platform' }),
        items: [
          {
            label: t('integrators.overview', { defaultValue: 'Overview' }),
            icon: LuLayoutDashboard,
            route: Routes.integrators.base,
            activeMatch: [{ path: Routes.integrators.base, end: true }],
          },
          {
            label: t('integrators.managed.title', { defaultValue: 'Managed organizations' }),
            icon: LuBuilding2,
            route: Routes.integrators.managedOrganizations,
            activeMatch: [{ path: Routes.integrators.managedOrganizations, end: false }],
          },
          // API keys lands in a follow-up commit.
          {
            label: t('integrators.configuration.title', { defaultValue: 'Configuration' }),
            icon: LuSlidersHorizontal,
            route: Routes.integrators.configuration.base,
            activeMatch: [{ path: Routes.integrators.configuration.base, end: false }],
          },
        ],
      },
    ],
  }
}
