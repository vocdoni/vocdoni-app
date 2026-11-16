import { Card, Icon, Text } from '@chakra-ui/react'
import { hasResults, isLive, isSecretUntilTheEnd, processVoteCount } from '@vocdoni/api-client'
import { ElectionResults, useElection } from '@vocdoni/react-components'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { generatePath, Navigate } from 'react-router'
import { ErrorBoundary } from '~components/Layout/ErrorBoundary'
import { SectionHeader } from '~components/ui/SectionHeader'
import { StatusBadge, type StatusBadgeColor, type StatusBadgeProps } from '~components/ui/StatusBadge'
import { Tooltip } from '~components/ui/Tooltip'
import { useCensusSize } from '~queries/census'
import { Routes } from '~src/router/routes'
import { InfoIcon } from '~theme/icons'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import { deriveVoteState } from '~utils/vote-state'

/** Resultats: today's results, with the badge that says whether they are live, awaited or final. */
export const VoteResults = () => {
  const { t } = useTranslation()
  const { election, results, status } = useElection()
  const { size: censusSize } = useCensusSize()
  const id = election?.id ?? ''
  const canceled = !!election && deriveVoteState(election) === 'canceled'

  // Election-level participation BI, captured admin-side only (voters are never tracked)
  const trackedResultsElectionRef = useRef<string | null>(null)
  useEffect(() => {
    if (canceled || trackedResultsElectionRef.current === id) return
    if (!election?.published) return
    trackedResultsElectionRef.current = id
    const voteCount = processVoteCount(results)
    trackAnalyticsEvent({
      name: AnalyticsEvents.ProcessResultsViewed,
      props: {
        election_id: id,
        status: status ?? 'unknown',
        vote_count: voteCount,
        census_size: censusSize,
        turnout_pct: censusSize ? Math.round((voteCount / censusSize) * 100) : 0,
      },
    })
  }, [canceled, id, election, results, status, censusSize])

  if (canceled) return <Navigate to={generatePath(Routes.dashboard.process, { id })} replace />

  // The results render through the ballot type, which cannot be inferred for some legacy processes:
  // the section degrades on its own instead of taking the page down.
  const fallback = (
    <Text color='fg.muted'>{t('error.loading_section', { defaultValue: 'This section could not be loaded' })}</Text>
  )

  return (
    <>
      <SectionHeader
        title={t('process.results')}
        actions={<ResultsStateBadge />}
        direction='row'
        align='center'
        mb='4'
      />
      <Card.Root variant='section'>
        <ErrorBoundary fallback={fallback} resetKeys={[election, results]}>
          <ElectionResults />
        </ErrorBoundary>
      </Card.Root>
    </>
  )
}

const ResultsStateBadge = (props: Omit<StatusBadgeProps, 'colorPalette'>) => {
  const { election } = useElection()
  const { t } = useTranslation()

  if (!election) return null

  if (isLive(election) || hasResults(election)) {
    let color: StatusBadgeColor = 'info'
    let text = t('results_state.live_results', 'Live results')
    let tooltip = t(
      'results_state.live_results_tooltip',
      'This voting process shows live results. However, it is still in progress, so the results may change before the vote ends.'
    )
    if (isLive(election) && isSecretUntilTheEnd(election)) {
      color = 'warning'
      text = t('results_state.secret_until_end', 'Awaiting results')
      tooltip = t(
        'results_state.secret_until_end_tooltip',
        'Results are hidden and will only be available once voting ends'
      )
    }
    if (hasResults(election)) {
      color = 'success'
      text = t('results_state.results_available', 'Results available')
      tooltip = null
    }
    const badge = (
      <StatusBadge colorPalette={color} endElement={tooltip ? <Icon as={InfoIcon} /> : undefined} {...props}>
        {text}
      </StatusBadge>
    )

    if (!tooltip) return badge

    return (
      <Tooltip portalled={false} positioning={{ placement: 'top' }} content={tooltip}>
        {badge}
      </Tooltip>
    )
  }

  return null
}
