import { Box, Button, Flex, Icon, Skeleton, Stack, Text } from '@chakra-ui/react'
import { useOrganization } from '@vocdoni/react-components'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuListPlus, LuTrash2, LuUserPlus, LuUsers } from 'react-icons/lu'
import { Banner } from '~components/ui/Banner'
import { SelectionBar } from '~components/ui/SelectionBar'
import { useAffectedVotes } from '~src/queries/affectedVotes'
import { usePaginatedMembers, useMembersCount } from '~src/queries/members'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import { useMemberFields } from '../fields'
import { ImportProgress } from '../Members/Import'
import { useMembersPage } from '../MembersPageContext'
import { AddToCensusSheet, AddToGroupSheet, CreateGroupSheet } from './BulkActions'
import { ContextBar, ReadinessMessage } from './ContextBar'
import { DeleteAllMembersDialog, DeleteMembersDialog } from './DeleteMembersDialog'
import { findMemberLink, isTypingTarget } from './display'
import { PaginationFooter } from './PaginationFooter'
import { PeopleCards } from './PeopleCards'
import { PeopleTable } from './PeopleTable'
import { PersonSheet } from './PersonSheet'
import { RowMenu } from './RowMenu'
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

export const People = () => {
  const { t } = useTranslation()
  const { organization } = useOrganization()
  const url = usePeopleUrlState()
  const { jobId, setJobId } = useMembersPage()
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
  const members = useMemo(() => (query.data?.members ?? []).filter(hasId), [query.data])
  const pagination = query.data?.pagination
  const lastPage = pagination?.lastPage ?? 0
  const selection = useSelection({ resetKey: [url.q, url.page, url.size, url.sort, url.order].join('|') })
  const [selectMode, setSelectMode] = useState(false)
  const [target, setTarget] = useState<ActionTarget | null>(null)
  const [deleteAllOpen, setDeleteAllOpen] = useState(false)
  const showSkeleton = useDelayedFlag(query.isLoading, SKELETON_DELAY_MS)
  const listRef = useRef<HTMLDivElement>(null)
  const { hasLive } = useAffectedVotes()
  const activeMember = members.find((member) => member.id === url.memberId)

  const visibleColumns = fields.filter((field) => !ALWAYS_VISIBLE.includes(field.id) && columns.isVisible(field.id))
  const surnameFirst = url.sortedBy === 'surname'
  const pageSelection = selection.pageState(members.map((member) => member.id))
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

  // Esc clears the selection, unless a dialog or a field has the key
  useEffect(() => {
    if (!selection.count) return
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape' || isTypingTarget(event.target)) return
      if (document.querySelector('[role="dialog"], [role="alertdialog"], [role="menu"]')) return
      selection.clear()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [selection])

  /** j/k step to the next/previous person: the open one in the drawer, or the focused row. */
  const step = useCallback(
    (event: Pick<KeyboardEvent, 'key' | 'metaKey' | 'ctrlKey' | 'altKey' | 'target' | 'preventDefault'>) => {
      if ((event.key !== 'j' && event.key !== 'k') || event.metaKey || event.ctrlKey || event.altKey) return
      if (isTypingTarget(event.target)) return
      const focusedRow = (event.target as HTMLElement).closest?.('[data-member-row]')?.getAttribute('data-member-row')
      const currentId = url.memberId ?? focusedRow
      const index = members.findIndex((member) => member.id === currentId)
      const next = members[index === -1 ? 0 : index + (event.key === 'j' ? 1 : -1)]
      if (!next) return
      event.preventDefault()
      if (url.memberId) url.openMember(next.id)
      else findMemberLink(next.id)?.focus()
    },
    [members, url]
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

  return (
    <Box pb={selection.count ? 24 : 0}>
      <ImportProgress jobId={jobId} onDismiss={() => setJobId(null)} />
      <Toolbar
        value={url.q}
        onSearch={url.setQuery}
        sortedBy={url.sortedBy}
        order={url.order}
        fields={fields}
        onChange={url.setSort}
        isVisible={columns.isVisible}
        setColumn={columns.setColumn}
        onDeleteAll={() => setDeleteAllOpen(true)}
        canDeleteAll={membersCount.count > 0}
      />
      <Box borderWidth='1px' borderColor='border' borderRadius='md' overflow='hidden' bg='bg'>
        <ContextBar pageSelection={pageSelection} pageSize={members.length}>
          <ReadinessMessage />
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
        {pagination && pagination.totalItems > 0 && (
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
        )}
      </Box>

      {selection.count > 0 && (
        <SelectionBar count={selection.count} onClear={selection.clear}>
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
