import { Box, Button, Flex, Icon, Skeleton, Stack, Text } from '@chakra-ui/react'
import { useOrganization } from '@vocdoni/react-components'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuListPlus, LuTrash2, LuUserPlus, LuUsers } from 'react-icons/lu'
import { Banner } from '~components/ui/Banner'
import { SelectionBar } from '~components/ui/SelectionBar'
import { useAffectedVotes } from '~src/queries/affectedVotes'
import {
  MEMBERS_COLLECT_CAP,
  useImportJobProgress,
  useMemberIndex,
  usePaginatedMembers,
  useMembersCount,
  useSignInReadiness,
} from '~src/queries/members'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import { useMemberFields } from '../fields'
import { ImportProgress } from '../Members/Import'
import { useMembersPage } from '../MembersPageContext'
import { AddToCensusSheet, AddToGroupSheet, CreateGroupSheet } from './BulkActions'
import { ContextBar, PageSelectionMessage, ReadinessMessage, Separator } from './ContextBar'
import { DeleteAllMembersDialog, DeleteMembersDialog } from './DeleteMembersDialog'
import { findMemberLink, isTypingTarget } from './display'
import { useLocalRows } from './localView'
import { FirstRun } from './FirstRun'
import { PaginationFooter } from './PaginationFooter'
import { PasteSelectSheet } from './PasteSelectSheet'
import { PeopleCards } from './PeopleCards'
import { PeopleTable } from './PeopleTable'
import { PERSON_DRAWER_WIDTH, PersonSheet } from './PersonSheet'
import { RowMenu } from './RowMenu'
import { EveryoneSelectedMessage, SelectAllMessage, SelectAllOffer, useSelectAllMatching } from './SelectAll'
import { Toolbar } from './Toolbar'
import { ALWAYS_VISIBLE, useColumnVisibility } from './useColumnVisibility'
import { usePeopleUrlState } from './urlState'
import { type SelectedMember, useSelection } from './useSelection'

export const SKELETON_DELAY_MS = 300

type BulkAction = 'create_group' | 'add_to_group' | 'add_to_census' | 'delete'

type ActionTarget = {
  action: BulkAction
  members: SelectedMember[]
  /** Acting on the selection clears it once done; a row's menu leaves it alone */
  fromSelection: boolean
}

/** True only once `active` has lasted `delay` ms, so quick loads never flash a skeleton. */
const useDelayedFlag = (active: boolean, delay: number) => {
  const [flag, setFlag] = useState(false)
  useEffect(() => {
    if (!active) {
      setFlag(false)
      return
    }
    const timer = setTimeout(() => setFlag(true), delay)
    return () => clearTimeout(timer)
  }, [active, delay])
  return flag
}

const hasId = (member: { id?: string }): member is SelectedMember => !!member.id

/**
 * What the list shows: the server's page, or a set already in memory (the selected people, or
 * those who can't get a voting code)
 */
type View = 'list' | 'selected' | 'attention'

export const People = () => {
  const { t, i18n } = useTranslation()
  const { organization } = useOrganization()
  const url = usePeopleUrlState()
  const { jobId, setJobId, openImport, openAddPerson } = useMembersPage()
  const fields = useMemberFields()
  const columns = useColumnVisibility(organization?.address)
  const membersCount = useMembersCount()
  const query = usePaginatedMembers({
    search: url.q,
    page: url.page,
    limit: url.size,
    sortBy: url.sort,
    sortOrder: url.sort ? url.order : undefined,
    keepPrevious: true,
  })
  const pageMembers = useMemo(() => (query.data?.members ?? []).filter(hasId), [query.data])
  const pagination = query.data?.pagination
  const lastPage = pagination?.lastPage ?? 0
  // Survives search, sort and paging; only another organization starts it over
  const selection = useSelection({ resetKey: organization?.address })
  const [view, setView] = useState<View>('list')
  const readiness = useSignInReadiness()
  // "Show them" loads every member (5,000 at most) and keeps those without an email or mobile:
  // there's no endpoint that reads members by id
  const canShowThem = membersCount.count <= MEMBERS_COLLECT_CAP
  const memberIndex = useMemberIndex({ enabled: view === 'attention' })
  const attention = useMemo(() => {
    const ids = new Set(readiness.unreachableIds)
    return (memberIndex.data?.members ?? []).filter((member) => ids.has(member.id))
  }, [memberIndex.data, readiness.unreachableIds])
  const local = useLocalRows(view === 'attention' ? attention : selection.members, {
    sortedBy: url.sortedBy,
    order: url.order,
    size: url.size,
    resetKey: view,
  })
  const members = view === 'list' ? pageMembers : local.rows
  const importJob = useImportJobProgress(jobId)
  const importing = Boolean(jobId) && !importJob.isError && (!importJob.data || importJob.data.status === 'pending')
  const matching = pagination?.totalItems ?? 0
  const selectAll = useSelectAllMatching({ search: url.q, total: matching, selection, importing })
  const [selectMode, setSelectMode] = useState(false)
  const [target, setTarget] = useState<ActionTarget | null>(null)
  const [deleteAllOpen, setDeleteAllOpen] = useState(false)
  const [pasteOpen, setPasteOpen] = useState(false)
  const showSkeleton = useDelayedFlag(query.isLoading, SKELETON_DELAY_MS)
  const listRef = useRef<HTMLDivElement>(null)
  const { hasLive } = useAffectedVotes()
  const activeMember =
    members.find((member) => member.id === url.memberId) ??
    pageMembers.find((member) => member.id === url.memberId) ??
    selection.members.find((member) => member.id === url.memberId) ??
    attention.find((member) => member.id === url.memberId)

  const visibleColumns = fields.filter((field) => !ALWAYS_VISIBLE.includes(field.id) && columns.isVisible(field.id))
  const surnameFirst = url.sortedBy === 'surname'
  const pageSelection = selection.pageState(members.map((member) => member.id))
  // Shown in the bar: how many of the selected aren't among the rows on screen
  const notOnPage = view === 'list' ? selection.count - pageSelection.selected : 0
  const format = (value: number) => value.toLocaleString(i18n.resolvedLanguage)
  const sortLabel = (() => {
    const label = fields.find((field) => field.id === url.sortedBy)?.label ?? url.sortedBy
    return url.order === 'desc'
      ? t('members.people.sort_desc', { defaultValue: '{{field}}, Z to A', field: label })
      : t('members.people.sort_asc', { defaultValue: '{{field}}, A to Z', field: label })
  })()

  // One view per visit, once we know whether there's anyone to show
  const tracked = useRef(false)
  useEffect(() => {
    if (tracked.current || !membersCount.known) return
    tracked.current = true
    trackAnalyticsEvent({
      name: AnalyticsEvents.MembersPageViewed,
      props: { state: membersCount.count > 0 ? 'populated' : 'empty' },
    })
  }, [membersCount.known, membersCount.count])

  // A page past the end (after deleting, or an old link): go to the last one that exists
  useEffect(() => {
    if (lastPage > 0 && url.page > lastPage) url.setPage(lastPage)
  }, [lastPage, url])

  // Nothing left to show in the selected view (cleared, or "everyone" picked): back to the list
  useEffect(() => {
    if (view === 'selected' && (!selection.count || selection.scope === 'all')) setView('list')
  }, [view, selection.count, selection.scope])

  // A new search is about the whole list again
  const onSearch = useCallback(
    (value: string) => {
      setView('list')
      url.setQuery(value)
    },
    [url]
  )

  // Esc clears the selection, unless a dialog or a field has the key
  useEffect(() => {
    if (!selection.count) return
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape' || isTypingTarget(event.target)) return
      // Popovers and menus stay mounted while closed: only an open one owns the key
      if (document.querySelector(':is([role="dialog"], [role="alertdialog"], [role="menu"])[data-state="open"]')) return
      selection.clear()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [selection])

  /**
   * j/k step to the next/previous person: the open one in the drawer, or the focused row. Space on a
   * row's name toggles that row (a checkbox handles Space itself).
   */
  const step = useCallback(
    (event: Pick<KeyboardEvent, 'key' | 'metaKey' | 'ctrlKey' | 'altKey' | 'target' | 'preventDefault'>) => {
      if (event.metaKey || event.ctrlKey || event.altKey || isTypingTarget(event.target)) return
      const focusedRow = (event.target as HTMLElement).closest?.('[data-member-row]')?.getAttribute('data-member-row')
      if (event.key === ' ') {
        const row = focusedRow ? members.find((member) => member.id === focusedRow) : undefined
        if (!row || (event.target as HTMLElement).tagName !== 'A') return
        // On phones the cards only select in select mode
        if (!selectMode && !(event.target as HTMLElement).closest('table')) return
        event.preventDefault()
        selection.toggle(row, !selection.isSelected(row.id))
        return
      }
      if (event.key !== 'j' && event.key !== 'k') return
      const currentId = url.memberId ?? focusedRow
      const index = members.findIndex((member) => member.id === currentId)
      const next = members[index === -1 ? 0 : index + (event.key === 'j' ? 1 : -1)]
      if (!next) return
      event.preventDefault()
      if (url.memberId) url.openMember(next.id)
      else findMemberLink(next.id)?.focus()
    },
    [members, url, selection, selectMode]
  )

  const openAction = (action: BulkAction, targets: SelectedMember[], fromSelection: boolean) =>
    setTarget({ action, members: targets, fromSelection })
  const closeAction = () => setTarget(null)
  const actionDone = () => {
    if (target?.fromSelection) selection.clear()
  }

  const renderRowMenu = (member: SelectedMember, name: string) => (
    <RowMenu
      member={member}
      name={name}
      onAction={(action, row) => (action === 'open' ? url.openMember(row.id) : openAction(action, [row], false))}
    />
  )

  const searching = Boolean(url.q)
  const empty = (() => {
    if (view === 'attention') {
      if (memberIndex.isError)
        return (
          <Banner
            status='error'
            action={
              <Button size='sm' variant='outline' onClick={() => memberIndex.refetch()}>
                {t('members.people.retry', { defaultValue: 'Try again' })}
              </Button>
            }
          >
            {t('members.attention.load_error', { defaultValue: "We couldn't load them." })}
          </Banner>
        )
      if (!memberIndex.data) return <Box h='120px' />
      if (members.length) return null
      return (
        <Text py={10} textAlign='center' color='fg.muted' fontSize='sm'>
          {t('members.attention.none', { defaultValue: 'Everyone can get a voting code now.' })}
        </Text>
      )
    }
    if (query.isError && !query.data)
      return (
        <Banner
          status='error'
          action={
            <Button size='sm' variant='outline' onClick={() => query.refetch()}>
              {t('members.people.retry', { defaultValue: 'Try again' })}
            </Button>
          }
        >
          {t('members.people.load_error', { defaultValue: "We couldn't load your members." })}
        </Banner>
      )
    if (query.isLoading)
      return showSkeleton ? (
        <Stack gap={3} py={2} aria-busy='true'>
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} h='20px' />
          ))}
        </Stack>
      ) : (
        <Box h='120px' />
      )
    if (members.length) return null
    if (searching)
      return (
        <Stack align='center' gap={2} py={10} textAlign='center'>
          <Text fontWeight='bolder'>
            {t('members.people.no_results', { defaultValue: 'Nobody matches your search' })}
          </Text>
          <Text fontSize='sm' color='fg.muted'>
            {t('members.people.no_results_hint', {
              defaultValue: 'Search looks in names, emails, member numbers and national IDs.',
            })}
          </Text>
          <Button size='sm' variant='outline' onClick={() => url.setQuery('')}>
            {t('members.people.clear_search', { defaultValue: 'Clear search' })}
          </Button>
        </Stack>
      )
    return (
      <Text py={10} textAlign='center' color='fg.muted' fontSize='sm'>
        {t('members.people.empty', { defaultValue: 'No members yet.' })}
      </Text>
    )
  })()

  const dimmed = query.isPlaceholderData
  const caption = t('members.people.caption', {
    defaultValue: 'Members, sorted by {{sort}}, page {{page}} of {{total}}',
    sort: sortLabel,
    page: url.page,
    total: Math.max(1, lastPage),
  })

  // Nobody yet and nothing on its way: the ways to add people instead of an empty table
  if (membersCount.known && membersCount.count === 0 && !jobId && !url.q)
    return <FirstRun onImport={openImport} onAddPeople={openAddPerson} />

  return (
    <Box pb={selection.count ? 24 : 0}>
      <ImportProgress jobId={jobId} onDismiss={() => setJobId(null)} />
      <Toolbar
        value={url.q}
        onSearch={onSearch}
        sortedBy={url.sortedBy}
        order={url.order}
        fields={fields}
        onChange={url.setSort}
        isVisible={columns.isVisible}
        setColumn={columns.setColumn}
        onDeleteAll={() => setDeleteAllOpen(true)}
        canDeleteAll={membersCount.count > 0}
        onPasteSelect={() => setPasteOpen(true)}
        selected={
          selection.scope === 'ids'
            ? {
                count: selection.count,
                pressed: view === 'selected',
                onToggle: () => setView(view === 'selected' ? 'list' : 'selected'),
              }
            : undefined
        }
      />
      <Box borderWidth='1px' borderColor='border' borderRadius='md' overflow='hidden' bg='bg'>
        <ContextBar>
          {view === 'attention' ? (
            <>
              <Text fontSize='sm' fontVariantNumeric='tabular-nums' truncate role='status'>
                {memberIndex.progress && !memberIndex.data
                  ? t('members.attention.loading', {
                      defaultValue: 'Loading your members… {{done}} of {{total}}',
                      done: format(memberIndex.progress.collected),
                      total: format(memberIndex.progress.total),
                    })
                  : !memberIndex.data
                    ? null
                    : attention.length
                      ? t('members.attention.showing', {
                          defaultValue_one: 'Showing the person with no email or mobile',
                          defaultValue_other: 'Showing the {{formattedCount}} with no email or mobile',
                          count: attention.length,
                          formattedCount: format(attention.length),
                        })
                      : t('members.attention.none', { defaultValue: 'Everyone can get a voting code now.' })}
              </Text>
              <Separator />
              <Button size='xs' variant='plain' px={0} color='fg.info' onClick={() => setView('list')}>
                {t('members.selection.show_everyone', { defaultValue: 'Show everyone' })}
              </Button>
            </>
          ) : view === 'selected' ? (
            <>
              <Text fontSize='sm' fontVariantNumeric='tabular-nums' truncate>
                {t('members.selection.showing_selected', {
                  defaultValue_one: 'Showing the person you selected',
                  defaultValue_other: 'Showing the {{formattedCount}} you selected',
                  count: selection.count,
                  formattedCount: format(selection.count),
                })}
              </Text>
              <Separator />
              <Button size='xs' variant='plain' px={0} color='fg.info' onClick={() => setView('list')}>
                {t('members.selection.show_everyone', { defaultValue: 'Show everyone' })}
              </Button>
            </>
          ) : selectAll.state.status !== 'idle' ? (
            <SelectAllMessage selectAll={selectAll} />
          ) : selection.scope === 'all' ? (
            <EveryoneSelectedMessage total={selection.count} onClear={selection.clear} />
          ) : pageSelection.some ? (
            <PageSelectionMessage pageSelection={pageSelection} pageSize={members.length}>
              {view === 'list' && pageSelection.all && matching > members.length && (
                <SelectAllOffer total={matching} searching={searching} selectAll={selectAll} />
              )}
            </PageSelectionMessage>
          ) : (
            <ReadinessMessage onShowThem={canShowThem ? () => setView('attention') : undefined} />
          )}
        </ContextBar>
        <Box ref={listRef} onKeyDown={(event) => step(event.nativeEvent)}>
          <Box hideBelow='md'>
            <PeopleTable
              members={members}
              columns={visibleColumns}
              fields={fields}
              sortedBy={url.sortedBy}
              order={url.order}
              onSort={url.setSort}
              selection={selection}
              activeId={url.memberId}
              memberLocation={url.memberLocation}
              onOpen={url.openMember}
              renderRowMenu={renderRowMenu}
              caption={caption}
              dimmed={dimmed}
              empty={empty}
            />
          </Box>
          <Box hideFrom='md'>
            {members.length > 0 && (
              <Flex justify='flex-end' px={4} py={1}>
                <Button
                  size='sm'
                  variant='ghost'
                  aria-pressed={selectMode}
                  onClick={() => {
                    if (selectMode) selection.clear()
                    setSelectMode(!selectMode)
                  }}
                >
                  {selectMode
                    ? t('members.people.select_done', { defaultValue: 'Done' })
                    : t('members.people.select_mode', { defaultValue: 'Select' })}
                </Button>
              </Flex>
            )}
            <PeopleCards
              members={members}
              surnameFirst={surnameFirst}
              selectMode={selectMode}
              selection={selection}
              activeId={url.memberId}
              memberLocation={url.memberLocation}
              onOpen={url.openMember}
              renderRowMenu={renderRowMenu}
              dimmed={dimmed}
              empty={empty}
            />
          </Box>
        </Box>
        {view === 'list'
          ? pagination &&
            pagination.totalItems > 0 && (
              <PaginationFooter
                page={url.page}
                lastPage={lastPage}
                size={url.size}
                total={pagination.totalItems}
                shown={members.length}
                searching={searching}
                onPage={url.setPage}
                onSize={url.setSize}
              />
            )
          : local.total > 0 && (
              <PaginationFooter
                page={local.page}
                lastPage={local.lastPage}
                size={url.size}
                total={local.total}
                shown={members.length}
                searching={false}
                onPage={local.setPage}
                onSize={url.setSize}
              />
            )}
      </Box>

      {selection.count > 0 && (
        <SelectionBar
          count={selection.count}
          onClear={selection.clear}
          secondary={
            notOnPage > 0
              ? t('members.selection.not_on_page', {
                  defaultValue_one: '({{formattedCount}} not on this page)',
                  defaultValue_other: '({{formattedCount}} not on this page)',
                  count: notOnPage,
                  formattedCount: format(notOnPage),
                })
              : undefined
          }
          // The person drawer sits beside the list from xl: keep the bar clear of it
          rightInset={url.memberId ? PERSON_DRAWER_WIDTH : undefined}
        >
          <Button size='sm' variant='outline' onClick={() => openAction('create_group', selection.members, true)}>
            <Icon as={LuUsers} />
            {t('members.table.create_group', { defaultValue: 'Create group' })}
          </Button>
          <Button size='sm' variant='outline' onClick={() => openAction('add_to_group', selection.members, true)}>
            <Icon as={LuUserPlus} />
            {t('members.table.add_to_group', { defaultValue: 'Add to Group' })}
          </Button>
          <Button size='sm' variant='outline' onClick={() => openAction('add_to_census', selection.members, true)}>
            <Icon as={LuListPlus} />
            {t('members.table.add_to_census', { defaultValue: 'Add to census' })}
          </Button>
          <Button
            size='sm'
            variant='outline'
            colorPalette='red'
            onClick={() => openAction('delete', selection.members, true)}
          >
            <Icon as={LuTrash2} />
            {t('members.table.bulk_delete', { defaultValue: 'Delete' })}
          </Button>
        </SelectionBar>
      )}

      <PersonSheet
        memberId={url.memberId}
        member={activeMember}
        loading={query.isLoading}
        onClose={url.closeMember}
        onDelete={(member) => openAction('delete', [member], false)}
        onStep={step}
        inLiveVote={hasLive}
      />
      <CreateGroupSheet
        open={target?.action === 'create_group'}
        onOpenChange={(open) => !open && closeAction()}
        members={target?.members ?? []}
        onDone={actionDone}
      />
      <AddToGroupSheet
        open={target?.action === 'add_to_group'}
        onOpenChange={(open) => !open && closeAction()}
        members={target?.members ?? []}
        onDone={actionDone}
      />
      <AddToCensusSheet
        open={target?.action === 'add_to_census'}
        onOpenChange={(open) => !open && closeAction()}
        members={target?.members ?? []}
        onDone={actionDone}
      />
      <DeleteMembersDialog
        open={target?.action === 'delete'}
        onOpenChange={(open) => !open && closeAction()}
        members={target?.members ?? []}
        scope={target?.fromSelection ? 'selection' : 'single'}
        onDeleted={(ids) => {
          actionDone()
          if (url.memberId && ids.includes(url.memberId)) url.closeMember()
        }}
      />
      <PasteSelectSheet
        open={pasteOpen}
        onOpenChange={setPasteOpen}
        total={membersCount.count}
        onSelect={(found) => selection.setMany(found, true)}
      />
      <DeleteAllMembersDialog
        open={deleteAllOpen}
        onOpenChange={setDeleteAllOpen}
        total={membersCount.count}
        onDeleted={selection.clear}
      />
    </Box>
  )
}

export default People
