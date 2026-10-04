import {
  Badge,
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
  Text,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuChevronLeft, LuChevronRight, LuSearch } from 'react-icons/lu'
import { usePaginatedMembers } from '~src/queries/members'
import { memberDisplayName } from '../People/display'
import type { SelectedMember } from '../People/useSelection'

const PAGE_SIZE = 20

const useDebounced = (value: string, ms = 300) => {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(timer)
  }, [value, ms])
  return debounced
}

type MemberPickerProps = {
  selected: Map<string, SelectedMember>
  onChange: (selected: Map<string, SelectedMember>) => void
  /** Already in the census: shown ticked and locked */
  existing?: Set<string>
}

/**
 * Picks members to add to (or take out of) a census: search the member list and tick people.
 */
export const MemberPicker = ({ selected, onChange, existing }: MemberPickerProps) => {
  const { t, i18n } = useTranslation()
  const format = (value: number) => value.toLocaleString(i18n.resolvedLanguage)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debounced = useDebounced(search)
  const { data, isLoading, isPlaceholderData } = usePaginatedMembers({
    search: debounced,
    page,
    limit: PAGE_SIZE,
    keepPrevious: true,
  })
  const rows = (data?.members ?? []).filter((member): member is SelectedMember => !!member.id)
  const lastPage = Math.max(1, data?.pagination?.lastPage ?? 1)

  useEffect(() => setPage(1), [debounced])

  const toggle = (people: SelectedMember[], checked: boolean) => {
    const next = new Map(selected)
    people.forEach((member) => {
      if (existing?.has(member.id)) return
      if (checked) next.set(member.id, member)
      else next.delete(member.id)
    })
    onChange(next)
  }

  return (
    <Stack gap={3}>
      <Flex gap={2} direction={{ base: 'column', sm: 'row' }}>
        <InputGroup flex='1' startElement={<Icon as={LuSearch} color='fg.muted' />}>
          <Input
            size='sm'
            fontSize={{ base: 'md', md: 'sm' }}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            autoComplete='off'
            placeholder={t('census_detail.picker.search', { defaultValue: 'Search your members' })}
            aria-label={t('census_detail.picker.search', { defaultValue: 'Search your members' })}
          />
        </InputGroup>
      </Flex>

      <Flex justify='space-between' align='center' minH={6}>
        <Text fontSize='sm' color='fg.muted' fontVariantNumeric='tabular-nums' role='status'>
          {t('census_detail.picker.selected', {
            count: selected.size,
            formattedCount: format(selected.size),
            defaultValue_one: '1 selected',
            defaultValue_other: '{{formattedCount}} selected',
          })}
        </Text>
        {selected.size > 0 && (
          <Button size='xs' variant='ghost' colorPalette='gray' onClick={() => onChange(new Map())}>
            {t('census_detail.clear', { defaultValue: 'Clear' })}
          </Button>
        )}
      </Flex>

      {isLoading ? (
        <Stack gap={2}>
          <Skeleton h={8} />
          <Skeleton h={8} />
          <Skeleton h={8} />
        </Stack>
      ) : rows.length === 0 ? (
        <Text fontSize='sm' color='fg.muted' py={4} textAlign='center'>
          {t('process_view.add_voters.none', { defaultValue: 'No members match your search.' })}
        </Text>
      ) : (
        // ph-no-capture: member names and emails
        <Stack
          as='ul'
          gap={0}
          listStyleType='none'
          m={0}
          p={0}
          className='ph-no-capture'
          opacity={isPlaceholderData ? 0.6 : 1}
        >
          {rows.map((member) => {
            const already = existing?.has(member.id) ?? false
            const name = memberDisplayName(member)
            return (
              <Box as='li' key={member.id} borderBottom='1px solid' borderColor='border'>
                <Checkbox.Root
                  checked={already || selected.has(member.id)}
                  disabled={already}
                  onCheckedChange={({ checked }) => toggle([member], checked === true)}
                  py={2}
                  w='full'
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                  <Checkbox.Label flex='1' minW={0}>
                    <Text fontSize='sm' truncate>
                      {name}
                    </Text>
                    <Text fontSize='xs' color='fg.muted' truncate>
                      {[member.email, member.memberNumber].filter(Boolean).join(' · ')}
                    </Text>
                  </Checkbox.Label>
                  {already && (
                    <Badge size='sm' colorPalette='gray' variant='subtle' flexShrink={0}>
                      {t('census_detail.picker.already_in', { defaultValue: 'Already in' })}
                    </Badge>
                  )}
                </Checkbox.Root>
              </Box>
            )
          })}
        </Stack>
      )}

      {lastPage > 1 && (
        <Flex justify='flex-end' align='center' gap={2}>
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
      )}
    </Stack>
  )
}
