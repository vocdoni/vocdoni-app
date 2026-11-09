import { Box, Button, Checkbox, Icon, Link, Table, Text } from '@chakra-ui/react'
import type { MouseEvent, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { LuArrowDown, LuArrowUp, LuArrowUpDown } from 'react-icons/lu'
import { Link as RouterLink, type To } from 'react-router'
import { MaskedValue } from '~components/ui/MaskedValue'
import type { MemberField, MemberFieldId, MemberSortField } from '../fields'
import { memberDisplayName } from './display'
import type { SortOrder } from './urlState'
import type { Selection, SelectedMember } from './useSelection'

/** Columns that stay in the compact table (md to lg) besides the name. */
const COMPACT_COLUMNS: readonly MemberFieldId[] = ['memberNumber']

type MemberNameLinkProps = {
  member: SelectedMember
  label: string
  to: To
  onOpen: (id: string) => void
  children?: ReactNode
  fontSize?: string
}

/** The member's name, as a link that opens their drawer (a real href, so it can open in a new tab). */
export const MemberNameLink = ({ member, label, to, onOpen, fontSize = 'sm' }: MemberNameLinkProps) => {
  const { t } = useTranslation()
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
    event.preventDefault()
    onOpen(member.id)
  }

  return (
    <Link
      asChild
      variant='plain'
      fontWeight='bolder'
      fontSize={fontSize}
      textDecoration='none'
      color='fg'
      display='block'
      maxW='full'
      truncate
    >
      <RouterLink to={to} onClick={onClick} data-member-link={member.id} title={label || undefined}>
        {label || t('members.people.unnamed', { defaultValue: 'No name' })}
      </RouterLink>
    </Link>
  )
}

/** One member value as the table shows it: masked, "On file", or as is. */
export const MemberValue = ({ field, member }: { field: MemberField; member: SelectedMember }) => {
  const raw = member[field.id as keyof SelectedMember] as string | undefined
  const display = field.mask(raw)
  if (display.kind === 'empty') return null
  if (display.kind === 'masked') return <MaskedValue label={field.label} tail={display.tail} />
  const text = field.format(raw)
  // A long email shouldn't widen every row: cut, with the whole value on hover
  return (
    <Text as='span' display='block' fontSize='inherit' truncate title={text}>
      {text}
    </Text>
  )
}

/** The widest a text column gets before its values are cut ("…", whole value on hover). */
const VALUE_MAX_W = '16rem'

/**
 * The checkbox and name columns stay in place while the rest scrolls sideways, so a wide row is
 * still readable. Each pinned cell paints its own background, or the scrolled cells would show
 * through it.
 */
const pinned = (left: string, bg = 'bg') => ({ position: 'sticky', left, zIndex: 1, bg }) as const

type SortHeaderProps = {
  field: MemberSortField
  label: string
  /** Name sorts by first name or surname, both shown in the one column */
  active: boolean
  order: SortOrder
  onSort: (field: MemberSortField, order: SortOrder) => void
}

const SortHeaderButton = ({ field, label, active, order, onSort }: SortHeaderProps) => (
  <Button
    variant='plain'
    size='xs'
    px={0}
    h='auto'
    fontSize='xs'
    fontWeight='bold'
    color='inherit'
    onClick={() => onSort(field, active && order === 'asc' ? 'desc' : 'asc')}
  >
    {label}
    <Icon
      as={active ? (order === 'asc' ? LuArrowUp : LuArrowDown) : LuArrowUpDown}
      boxSize={3}
      color={active ? 'fg' : 'fg.muted'}
      aria-hidden
    />
  </Button>
)

const ariaSort = (active: boolean, order: SortOrder) =>
  active ? (order === 'asc' ? 'ascending' : 'descending') : 'none'

type PeopleTableProps = {
  members: SelectedMember[]
  /** The optional columns to show, in order (not the name) */
  columns: MemberField[]
  fields: MemberField[]
  sortedBy: MemberSortField
  order: SortOrder
  onSort: (field: MemberSortField, order: SortOrder) => void
  selection: Selection
  /** The open member, highlighted */
  activeId?: string | null
  memberLocation: (id: string) => To
  onOpen: (id: string) => void
  renderRowMenu: (member: SelectedMember, name: string) => ReactNode
  /** Read out before the table: "Members, sorted by surname, page 3 of 70" */
  caption: string
  /** Rows of the last page stay on screen, dimmed, while the next one loads */
  dimmed?: boolean
  /** Shown in place of the rows (no results, error) */
  empty?: ReactNode
}

/**
 * The member list from md up. From md to lg it's compact (name with the email under it, member
 * number, actions); from lg it shows every column the admin keeps. Responsive by CSS only, so the
 * server and the client render the same thing.
 */
export const PeopleTable = ({
  members,
  columns,
  fields,
  sortedBy,
  order,
  onSort,
  selection,
  activeId,
  memberLocation,
  onOpen,
  renderRowMenu,
  caption,
  dimmed,
  empty,
}: PeopleTableProps) => {
  const { t } = useTranslation()
  const pageIds = members.map((member) => member.id)
  const pageState = selection.pageState(pageIds)
  const surnameFirst = sortedBy === 'surname'
  const nameActive = sortedBy === 'name' || sortedBy === 'surname'
  const nameLabel = surnameFirst
    ? t('members.people.column_name_surname_first', { defaultValue: 'Name (surname first)' })
    : t('members.people.column_name', { defaultValue: 'Name' })
  const sortable = new Set(fields.filter((field) => field.sortable).map((field) => field.id))
  const headerProps = { h: '36px', py: 0, fontSize: 'xs', fontWeight: 'bold', color: 'fg.muted' } as const

  return (
    <Table.ScrollArea>
      <Table.Root size='md' opacity={dimmed ? 0.6 : 1} transition='opacity 0.2s' _motionReduce={{ transition: 'none' }}>
        <Table.Caption srOnly>{caption}</Table.Caption>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader {...headerProps} w='44px' minW='44px' {...pinned('0')}>
              <Checkbox.Root
                size='sm'
                checked={pageState.all ? true : pageState.some ? 'indeterminate' : false}
                onCheckedChange={({ checked }) => selection.setMany(members, checked === true)}
                aria-label={t('members.people.select_page', { defaultValue: 'Select everyone on this page' })}
                disabled={!members.length}
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
              </Checkbox.Root>
            </Table.ColumnHeader>
            <Table.ColumnHeader {...headerProps} aria-sort={ariaSort(nameActive, order)} {...pinned('44px')}>
              <SortHeaderButton
                field={surnameFirst ? 'surname' : 'name'}
                label={nameLabel}
                active={nameActive}
                order={order}
                onSort={onSort}
              />
            </Table.ColumnHeader>
            {columns.map((field) => {
              const isSortable = sortable.has(field.id)
              const active = sortedBy === field.id
              return (
                <Table.ColumnHeader
                  key={field.id}
                  {...headerProps}
                  hideBelow={COMPACT_COLUMNS.includes(field.id) ? undefined : 'lg'}
                  aria-sort={isSortable ? ariaSort(active, order) : undefined}
                >
                  {isSortable ? (
                    <SortHeaderButton
                      field={field.id as MemberSortField}
                      label={field.label}
                      active={active}
                      order={order}
                      onSort={onSort}
                    />
                  ) : (
                    field.label
                  )}
                </Table.ColumnHeader>
              )
            })}
            <Table.ColumnHeader {...headerProps} w='48px'>
              <Box srOnly>{t('members.people.column_actions', { defaultValue: 'Actions' })}</Box>
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {empty ? (
            <Table.Row>
              <Table.Cell colSpan={columns.length + 3}>{empty}</Table.Cell>
            </Table.Row>
          ) : (
            members.map((member) => {
              const name = memberDisplayName(member, surnameFirst)
              const selected = selection.isSelected(member.id)
              const rowBg = selected || activeId === member.id ? 'bg.muted' : 'bg'
              return (
                <Table.Row
                  key={member.id}
                  h={{ md: '56px', lg: '44px' }}
                  bg={rowBg}
                  data-member-row={member.id}
                  data-selected={selected ? '' : undefined}
                  aria-current={activeId === member.id ? 'true' : undefined}
                >
                  <Table.Cell
                    py={0}
                    boxShadow={selected ? 'inset 2px 0 0 {colors.colorPalette.solid}' : undefined}
                    className='ph-no-capture'
                    {...pinned('0', rowBg)}
                  >
                    <Checkbox.Root
                      size='sm'
                      checked={selected}
                      onClick={(event: MouseEvent) => {
                        // Shift+click picks the whole range since the last row toggled
                        if (!event.shiftKey) return
                        event.preventDefault()
                        selection.toggle(member, !selected, { shiftKey: true, range: members })
                      }}
                      onCheckedChange={({ checked }) => selection.toggle(member, checked === true)}
                      aria-label={t('members.table.select_member', { defaultValue: 'Select {{name}}', name })}
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                    </Checkbox.Root>
                  </Table.Cell>
                  {/* ph-no-capture: member data is never recorded in session replays */}
                  <Table.Cell py={0} className='ph-no-capture' maxW={VALUE_MAX_W} {...pinned('44px', rowBg)}>
                    <MemberNameLink member={member} label={name} to={memberLocation(member.id)} onOpen={onOpen} />
                    {member.email && (
                      <Text hideFrom='lg' fontSize='xs' color='fg.muted' truncate>
                        {member.email}
                      </Text>
                    )}
                  </Table.Cell>
                  {columns.map((field) => (
                    <Table.Cell
                      key={field.id}
                      py={0}
                      className='ph-no-capture'
                      hideBelow={COMPACT_COLUMNS.includes(field.id) ? undefined : 'lg'}
                      fontVariantNumeric={
                        field.id === 'memberNumber' || field.id === 'weight' ? 'tabular-nums' : undefined
                      }
                      color={field.id === 'phone' ? 'fg.muted' : undefined}
                      maxW={VALUE_MAX_W}
                      whiteSpace='nowrap'
                    >
                      <MemberValue field={field} member={member} />
                    </Table.Cell>
                  ))}
                  {/* ph-no-capture: the menu button's name carries the member's */}
                  <Table.Cell py={0} textAlign='end' className='ph-no-capture'>
                    {renderRowMenu(member, name)}
                  </Table.Cell>
                </Table.Row>
              )
            })
          )}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  )
}
