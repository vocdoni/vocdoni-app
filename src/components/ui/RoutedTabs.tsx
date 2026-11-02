import { Badge, Tabs } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { stripCheckoutReturn } from '~src/router/routes'

export type RoutedTab = {
  label: string
  route: string
  count?: number
}

type RoutedTabsProps = {
  tabs: RoutedTab[]
  // The active tab's route. Defaults to the tab whose route ends the current path (ignoring a checkout return
  // suffix), else the first one.
  value?: string
  outletContext?: unknown
}

// Tabs that are child routes, so each one is deep-linkable; the selected tab's route renders in the outlet.
export const RoutedTabs = ({ tabs, value, outletContext }: RoutedTabsProps) => {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const pathname = stripCheckoutReturn(location.pathname)
  const activeValue = value ?? (tabs.find((tab) => pathname.endsWith(tab.route)) ?? tabs[0])?.route

  return (
    <Tabs.Root
      value={activeValue}
      onValueChange={({ value }) => {
        const tab = tabs.find((entry) => entry.route === value)
        if (tab) navigate(tab.route)
      }}
      lazyMount
    >
      <Tabs.List mb='6'>
        {tabs.map((tab) => (
          <Tabs.Trigger key={tab.route} value={tab.route}>
            {tab.label}
            {tab.count !== undefined && (
              <Badge variant='count'>{tab.count.toLocaleString(i18n.resolvedLanguage)}</Badge>
            )}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {/* The panel the selected trigger controls (aria-controls); the recipe's padding is cancelled. */}
      {/* tabIndex -1: the panel always holds focusable content, so it is not an extra keyboard stop. */}
      <Tabs.Content value={activeValue ?? ''} p='[0]' tabIndex={-1}>
        <Outlet context={outletContext} />
      </Tabs.Content>
    </Tabs.Root>
  )
}
