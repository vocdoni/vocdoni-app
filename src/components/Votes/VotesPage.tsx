import { Box, Button, Card, Flex, HStack, Icon, Input, InputGroup, Stack, Text } from '@chakra-ui/react'
import { RoutedPaginationProvider, useOrganization } from '@vocdoni/react-components'
import { useCallback, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { generatePath, Link as RouterLink, matchPath, useLocation, useNavigate, useSearchParams } from 'react-router'
import { ErrorBoundary } from '~components/Layout/ErrorBoundary'
import RoutedPaginatedTableFooter from '~components/Pagination/PaginatedTableFooter'
import { EmptyState } from '~components/ui/EmptyState'
import { KeyHint } from '~components/ui/KeyHint'
import { ListStateAlert } from '~components/ui/ListStateAlert'
import { ListLoader } from '~components/ui/Loader'
import { PageTitle } from '~components/ui/PageTitle'
import { useIsDesktop } from '~components/ui/useIsMobile'
import { useUrlPagination } from '~queries/members'
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
} from '~utils/vote-state'
import { VoteListRow } from './VoteListRow'
import { VotesEmpty } from './VotesEmpty'
import { useListShortcuts } from './useListShortcuts'

const useFilter = (): VoteFilter => {
  const { pathname } = useLocation()
  return VOTE_FILTERS.find((filter) => matchPath(Routes.dashboard.processes[filter], pathname)) ?? 'all'
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
  const { data, isLoading, error } = useOrganizationVotes()
  const canManage = useCanManageVotes()
  const now = useNow()
  const { page, limit } = useUrlPagination()
  const isDesktop = useIsDesktop()
  const searchRef = useRef<HTMLInputElement>(null)
  const filter = useFilter()
  const query = searchParams.get('q') ?? ''

  const createPath = generatePath(Routes.processes.create)
  const onNew = useCallback(() => navigate(createPath), [navigate, createPath])
  useListShortcuts({ onNew, searchRef, enabled: isDesktop })

  const rows = useMemo(() => toVoteRows(data ?? [], now), [data, now])
  // Counts ignore the search, so the chips tell what each state holds in total.
  const counts = useMemo(() => countByFilter(rows), [rows])
  // The list API has no search parameter, so the loaded rows are filtered here.
  const visible = useMemo(() => {
    const normalized = normalizeSearch(query)
    return rows.filter((row) => matchesFilter(row.state, filter) && matchesSearch(row.process, normalized))
  }, [rows, filter, query])

  const lastPage = Math.max(1, Math.ceil(visible.length / limit))
  const currentPage = Math.min(Math.max(1, page), lastPage)
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
  const go = (nextFilter: VoteFilter, nextQuery: string, replace = false) => {
    const params = new URLSearchParams(search)
    if (nextQuery) params.set('q', nextQuery)
    else params.delete('q')
    const queryString = params.toString()
    navigate(
      {
        pathname: generatePath(Routes.dashboard.processes[nextFilter], { page: '1' }),
        search: queryString ? `?${queryString}` : '',
      },
      { replace }
    )
  }

  const filterLabel: Record<VoteFilter, string> = {
    all: t('votes.list.filter.all', { defaultValue: 'All' }),
    live: t('votes.list.filter.live', { defaultValue: 'Live' }),
    ready: t('votes.list.filter.ready', { defaultValue: 'Ready' }),
    drafts: t('votes.list.filter.drafts', { defaultValue: 'Drafts' }),
    closed: t('votes.list.filter.closed', { defaultValue: 'Closed' }),
  }

  const renderRow = (row: (typeof rows)[number]) => (
    <ErrorBoundary key={row.process.id} resetKeys={[row.process]} fallback={<RowFallback />}>
      <VoteListRow row={row} results={results[row.process.id]} canManage={canManage} now={now} />
    </ErrorBoundary>
  )

  const loading = !organization || isLoading
  let content = null
  if (!loading && !error) {
    if (!rows.length) {
      content = <VotesEmpty />
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
    // The header stands apart from the list; the toolbar and the list keep together.
    <Stack gap={{ base: '5', md: '6', lg: '8' }} maxW='content.narrow'>
      {/* Centred on a phone and a tablet; from `lg` the button lines up with the title's bottom edge, as the board. */}
      <Flex justify='space-between' align={{ base: 'center', lg: 'flex-end' }} gap={{ base: '3', lg: '4' }}>
        <PageTitle>{t('votes.list.title', { defaultValue: 'Votes' })}</PageTitle>
        {rows.length > 0 && (
          <Button variant='outline' asChild aria-keyshortcuts='n'>
            <RouterLink to={createPath}>
              <Icon as={AddIcon} />
              {t('votes.list.new', { defaultValue: 'New vote' })}
              <KeyHint display={{ base: 'none', lg: 'inline-flex' }}>N</KeyHint>
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
                    onClick={() => go(item, query)}
                  >
                    {/* The space keeps the accessible name "All 4"; a flex gap draws the visual one. */}
                    {filterLabel[item]}{' '}
                    <Text as='span' textStyle='figure' fontWeight='normal' color='fg.subtle'>
                      {quantity(counts[item])}
                    </Text>
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
              endElement={<KeyHint display={{ base: 'none', lg: 'inline-flex' }}>/</KeyHint>}
              endElementProps={{ px: '1.5' }}
            >
              {/* The board's search is a compact field from `lg` (as tall as the chips beside it), the touch one
                below; the padding clears the icon and, from `lg`, the key hint. */}
              <Input
                ref={searchRef}
                type='search'
                size='sm'
                h={{ base: 'control.touch', md: 'control.tablet', lg: '7' }}
                ps={{ base: '9', lg: '8' }}
                pe={{ base: '3', lg: '8' }}
                value={query}
                onChange={(event) => go(filter, event.target.value, true)}
                aria-label={t('votes.list.search', { defaultValue: 'Search a vote' })}
                placeholder={t('votes.list.search', { defaultValue: 'Search a vote' })}
              />
            </InputGroup>
          </Flex>
        )}

        <ListStateAlert
          error={error}
          title={t('processes.load_error', { defaultValue: 'Unable to load voting processes' })}
          fallback={t('processes.load_error_description', { defaultValue: 'Please try again.' })}
        />
        {loading && <ListLoader />}
        {content}
      </Stack>
    </Stack>
  )
}
