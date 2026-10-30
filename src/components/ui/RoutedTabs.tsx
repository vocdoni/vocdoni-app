import { Badge, Tabs } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { Outlet, useLocation, useNavigate } from 'react-router'

export type RoutedTab = {
  label: string
  route: string
  count?: number
}

type RoutedTabsProps = {
  tabs: RoutedTab[]
  // The active tab's route. Defaults to the tab whose route ends the current path, else the first one.
  value?: string
  outletContext?: unknown
}

// Tabs that are child routes, so each one is deep-linkable; the selected tab's route renders in the outlet.
export const RoutedTabs = ({ tabs, value, outletContext }: RoutedTabsProps) => {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const activeValue = value ?? (tabs.find((tab) => location.pathname.endsWith(tab.route)) ?? tabs[0])?.route

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
              <Badge
                colorPalette='gray'
                variant='subtle'
                borderRadius='full'
                px='1.5'
                fontVariantNumeric='tabular-nums'
              >
                {tab.count.toLocaleString(i18n.resolvedLanguage)}
              </Badge>
            )}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      <Outlet context={outletContext} />
    </Tabs.Root>
  )
}
