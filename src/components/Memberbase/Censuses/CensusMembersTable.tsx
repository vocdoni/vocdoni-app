import {
  Box,
  Button,
  Checkbox,
  Flex,
  Icon,
  IconButton,
  Input,
  InputGroup,
  Skeleton,
  Stack,
  Table,
  Text,
} from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuChevronLeft, LuChevronRight, LuSearch, LuUserMinus } from 'react-icons/lu'
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
}

/**
 * The people of a census, from its group. Up to 5,000 are loaded once and searched in the browser
 * (the endpoint has no search); bigger censuses are paged from the server, without search.
 */
export const CensusMembersTable = ({ groupId, total, selectable, onRemove, resetKey }: CensusMembersTableProps) => {
  const { t, i18n } = useTranslation()
  const format = (value: number) => value.toLocaleString(i18n.resolvedLanguage)
  const inMemory = total <= MEMBERS_COLLECT_CAP
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Map<string, SelectedMember>>(() => new Map())

  const all = useAllGroupMembers(groupId, { enabled: inMemory })
  const paged = useGroupMembersPage(groupId, { page, limit: CENSUS_PAGE_SIZE, enabled: !inMemory })

  useEffect(() => setSelected(new Map()), [resetKey, groupId])
  useEffect(() => setPage(1), [query])

  const matching = useMemo(
    () => (all.data?.members ?? []).filter((member) => memberMatchesSearch(member, query)),
    [all.data, query]
  )
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
      {inMemory ? (
        <InputGroup startElement={<Icon as={LuSearch} color='fg.muted' />} maxW={{ md: '360px' }}>
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

      {selectable && (
        // Always there, one height: selecting doesn't push the table down
        <Flex
          align='center'
          justify='space-between'
          gap={3}
          px={3}
          h={10}
          borderRadius='md'
          bg={selected.size ? 'bg.muted' : undefined}
          role='status'
        >
          {selected.size ? (
            <>
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
                <Button
                  size='xs'
                  variant='outline'
                  colorPalette='red'
                  onClick={() => onRemove?.([...selected.values()])}
                >
                  <Icon as={LuUserMinus} />
                  {t('census_detail.remove', { defaultValue: 'Remove…' })}
                </Button>
              </Flex>
            </>
          ) : (
            <Text fontSize='sm' color='fg.muted'>
              {t('census_detail.select_hint', { defaultValue: 'Select people to remove them from this census.' })}
            </Text>
          )}
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
          <Text fontSize='sm' color='fg.muted' p={6} textAlign='center'>
            {query
              ? t('census_detail.no_match', { defaultValue: 'Nobody in this census matches your search.' })
              : t('census_detail.empty', { defaultValue: 'Nobody is in this census yet.' })}
          </Text>
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
