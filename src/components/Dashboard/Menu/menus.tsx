import { useTranslation } from 'react-i18next'
import {
  DashboardIcon,
  HelpCenterIcon,
  HomeIcon,
  KeyRoundIcon,
  OrganizationIcon,
  PreferencesIcon,
  SettingsIcon,
  UsersIcon,
  VoteIcon,
} from '~theme/icons'
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
            icon: HomeIcon,
            route: Routes.dashboard.base,
            activeMatch: [{ path: Routes.dashboard.base, end: true }],
          },
          {
            label: t('voting_processes'),
            icon: VoteIcon,
            route: Routes.dashboard.processes.base,
            activeMatch: [
              { path: Routes.dashboard.processes.base, end: false },
              { path: Routes.dashboard.process, end: false },
            ],
          },
          {
            label: t('memberbase.title', { defaultValue: 'Memberbase' }),
            icon: UsersIcon,
            route: Routes.dashboard.memberbase.base,
            activeMatch: [{ path: Routes.dashboard.memberbase.base, end: false }],
          },
          {
            label: t('settings'),
            icon: SettingsIcon,
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
            icon: HelpCenterIcon,
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
            icon: DashboardIcon,
            route: Routes.integrators.base,
            activeMatch: [{ path: Routes.integrators.base, end: true }],
          },
          {
            label: t('integrators.managed.title', { defaultValue: 'Managed organizations' }),
            icon: OrganizationIcon,
            route: Routes.integrators.managedOrganizations,
            activeMatch: [{ path: Routes.integrators.managedOrganizations, end: false }],
          },
          {
            label: t('integrators.api_keys.title', { defaultValue: 'API keys' }),
            icon: KeyRoundIcon,
            route: Routes.integrators.apiKeys,
            activeMatch: [{ path: Routes.integrators.apiKeys, end: false }],
          },
          {
            label: t('integrators.configuration.title', { defaultValue: 'Configuration' }),
            icon: PreferencesIcon,
            route: Routes.integrators.configuration.base,
            activeMatch: [{ path: Routes.integrators.configuration.base, end: false }],
          },
        ],
      },
    ],
  }
}
