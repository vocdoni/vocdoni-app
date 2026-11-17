import { Stack } from '@chakra-ui/react'
import { processVoteCount } from '@vocdoni/api-client'
import { useElection } from '@vocdoni/react-components'
import { useTranslation } from 'react-i18next'
import { generatePath, matchPath, useLocation } from 'react-router'
import { ActionsProvider } from '~components/Actions'
import { useActions } from '~components/Actions/ActionsContext'
import { DashboardContents } from '~components/Dashboard/Contents'
import { RoutedTabs, type RoutedTab } from '~components/ui/RoutedTabs'
import { Routes } from '~src/router/routes'
import { isQuestionByQuestion } from '~src/types/voting-process'
import { PauseBanner } from './PauseBanner'
import { VoteHeader } from './VoteHeader'

/** The tabs, with the pause banner under them on Resum while the vote is paused (as a whole). */
const VoteTabs = ({ tabs, value, withNotice }: { tabs: RoutedTab[]; value: string; withNotice: boolean }) => {
  const { election, results } = useElection()
  const { state } = useActions()
  const byQuestion = isQuestionByQuestion(election)
  const paused = state === 'paused'
  const notice =
    withNotice && paused ? <PauseBanner byQuestion={byQuestion} votes={processVoteCount(results)} /> : undefined
  return <RoutedTabs tabs={tabs} value={value} rhythm='page' notice={notice} />
}

/**
 * The organiser's vote page: header and tabs. Each tab is a child route (Resum, Papereta) that `RoutedTabs` renders
 * in its outlet. The results are read on Resum (R31), and a question-by-question vote is run from there (R32).
 */
export const ProcessView = () => {
  const { t } = useTranslation()
  const { election } = useElection()
  const { pathname } = useLocation()
  const id = election?.id ?? ''

  const summary = generatePath(Routes.dashboard.process, { id })
  const tabs: RoutedTab[] = [
    { label: t('votes.page.tab.summary', { defaultValue: 'Summary' }), route: summary },
    {
      label: t('votes.page.tab.ballot', { defaultValue: 'Ballot' }),
      route: generatePath(Routes.dashboard.processBallot, { id }),
    },
  ]
  // RoutedTabs matches the end of the path, which cannot tell the index from the others: match exactly.
  const value = (tabs.find((tab) => matchPath({ path: tab.route, end: true }, pathname)) ?? tabs[0]).route

  return (
    <ActionsProvider>
      <DashboardContents rhythm='board'>
        {/* Header to tabs as the boards: 20px on a phone, 24px on a tablet, 18px on the desktop. */}
        <Stack gap={{ base: '5', md: '6', lg: '4.5' }}>
          <VoteHeader />
          <VoteTabs tabs={tabs} value={value} withNotice={value === summary} />
        </Stack>
      </DashboardContents>
    </ActionsProvider>
  )
}
