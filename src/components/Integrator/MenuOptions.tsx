import { Box, Flex, List, Text } from '@chakra-ui/react'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { LuBuilding2, LuGauge, LuLifeBuoy } from 'react-icons/lu'
import { matchPath, useLocation } from 'react-router-dom'
import { DashboardMenuItem, DashboardMenuItemButton } from '~components/Dashboard/Menu/Item'
import { DashboardLayoutContext } from '~elements/LayoutDashboard'
import { Routes } from '~src/router/routes'

/**
 * Sidebar navigation shown to integrator organizations. Integrators get a different app than
 * regular orgs: no voting processes or memberbase, just their quota overview and the
 * organizations they manage (plus the shared Help section).
 */
export const IntegratorMenuOptions = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const { reduced } = useContext(DashboardLayoutContext)

  const menuItemsPlatform: DashboardMenuItem[] = [
    {
      label: t('integrator.menu.overview', { defaultValue: 'Overview' }),
      icon: LuGauge,
      route: Routes.dashboard.integrator.base,
      activeMatch: [{ path: Routes.dashboard.integrator.base, end: true }],
    },
    {
      label: t('integrator.menu.organizations', { defaultValue: 'Managed organizations' }),
      icon: LuBuilding2,
      route: Routes.dashboard.integrator.organizations,
      activeMatch: [{ path: Routes.dashboard.integrator.organizations, end: false }],
    },
  ]
  const menuItemsHelp: DashboardMenuItem[] = [
    {
      label: t('support'),
      icon: LuLifeBuoy,
      route: Routes.dashboard.settings.support,
    },
  ]

  return (
    <Flex flexDirection={'column'} gap={8}>
      <Box>
        {!reduced && (
          <Text mx={2} mb={2} fontWeight={'bold'} fontSize='xs'>
            {t('integrator.menu.section', { defaultValue: 'Integrator' })}
          </Text>
        )}
        <List.Root display='flex' flexDirection='column' listStyleType='none' ml={0}>
          {menuItemsPlatform.map((item, index) => {
            const activeMatch = item.activeMatch ?? (item.route ? [{ path: item.route, end: true }] : [])
            const isActive = activeMatch.some((match) =>
              Boolean(matchPath({ path: match.path, end: match.end ?? true }, location.pathname))
            )

            return (
              <List.Item key={index}>
                <DashboardMenuItemButton item={item} reduced={reduced} isActive={isActive} />
              </List.Item>
            )
          })}
        </List.Root>
      </Box>
      {!reduced && (
        <Box>
          <Text mx={2} mb={2} fontWeight={'bold'} fontSize='xs'>
            {t('section.help', { defaultValue: 'Help' })}
          </Text>

          <List.Root display='flex' flexDirection='column' listStyleType='none' ml={0}>
            {menuItemsHelp.map((item, index) => {
              return (
                <List.Item key={index}>
                  <DashboardMenuItemButton item={item} reduced={reduced} />
                </List.Item>
              )
            })}
          </List.Root>
        </Box>
      )}
    </Flex>
  )
}
