import {
  Checkbox,
  Flex,
  Icon,
  IconButton,
  Input,
  InputGroup,
  Menu,
  NativeSelect,
  Popover,
  Portal,
  Stack,
  Text,
  Button,
} from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuColumns3, LuEllipsis, LuFilter, LuListChecks, LuSearch } from 'react-icons/lu'
import { ComingSoonButton } from '~components/ui/ComingSoon'
import type { MemberField, MemberFieldId, MemberSortField } from '../fields'
import { TOGGLEABLE_COLUMNS } from './useColumnVisibility'
import { SORT_FIELDS, type SortOrder } from './urlState'

export const SEARCH_DEBOUNCE_MS = 300

type SearchBoxProps = {
  value: string
  onSearch: (value: string) => void
}

/** Searches as you type (debounced), or at once on Enter. Follows the URL when it changes elsewhere. */
export const SearchBox = ({ value, onSearch }: SearchBoxProps) => {
  const { t } = useTranslation()
  const [draft, setDraft] = useState(value)
  const applied = useRef(value)

  // Back/forward or a "Clear search" elsewhere: show what the URL says
  useEffect(() => {
    if (value === applied.current) return
    applied.current = value
    setDraft(value)
  }, [value])

  useEffect(() => {
    if (draft === applied.current) return
    const timer = setTimeout(() => {
      applied.current = draft
      onSearch(draft)
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [draft, onSearch])

  return (
    <InputGroup
      as='form'
      role='search'
      maxW={{ md: '360px' }}
      w='full'
      startElement={<Icon as={LuSearch} color='fg.muted' />}
      onSubmit={(event) => {
        event.preventDefault()
        applied.current = draft
        onSearch(draft)
      }}
    >
      <Input
        type='search'
        name='q'
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={t('members.people.search_placeholder', { defaultValue: 'Search name, email or member number' })}
        aria-label={t('members.people.search_label', { defaultValue: 'Search members' })}
        autoComplete='off'
        fontSize={{ base: 'md', md: 'sm' }}
      />
    </InputGroup>
  )
}

type SortSelectProps = {
  sortedBy: MemberSortField
  order: SortOrder
  fields: MemberField[]
  onChange: (field: MemberSortField, order: SortOrder) => void
}

export const SortSelect = ({ sortedBy, order, fields, onChange }: SortSelectProps) => {
  const { t } = useTranslation()
  const labelOf = (id: MemberSortField) => fields.find((field) => field.id === id)?.label ?? id

  return (
    <NativeSelect.Root size='sm' w={{ base: 'full', md: 'auto' }} minW='12rem'>
      <NativeSelect.Field
        aria-label={t('members.people.sort_label', { defaultValue: 'Sort by' })}
        value={`${sortedBy}:${order}`}
        onChange={(event) => {
          const [field, nextOrder] = event.target.value.split(':') as [MemberSortField, SortOrder]
          onChange(field, nextOrder)
        }}
        fontSize={{ base: 'md', md: 'sm' }}
      >
        {SORT_FIELDS.flatMap((field) => [
          <option key={`${field}:asc`} value={`${field}:asc`}>
            {t('members.people.sort_asc', { defaultValue: '{{field}}, A to Z', field: labelOf(field) })}
          </option>,
          <option key={`${field}:desc`} value={`${field}:desc`}>
            {t('members.people.sort_desc', { defaultValue: '{{field}}, Z to A', field: labelOf(field) })}
          </option>,
        ])}
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
  )
}

type ColumnsPopoverProps = {
  fields: MemberField[]
  isVisible: (id: MemberFieldId) => boolean
  setColumn: (id: MemberFieldId, show: boolean) => void
}

export const ColumnsPopover = ({ fields, isVisible, setColumn }: ColumnsPopoverProps) => {
  const { t } = useTranslation()

  return (
    <Popover.Root positioning={{ placement: 'bottom-end' }}>
      <Popover.Trigger asChild>
        <Button size='sm' variant='outline'>
          <Icon as={LuColumns3} />
          {t('members.people.columns', { defaultValue: 'Columns' })}
        </Button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content w='15rem' p={3}>
            <Text fontSize='sm' fontWeight='bolder' mb={2}>
              {t('members.people.columns_title', { defaultValue: 'Show columns' })}
            </Text>
            <Stack gap={2}>
              {TOGGLEABLE_COLUMNS.map((id) => {
                const field = fields.find((entry) => entry.id === id)
                if (!field) return null
                return (
                  <Checkbox.Root
                    key={id}
                    size='sm'
                    checked={isVisible(id)}
                    onCheckedChange={({ checked }) => setColumn(id, checked === true)}
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label fontWeight='normal'>{field.label}</Checkbox.Label>
                  </Checkbox.Root>
                )
              })}
            </Stack>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  )
}

/** The rarely needed, destructive actions, away from the everyday ones. */
export const OverflowMenu = ({ onDeleteAll, disabled }: { onDeleteAll: () => void; disabled?: boolean }) => {
  const { t } = useTranslation()

  return (
    <Menu.Root positioning={{ placement: 'bottom-end' }}>
      <Menu.Trigger asChild>
        <IconButton size='sm' variant='outline' aria-label={t('members.people.more', { defaultValue: 'More actions' })}>
          <LuEllipsis />
        </IconButton>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content minW='200px'>
            <Menu.Item value='delete_all' color='fg.error' disabled={disabled} onSelect={onDeleteAll}>
              {t('members.people.delete_all', { defaultValue: 'Delete all members…' })}
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}

type ShowSelectedChipProps = {
  /** How many are selected; the chip hides at 0 */
  count: number
  pressed: boolean
  onToggle: () => void
}

/** "Show selected (12)": narrows the list to the selection, and back. */
export const ShowSelectedChip = ({ count, pressed, onToggle }: ShowSelectedChipProps) => {
  const { t, i18n } = useTranslation()
  if (!count) return null

  return (
    <Button
      size='sm'
      variant={pressed ? 'subtle' : 'outline'}
      aria-pressed={pressed}
      onClick={onToggle}
      flexShrink={0}
      fontVariantNumeric='tabular-nums'
    >
      <Icon as={LuListChecks} />
      {t('members.selection.show_selected', {
        defaultValue_one: 'Show selected ({{formattedCount}})',
        defaultValue_other: 'Show selected ({{formattedCount}})',
        count,
        formattedCount: count.toLocaleString(i18n.resolvedLanguage),
      })}
    </Button>
  )
}

type ToolbarProps = SearchBoxProps &
  SortSelectProps &
  ColumnsPopoverProps & {
    onDeleteAll: () => void
    canDeleteAll: boolean
    /** The "Show selected" chip; hidden when nobody is selected one by one */
    selected?: ShowSelectedChipProps
    /** Opens "Select from a list…" */
    onPasteSelect?: () => void
  }

export const Toolbar = ({
  value,
  onSearch,
  sortedBy,
  order,
  fields,
  onChange,
  isVisible,
  setColumn,
  onDeleteAll,
  canDeleteAll,
  selected,
  onPasteSelect,
}: ToolbarProps) => {
  const { t } = useTranslation()

  return (
    <Flex gap={2} direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }} mb={3}>
      <Flex gap={2} align='center' flex='1' minW={0}>
        <SearchBox value={value} onSearch={onSearch} />
        {selected && <ShowSelectedChip {...selected} />}
      </Flex>
      <Flex gap={2} align='center' ml={{ md: 'auto' }} wrap='wrap'>
        {onPasteSelect && (
          <Button size='sm' variant='outline' onClick={onPasteSelect}>
            {t('members.paste.open', { defaultValue: 'Select from a list…' })}
          </Button>
        )}
        <SortSelect sortedBy={sortedBy} order={order} fields={fields} onChange={onChange} />
        <Flex hideBelow='lg'>
          <ColumnsPopover fields={fields} isVisible={isVisible} setColumn={setColumn} />
        </Flex>
        <ComingSoonButton
          feature='members_filter'
          surface='people'
          size='sm'
          icon={LuFilter}
          label={t('members.people.filter', { defaultValue: 'Filter' })}
          title={t('members.people.filter_soon_title', { defaultValue: 'Filter your members' })}
          description={t('members.people.filter_soon_description', {
            defaultValue: 'Show only people missing an email or mobile, in a census, or by any extra info you keep.',
          })}
        />
        <OverflowMenu onDeleteAll={onDeleteAll} disabled={!canDeleteAll} />
      </Flex>
    </Flex>
  )
}
