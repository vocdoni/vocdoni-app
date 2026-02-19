import { Box, Flex, List, Text } from '@chakra-ui/react'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { LuHouse, LuLifeBuoy, LuSettings, LuUsers, LuVote } from 'react-icons/lu'
import { matchPath, useLocation } from 'react-router-dom'
import { DashboardLayoutContext } from '~elements/LayoutDashboard'
import { Routes } from '~src/router/routes'
import { DashboardMenuItem, DashboardMenuItemButton } from './Item'

export const DashboardMenuOptions = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const { reduced } = useContext(DashboardLayoutContext)

  const menuItemsPlatform: DashboardMenuItem[] = [
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
            {t('section.platform', { defaultValue: 'Platform' })}
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
