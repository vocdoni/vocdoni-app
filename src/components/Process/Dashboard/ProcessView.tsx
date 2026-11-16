import { Stack } from '@chakra-ui/react'
import { useElection } from '@vocdoni/react-components'
import { useTranslation } from 'react-i18next'
import { generatePath, matchPath, useLocation } from 'react-router'
import { ActionsProvider } from '~components/Actions'
import { DashboardContents } from '~components/Dashboard/Contents'
import { RoutedTabs, type RoutedTab } from '~components/ui/RoutedTabs'
import { Routes } from '~src/router/routes'
import { isQuestionByQuestion } from '~src/types/voting-process'
import { deriveVoteState } from '~utils/vote-state'
import { VoteHeader } from './VoteHeader'

/**
 * The organiser's vote page: header and tabs. Each tab is a child route (Resum, Gestió for a question-by-question
 * vote, Papereta, Resultats) that `RoutedTabs` renders in its outlet.
 */
export const ProcessView = () => {
  const { t } = useTranslation()
  const { election } = useElection()
  const { pathname } = useLocation()
  const id = election?.id ?? ''
  const canceled = !!election && deriveVoteState(election) === 'canceled'

  const summary = generatePath(Routes.dashboard.process, { id })
  const tabs: RoutedTab[] = [
    { label: t('votes.page.tab.summary', { defaultValue: 'Summary' }), route: summary },
    ...(isQuestionByQuestion(election)
      ? [
          {
            label: t('votes.page.tab.manage', { defaultValue: 'Manage' }),
            route: generatePath(Routes.dashboard.processManage, { id }),
          },
        ]
      : []),
    {
      label: t('votes.page.tab.ballot', { defaultValue: 'Ballot' }),
      route: generatePath(Routes.dashboard.processBallot, { id }),
    },
    ...(canceled
      ? []
      : [
          {
            label: t('votes.page.tab.results', { defaultValue: 'Results' }),
            route: generatePath(Routes.dashboard.processResults, { id }),
          },
        ]),
  ]
  // RoutedTabs matches the end of the path, which cannot tell the index from the others: match exactly.
  const value = (tabs.find((tab) => matchPath({ path: tab.route, end: true }, pathname)) ?? tabs[0]).route

  return (
    <ActionsProvider>
      <DashboardContents>
        <Stack gap='6'>
          <VoteHeader />
          <RoutedTabs tabs={tabs} value={value} />
        </Stack>
      </DashboardContents>
    </ActionsProvider>
  )
}
