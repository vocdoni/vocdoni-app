import {
  Box,
  Button,
  Checkbox,
  Flex,
  Icon,
  IconButton,
  Input,
  InputGroup,
  Link,
  Skeleton,
  Stack,
  Table,
  Text,
} from '@chakra-ui/react'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuChevronLeft, LuChevronRight, LuCircleAlert, LuSearch, LuUserMinus, LuUserPlus } from 'react-icons/lu'
import { generatePath, Link as RouterLink } from 'react-router'
import { Routes } from '~routes'
import { useAllGroupMembers, useGroupMembersPage } from '~src/queries/groups'
import { type CollectedMember, MEMBERS_COLLECT_CAP } from '~src/queries/members'
import { memberDisplayName } from '../People/display'
import type { SelectedMember } from '../People/useSelection'

/** Rows per page in a census' list of people. */
export const CENSUS_PAGE_SIZE = 25

// Case- and accent-insensitive, so "nuria" finds "Núria"
const fold = (text?: string) =>
  (text ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase()

/** Whether a member matches a search over their name, email, member number and national ID. */
export const memberMatchesSearch = (member: Partial<CollectedMember>, query: string) => {
  const needle = fold(query.trim())
  if (!needle) return true
  return [member.name, member.surname, member.email, member.memberNumber, member.nationalId]
    .map(fold)
    .some((value) => value.includes(needle))
}

type CensusMembersTableProps = {
  groupId: string
  /** How many people the census has (picks searching in memory, or paging the server) */
  total: number
  /** Rows can be selected to remove them */
  selectable: boolean
  onRemove?: (members: SelectedMember[]) => void
  /** Clears the selection when this changes (after a removal) */
  resetKey?: unknown
  /** Who can't get a voting code, when that's known */
  unreachable?: Set<string>
  /** The code channels the census uses, to say what each of them is missing */
  channels?: string[]
  /** Show only whoever can't get a code */
  onlyUnreachable?: boolean
  onOnlyUnreachableChange?: (only: boolean) => void
  /** Offered when the census is empty */
  onAdd?: () => void
  /** At the end of the toolbar (the download) */
  toolbarEnd?: ReactNode
}

/** What someone who can't get a code is missing, for the codes this census sends. */
const missingText = (t: ReturnType<typeof useTranslation>['t'], channels: string[]) =>
  channels.includes('email') && channels.includes('phone')
    ? t('census_detail.missing.both', { defaultValue: 'No email or mobile' })
    : channels.includes('phone')
      ? t('census_detail.missing.phone', { defaultValue: 'No mobile' })
      : t('census_detail.missing.email', { defaultValue: 'No email' })

/**
 * The people of a census, from its group. Up to 5,000 are loaded once and searched in the browser
 * (the endpoint has no search); bigger censuses are paged from the server, without search.
 */
export const CensusMembersTable = ({
  groupId,
  total,
  selectable,
  onRemove,
  resetKey,
  unreachable,
  channels = ['email'],
  onlyUnreachable = false,
  onOnlyUnreachableChange,
  onAdd,
  toolbarEnd,
}: CensusMembersTableProps) => {
  const { t, i18n } = useTranslation()
  const format = (value: number) => value.toLocaleString(i18n.resolvedLanguage)
  const inMemory = total <= MEMBERS_COLLECT_CAP
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Map<string, SelectedMember>>(() => new Map())

  const all = useAllGroupMembers(groupId, { enabled: inMemory })
  const paged = useGroupMembersPage(groupId, { page, limit: CENSUS_PAGE_SIZE, enabled: !inMemory })

  useEffect(() => setSelected(new Map()), [resetKey, groupId])
  useEffect(() => setPage(1), [query, onlyUnreachable])

  // The filter needs every person in memory: past the limit it isn't offered
  const filtering = inMemory && onlyUnreachable && !!unreachable
  const matching = useMemo(
    () =>
      (all.data?.members ?? []).filter(
        (member) => memberMatchesSearch(member, query) && (!filtering || unreachable!.has(member.id))
      ),
    [all.data, query, filtering, unreachable]
  )
  const unreachableCount = unreachable?.size ?? 0
  const lastPage = inMemory
    ? Math.max(1, Math.ceil(matching.length / CENSUS_PAGE_SIZE))
    : Math.max(1, paged.data?.pagination?.lastPage ?? 1)
  const rows: SelectedMember[] = inMemory
    ? matching.slice((page - 1) * CENSUS_PAGE_SIZE, page * CENSUS_PAGE_SIZE)
    : ((paged.data?.members ?? []).filter((member) => !!member.id) as SelectedMember[])
  const shownTotal = inMemory ? matching.length : (paged.data?.pagination?.totalItems ?? total)
  const loading = inMemory ? all.isLoading : paged.isLoading
  const error = inMemory ? all.error : paged.error

  const pageIds = rows.map((row) => row.id)
  const pageSelected = pageIds.filter((id) => selected.has(id)).length
  const toggle = (members: SelectedMember[], checked: boolean) =>
    setSelected((current) => {
      const next = new Map(current)
      members.forEach((member) => (checked ? next.set(member.id, member) : next.delete(member.id)))
      return next
    })

  return (
    <Stack gap={3}>
      <Flex gap={2} align='center' wrap='wrap'>
        {inMemory ? (
          <InputGroup startElement={<Icon as={LuSearch} color='fg.muted' />} maxW={{ md: '320px' }}>
            <Input
              size='sm'
              fontSize={{ base: 'md', md: 'sm' }}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoComplete='off'
              placeholder={t('census_detail.search', { defaultValue: 'Search by name, email or number' })}
              aria-label={t('census_detail.search', { defaultValue: 'Search by name, email or number' })}
            />
          </InputGroup>
        ) : (
          <Text fontSize='xs' color='fg.muted'>
            {t('census_detail.no_search', {
              defaultValue: 'Search works in censuses of up to {{max}} people. Page through this one instead.',
              max: format(MEMBERS_COLLECT_CAP),
            })}
          </Text>
        )}
        {inMemory && unreachableCount > 0 && (
          <Button
            size='sm'
            variant={onlyUnreachable ? 'solid' : 'outline'}
            colorPalette='orange'
            borderRadius='full'
            aria-pressed={onlyUnreachable}
            onClick={() => onOnlyUnreachableChange?.(!onlyUnreachable)}
          >
            <Icon as={LuCircleAlert} />
            {t('census_detail.filter.unreachable', {
              defaultValue: "Can't get a code · {{count}}",
              count: unreachableCount,
            })}
          </Button>
        )}
        <Box flex='1' />
        {toolbarEnd}
      </Flex>

      {selectable && selected.size > 0 && (
        <Flex
          align='center'
          justify='space-between'
          gap={3}
          px={3}
          h={10}
          borderRadius='md'
          bg='bg.muted'
          role='status'
        >
          <Text fontSize='sm' fontVariantNumeric='tabular-nums'>
            {t('census_detail.selected', {
              count: selected.size,
              formattedCount: format(selected.size),
              defaultValue_one: '1 selected',
              defaultValue_other: '{{formattedCount}} selected',
            })}
          </Text>
          <Flex gap={2}>
            <Button size='xs' variant='ghost' colorPalette='gray' onClick={() => setSelected(new Map())}>
              {t('census_detail.clear', { defaultValue: 'Clear' })}
            </Button>
            <Button size='xs' variant='outline' colorPalette='red' onClick={() => onRemove?.([...selected.values()])}>
              <Icon as={LuUserMinus} />
              {t('census_detail.remove_button', { defaultValue: 'Remove…' })}
            </Button>
          </Flex>
        </Flex>
      )}

      <Box border='1px solid' borderColor='border' borderRadius='md' overflow='hidden'>
        {error ? (
          <Text fontSize='sm' color='fg.error' p={4}>
            {t('census_detail.load_error', { defaultValue: "We couldn't load the people in this census." })}
          </Text>
        ) : loading ? (
          <Stack gap={2} p={4} aria-busy>
            <Skeleton h={6} />
            <Skeleton h={6} />
            <Skeleton h={6} />
            {all.progress && all.progress.total > 0 && (
              <Text fontSize='xs' color='fg.muted' fontVariantNumeric='tabular-nums'>
                {t('census_detail.loading', {
                  defaultValue: 'Loading {{done}} of {{total}}…',
                  done: format(all.progress.collected),
                  total: format(all.progress.total),
                })}
              </Text>
            )}
          </Stack>
        ) : rows.length === 0 ? (
          <Stack align='center' gap={3} p={8} textAlign='center'>
            <Text fontSize='sm' color='fg.muted'>
              {filtering
                ? t('census_detail.no_unreachable', { defaultValue: 'Everyone left can get a code.' })
                : query
                  ? t('census_detail.no_match', { defaultValue: 'Nobody in this census matches your search.' })
                  : t('census_detail.empty', { defaultValue: 'Nobody is in this census yet.' })}
            </Text>
            {!query && !filtering && onAdd && (
              <Button size='sm' onClick={onAdd}>
                <Icon as={LuUserPlus} />
                {t('census_detail.add.button', { defaultValue: 'Add people' })}
              </Button>
            )}
          </Stack>
        ) : (
          <Table.ScrollArea>
            <Table.Root size='sm' opacity={!inMemory && paged.isPlaceholderData ? 0.6 : 1}>
              <Table.Caption srOnly>
                {t('census_detail.caption', {
                  defaultValue: 'People in this census, page {{page}} of {{pages}}',
                  page,
                  pages: lastPage,
                })}
              </Table.Caption>
              <Table.Header>
                <Table.Row bg='bg.subtle'>
                  {selectable && (
                    <Table.ColumnHeader w='1%'>
                      <Checkbox.Root
                        size='sm'
                        checked={pageSelected === rows.length ? true : pageSelected ? 'indeterminate' : false}
                        onCheckedChange={({ checked }) => toggle(rows, checked === true)}
                        aria-label={t('census_detail.select_page', { defaultValue: 'Select everyone on this page' })}
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                      </Checkbox.Root>
                    </Table.ColumnHeader>
                  )}
                  <Table.ColumnHeader>{t('census_detail.column.name', { defaultValue: 'Name' })}</Table.ColumnHeader>
                  <Table.ColumnHeader hideBelow='md'>
                    {t('census_detail.column.email', { defaultValue: 'Email' })}
                  </Table.ColumnHeader>
                  <Table.ColumnHeader hideBelow='sm' w='1%' whiteSpace='nowrap'>
                    {t('census_detail.column.member_number', { defaultValue: 'Member number' })}
                  </Table.ColumnHeader>
                  {unreachableCount > 0 && (
                    <Table.ColumnHeader w='1%' whiteSpace='nowrap'>
                      <Box srOnly>{t('census_detail.column.code', { defaultValue: 'Can get a code' })}</Box>
                    </Table.ColumnHeader>
                  )}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {rows.map((member) => {
                  const name = memberDisplayName(member)
                  const isSelected = selected.has(member.id)
                  return (
                    <Table.Row key={member.id} bg={isSelected ? 'bg.muted' : undefined}>
                      {selectable && (
                        <Table.Cell boxShadow={isSelected ? 'inset 2px 0 0 {colors.colorPalette.solid}' : undefined}>
                          <Checkbox.Root
                            size='sm'
                            checked={isSelected}
                            onCheckedChange={({ checked }) => toggle([member], checked === true)}
                            aria-label={t('census_detail.select_person', {
                              defaultValue: 'Select {{name}}',
                              name,
                            })}
                          >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control />
                          </Checkbox.Root>
                        </Table.Cell>
                      )}
                      {/* ph-no-capture: member data is never recorded in session replays */}
                      <Table.Cell className='ph-no-capture' maxW='0' w={{ md: '40%' }}>
                        <Text fontSize='sm' truncate>
                          {name}
                        </Text>
                        <Text fontSize='xs' color='fg.muted' truncate hideFrom='md'>
                          {member.email}
                        </Text>
                      </Table.Cell>
                      <Table.Cell className='ph-no-capture' hideBelow='md' maxW='0'>
                        <Text fontSize='sm' truncate>
                          {member.email}
                        </Text>
                      </Table.Cell>
                      <Table.Cell
                        className='ph-no-capture'
                        hideBelow='sm'
                        fontVariantNumeric='tabular-nums'
                        whiteSpace='nowrap'
                      >
                        {member.memberNumber}
                      </Table.Cell>
                      {unreachableCount > 0 && (
                        <Table.Cell whiteSpace='nowrap' textAlign='end'>
                          {unreachable?.has(member.id) && (
                            <Flex gap={2} align='center' justify='flex-end' fontSize='xs'>
                              <Flex align='center' gap={1} color='fg.warning'>
                                <Icon as={LuCircleAlert} boxSize={3} aria-hidden />
                                <Text as='span' fontSize='xs'>
                                  {missingText(t, channels)}
                                </Text>
                              </Flex>
                              {/* Their details are fixed where every member's are: their drawer in People */}
                              <Link asChild fontSize='xs' textDecoration='underline'>
                                <RouterLink
                                  to={{
                                    pathname: generatePath(Routes.dashboard.memberbase.members, { page: '1' }),
                                    search: `?member=${encodeURIComponent(member.id)}`,
                                  }}
                                >
                                  {t('census_detail.add_detail', { defaultValue: 'Add one' })}
                                </RouterLink>
                              </Link>
                            </Flex>
                          )}
                        </Table.Cell>
                      )}
                    </Table.Row>
                  )
                })}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
        )}
        {!loading && !error && rows.length > 0 && (
          <Flex
            align='center'
            justify='space-between'
            gap={3}
            px={4}
            py={2}
            borderTopWidth='1px'
            borderColor='border'
            wrap='wrap'
          >
            <Text fontSize='xs' color='fg.muted' fontVariantNumeric='tabular-nums'>
              {t('census_detail.range', {
                defaultValue: '{{from}}–{{to}} of {{total}}',
                from: format((page - 1) * CENSUS_PAGE_SIZE + 1),
                to: format((page - 1) * CENSUS_PAGE_SIZE + rows.length),
                total: format(shownTotal),
              })}
            </Text>
            <Flex align='center' gap={2}>
              <Text fontSize='xs' fontVariantNumeric='tabular-nums'>
                {t('pagination.page_out_of', { defaultValue: 'Page {{page}} of {{total}}', page, total: lastPage })}
              </Text>
              <IconButton
                size='xs'
                variant='outline'
                aria-label={t('pagination.previous', { defaultValue: 'Previous page' })}
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <LuChevronLeft />
              </IconButton>
              <IconButton
                size='xs'
                variant='outline'
                aria-label={t('pagination.next', { defaultValue: 'Next page' })}
                disabled={page >= lastPage}
                onClick={() => setPage(page + 1)}
              >
                <LuChevronRight />
              </IconButton>
            </Flex>
          </Flex>
        )}
      </Box>
    </Stack>
  )
}
