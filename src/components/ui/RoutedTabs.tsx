import { Badge, Stack, Tabs } from '@chakra-ui/react'
import type { ReactNode } from 'react'
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
  /**
   * `page` spaces the content as a page's main tabs do (a vote's): 20px under the tabs on a phone, 24px on a tablet,
   * 32px on the desktop. `section` (default) keeps 24px.
   */
  rhythm?: 'section' | 'page'
  /** A notice between the tabs and the content (a paused vote's banner), spaced as the header is from the tabs. */
  notice?: ReactNode
}

const CONTENT_GAP = { section: '6', page: { base: '5', md: '6', lg: '8' } } as const
const NOTICE_GAP = { section: '6', page: { base: '5', md: '6', lg: '4.5' } } as const

// Tabs that are child routes, so each one is deep-linkable; the selected tab's route renders in the outlet.
export const RoutedTabs = ({ tabs, value, outletContext, rhythm = 'section', notice }: RoutedTabsProps) => {
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
      <Tabs.List mb={notice ? NOTICE_GAP[rhythm] : CONTENT_GAP[rhythm]}>
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
      <Tabs.Content value={activeValue ?? ''} p='0'>
        {/* Always the same wrapper: switching it when the notice comes or goes would remount the tab and lose its
          state (expanded rows, a lookup). */}
        <Stack gap={CONTENT_GAP[rhythm]}>
          {notice}
          <Outlet context={outletContext} />
        </Stack>
      </Tabs.Content>
    </Tabs.Root>
  )
}
