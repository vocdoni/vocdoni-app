import { Alert, Box, Button, Card, Flex, HStack, Icon, Input, InputGroup, Stack, Text } from '@chakra-ui/react'
import type { VotingProcessResponse } from '@vocdoni/api-types'
import { RoutedPaginationProvider, useOrganization } from '@vocdoni/react-components'
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { generatePath, Link as RouterLink, matchPath, useLocation, useNavigate, useSearchParams } from 'react-router'
import { ErrorBoundary } from '~components/Layout/ErrorBoundary'
import RoutedPaginatedTableFooter from '~components/Pagination/PaginatedTableFooter'
import { EmptyState } from '~components/ui/EmptyState'
import { ListLoader } from '~components/ui/Loader'
import { PageTitle } from '~components/ui/PageTitle'
import { useUrlPagination } from '~queries/members'
import { readRemembered, usePauseMemoryVersion } from '~queries/vote-pause'
import { useCanManageVotes, useOrganizationVotes, useVotesResults } from '~queries/votes'
import { Routes } from '~routes'
import { AddIcon, SearchIcon } from '~theme/icons'
import { quantity } from '~utils/numbers'
import { useNow } from '~utils/use-now'
import {
  countByFilter,
  matchesFilter,
  matchesSearch,
  normalizeSearch,
  toVoteRows,
  VOTE_FILTERS,
  type VoteFilter,
  type VoteRow,
} from '~utils/vote-state'
import { VoteListRow } from './VoteListRow'
import { VotesEmpty } from './VotesEmpty'

const useFilter = (): VoteFilter => {
  const { pathname } = useLocation()
  return VOTE_FILTERS.find((filter) => matchPath(Routes.dashboard.processes[filter], pathname)) ?? 'all'
}

// Out-of-range `?limit=` values would render nothing (0, NaN) or every row at once, with one results read each.
const clampLimit = (limit: number) => (Number.isInteger(limit) ? Math.min(Math.max(limit, 1), 100) : 10)
// The URL follows the search field this long after the last keystroke.
const SEARCH_URL_DELAY_MS = 150

const NO_VOTES: VotingProcessResponse[] = []

/** A failed load, or a failed refresh over the rows already shown (then the rows stay), with a way to try again. */
const LoadAlert = ({ stale, retrying, onRetry }: { stale: boolean; retrying: boolean; onRetry: () => void }) => {
  const { t } = useTranslation()
  return (
    <Alert.Root status={stale ? 'warning' : 'error'} role='alert' alignItems='center'>
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>
          {stale
            ? t('votes.list.refresh_error', { defaultValue: 'The list could not be refreshed' })
            : t('votes.list.load_error', { defaultValue: 'The votes could not be loaded' })}
        </Alert.Title>
        {/* The button says what to do next; only a stale list needs a word on what it shows. */}
        {stale && (
          <Alert.Description>
            {t('votes.list.refresh_error_hint', { defaultValue: 'It shows the votes as they were last loaded.' })}
          </Alert.Description>
        )}
      </Alert.Content>
      <Button size='sm' variant='outline' loading={retrying} onClick={onRetry}>
        {t('votes.list.retry', { defaultValue: 'Try again' })}
      </Button>
    </Alert.Root>
  )
}

const RowFallback = () => {
  const { t } = useTranslation()
  return (
    <Card.Body>
      <Text textStyle='body-sm' color='fg.muted'>
        {t('votes.list.row_error', { defaultValue: 'This vote could not be shown.' })}
      </Text>
    </Card.Body>
  )
}

/** Every vote of the organisation in one column of plain rows: filter by state and search. */
export const VotesPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { search } = useLocation()
  const [searchParams] = useSearchParams()
  const { organization } = useOrganization()
  const { data, isLoading, error, refetch, isFetching } = useOrganizationVotes()
  const canManage = useCanManageVotes()
  const now = useNow()
  const pagination = useUrlPagination()
  const { page } = pagination
  const limit = clampLimit(pagination.limit)
  const filter = useFilter()
  const query = searchParams.get('q') ?? ''
  const memoryVersion = usePauseMemoryVersion()

  // The field owns its text (no caret jumps, no lost keys); the URL follows it shortly after, and a URL changed
  // elsewhere (Back, a link) refills it.
  const [searchText, setSearchText] = useState(query)
  const urlWritten = useRef(query)
  useEffect(() => {
    if (query !== urlWritten.current) {
      urlWritten.current = query
      setSearchText(query)
    }
  }, [query])
  const deferredSearch = useDeferredValue(searchText)

  const createPath = generatePath(Routes.processes.create)

  // This browser's pause memory tells a held question-by-question vote from a ready one (list items carry no votes);
  // its version re-derives the rows when it changes.
  const rows = useMemo(() => toVoteRows(data ?? NO_VOTES, now, readRemembered), [data, now, memoryVersion])
  // Counts ignore the search, so the chips tell what each state holds in total.
  const counts = useMemo(() => countByFilter(rows), [rows])
  // The list API has no search parameter, so the loaded rows are filtered here.
  const visible = useMemo(() => {
    const normalized = normalizeSearch(deferredSearch)
    return rows.filter((row) => matchesFilter(row.state, filter) && matchesSearch(row.process, normalized))
  }, [rows, filter, deferredSearch])

  const lastPage = Math.max(1, Math.ceil(visible.length / limit))
  // A page that is not a whole number (`/abc`) reads as the first one instead of an empty frame.
  const currentPage = Math.min(Math.max(1, Number.isInteger(page) ? page : 1), lastPage)
  const pageRows = useMemo(
    () => visible.slice((currentPage - 1) * limit, currentPage * limit),
    [visible, currentPage, limit]
  )

  // Results only for the rows on screen that show a figure: the closed votes of this page.
  const resultIds = useMemo(
    () => pageRows.filter((row) => row.state === 'closed').map((row) => row.process.id),
    [pageRows]
  )
  const results = useVotesResults(resultIds)

  // Search and filter changes keep `?limit=` and start again on page 1.
  const go = useCallback(
    (nextFilter: VoteFilter, nextQuery: string, replace = false) => {
      const params = new URLSearchParams(search)
      if (nextQuery) params.set('q', nextQuery)
      else params.delete('q')
      const queryString = params.toString()
      urlWritten.current = nextQuery
      navigate(
        {
          pathname: generatePath(Routes.dashboard.processes[nextFilter], { page: '1' }),
          search: queryString ? `?${queryString}` : '',
        },
        { replace }
      )
    },
    [navigate, search]
  )

  useEffect(() => {
    if (searchText === urlWritten.current) return
    const timer = setTimeout(() => go(filter, searchText, true), SEARCH_URL_DELAY_MS)
    return () => clearTimeout(timer)
  }, [searchText, filter, go])

  const filterLabel: Record<VoteFilter, string> = {
    all: t('votes.list.filter.all', { defaultValue: 'All' }),
    live: t('votes.list.filter.live', { defaultValue: 'Live' }),
    ready: t('votes.list.filter.ready', { defaultValue: 'Ready' }),
    drafts: t('votes.list.filter.drafts', { defaultValue: 'Drafts' }),
    closed: t('votes.list.filter.closed', { defaultValue: 'Closed' }),
  }

  const renderRow = (row: VoteRow) => (
    <ErrorBoundary key={row.process.id} resetKeys={[row.process]} fallback={<RowFallback />}>
      <VoteListRow row={row} results={results[row.process.id]} canManage={canManage} now={now} />
    </ErrorBoundary>
  )

  const loading = !organization || isLoading
  // A failed refresh keeps the rows already loaded; only a first load that failed has nothing to show.
  const failed = !!error && !data
  const hasData = !loading && !failed
  let content = null
  if (!loading && !failed) {
    if (!rows.length) {
      content = <VotesEmpty canCreate={canManage} />
    } else if (!visible.length) {
      content = (
        <EmptyState
          size='md'
          title={t('votes.list.no_match', { defaultValue: 'No vote matches' })}
          description={t('votes.list.no_match_hint', { defaultValue: 'Try another filter or search.' })}
        />
      )
    } else {
      content = (
        <>
          <Card.Root variant='frame' as='section' aria-label={filterLabel[filter]}>
            {/* Card.Body draws the rule between rows. */}
            <Stack gap='0'>{pageRows.map(renderRow)}</Stack>
          </Card.Root>
          {visible.length > limit && (
            <RoutedPaginationProvider
              path={Routes.dashboard.processes[filter]}
              pagination={{
                totalItems: visible.length,
                lastPage,
              }}
            >
              <RoutedPaginatedTableFooter />
            </RoutedPaginationProvider>
          )}
        </>
      )
    }
  }

  // The mockup's empty layout carries its own title and call to action.
  const showToolbar = loading || !!error || rows.length > 0

  return (
    // The header stands apart from the list; the toolbar and the list keep together. On a very wide screen the
    // column keeps its width and sits centred in the page (board V4VotesWide).
    <Stack gap={{ base: '5', md: '6', lg: '8' }} w='full' maxW='content.list' mx={{ '2xl': 'auto' }}>
      {/* Centred on a phone and a tablet; from `lg` the button lines up with the title's bottom edge, as the board. */}
      <Flex justify='space-between' align={{ base: 'center', lg: 'flex-end' }} gap={{ base: '3', lg: '4' }}>
        <PageTitle>{t('votes.list.title', { defaultValue: 'Votes' })}</PageTitle>
        {/* The empty list carries its own call to action; while loading or after a failure the button stays. */}
        {(rows.length > 0 || !hasData) && canManage && (
          <Button variant='outline' asChild>
            <RouterLink to={createPath}>
              <Icon as={AddIcon} />
              {t('votes.list.new', { defaultValue: 'New vote' })}
            </RouterLink>
          </Button>
        )}
      </Flex>

      <Stack gap={{ base: '5', md: '6', lg: '4' }}>
        {showToolbar && (
          // The search sits over the chips up to `lg` (at most `80` wide from md), beside them from `lg`.
          <Flex direction={{ base: 'column', lg: 'row' }} justify='space-between' gap={{ base: '3', lg: '4' }}>
            {/* On phones: one line that scrolls sideways and bleeds to the screen edge (the page gutter is 4). A scroll
              box clips what is drawn outside its children, so it keeps room for the chips' 1px ring on every side.
              From md the chips fit, nothing scrolls and nothing is clipped. */}
            <Box
              order={{ base: 2, lg: 1 }}
              overflowX={{ base: 'auto', md: 'visible' }}
              scrollbar='hidden'
              mx={{ base: '-4', md: '0' }}
              my={{ base: '-0.5', md: '0' }}
              px={{ base: '4', md: '0' }}
              py={{ base: '0.5', md: '0' }}
            >
              <HStack
                role='group'
                aria-label={t('votes.list.filter_label', { defaultValue: 'Filter by state' })}
                gap='2'
                flexWrap={{ base: 'nowrap', md: 'wrap' }}
                w={{ base: '[max-content]', md: 'auto' }}
              >
                {VOTE_FILTERS.map((item) => (
                  <Button
                    key={item}
                    variant='chip'
                    size='sm'
                    aria-pressed={item === filter}
                    onClick={() => go(item, searchText)}
                  >
                    {/* The space keeps the accessible name "All 4"; a flex gap draws the visual one. */}
                    {filterLabel[item]} {/* No count until the list has loaded: a 0 there would be false. */}
                    {hasData && (
                      <Text as='span' textStyle='figure' fontWeight='normal' color='fg.subtle'>
                        {quantity(counts[item])}
                      </Text>
                    )}
                  </Button>
                ))}
              </HStack>
            </Box>
            <InputGroup
              order={{ base: 1, lg: 2 }}
              w={{ base: 'full', lg: '60' }}
              maxW={{ md: '80' }}
              flexShrink={0}
              startElement={<Icon as={SearchIcon} />}
              startElementProps={{ color: 'fg.subtle', px: { base: '3', lg: '2.5' } }}
            >
              {/* The board's search is a compact field from `lg` (as tall as the chips beside it), the touch one
                below; the padding clears the icon. */}
              <Input
                type='search'
                size='sm'
                h={{ base: 'control.touch', md: 'control.tablet', lg: '7' }}
                ps={{ base: '9', lg: '8' }}
                pe='3'
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                aria-label={t('votes.list.search', { defaultValue: 'Search a vote' })}
                placeholder={t('votes.list.search', { defaultValue: 'Search a vote' })}
              />
            </InputGroup>
          </Flex>
        )}

        {!!error && !loading && <LoadAlert stale={!failed} retrying={isFetching} onRetry={() => void refetch()} />}
        {loading && <ListLoader />}
        {content}
      </Stack>
    </Stack>
  )
}
