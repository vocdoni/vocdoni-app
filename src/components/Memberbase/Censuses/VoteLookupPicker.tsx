import {
  Badge,
  Box,
  Button,
  Checkbox,
  Flex,
  Icon,
  NativeSelect,
  Skeleton,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react'
import { useQueries } from '@tanstack/react-query'
import type { VotingProcessResponse } from '@vocdoni/api-types'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuSearch } from 'react-icons/lu'
import {
  lookupFieldLabel,
  lookupFieldsOf,
  MAX_LOOKUPS,
  splitLookupValues,
} from '~components/Process/Dashboard/View/VoterLookup'
import { QueryKeys } from '~src/queries/keys'
import type { ProcessParticipantLookupField } from '~src/queries/participants'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { memberDisplayName } from '../People/display'
import type { SelectedMember } from '../People/useSelection'

type VoteLookupPickerProps = {
  process: VotingProcessResponse
  selected: Map<string, SelectedMember>
  onChange: (selected: Map<string, SelectedMember>) => void
}

/**
 * Finds people in a vote whose census isn't kept as a list: paste up to 20 emails, member numbers or
 * national IDs (whichever the vote signs in with) and tick who to take out. Everyone found is in the
 * vote, so "Add them back" can undo it exactly.
 */
export const VoteLookupPicker = ({ process, selected, onChange }: VoteLookupPickerProps) => {
  const { t } = useTranslation()
  const { client } = useApiClient()
  const options = lookupFieldsOf(process.census)
  const [field, setField] = useState<ProcessParticipantLookupField | undefined>(options[0])
  const [input, setInput] = useState('')
  const [submitted, setSubmitted] = useState<string[]>([])
  const selectedField = field && options.includes(field) ? field : options[0]

  const lookups = useQueries({
    queries: submitted.map((value) => ({
      queryKey: QueryKeys.process.participants(process.id, selectedField, value),
      queryFn: async () =>
        (await client.elections.participants(process.id, { field: selectedField, value })).participants,
      enabled: !!selectedField,
      retry: false,
      staleTime: 30_000,
    })),
  })

  // Tick everyone a lookup finds: they were pasted to be removed
  const found = lookups.flatMap((lookup) => lookup.data ?? [])
  const foundKey = found.map((participant) => participant.memberId).join(',')
  useEffect(() => {
    if (!found.length) return
    const next = new Map(selected)
    let changed = false
    found.forEach((participant) => {
      if (next.has(participant.memberId)) return
      next.set(participant.memberId, {
        id: participant.memberId,
        name: participant.name,
        surname: participant.surname,
      } as SelectedMember)
      changed = true
    })
    if (changed) onChange(next)
    // Only when new results arrive, not on every tick or untick
  }, [foundKey])

  if (!selectedField) return null

  const toggle = (person: SelectedMember, checked: boolean) => {
    const next = new Map(selected)
    if (checked) next.set(person.id, person)
    else next.delete(person.id)
    onChange(next)
  }

  return (
    <Stack gap={3}>
      <Flex gap={2} direction={{ base: 'column', sm: 'row' }} align={{ sm: 'flex-start' }}>
        {options.length > 1 && (
          <NativeSelect.Root size='sm' width={{ base: 'full', sm: '10rem' }}>
            <NativeSelect.Field
              value={selectedField}
              onChange={(event) => setField(event.target.value as ProcessParticipantLookupField)}
              aria-label={t('census.search.field_selector', { defaultValue: 'Search field' })}
            >
              {options.map((option) => (
                <option key={option} value={option}>
                  {lookupFieldLabel(t, option)}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        )}
        <Textarea
          size='sm'
          rows={2}
          autoresize
          autoComplete='off'
          fontSize={{ base: 'md', md: 'sm' }}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={t('process_view.lookup.placeholder', {
            defaultValue: 'One or more, separated by commas or new lines',
          })}
          aria-label={t('process_view.lookup.label', {
            defaultValue: '{{field}} to look up',
            field: lookupFieldLabel(t, selectedField),
          })}
        />
        <Button
          size='sm'
          variant='outline'
          colorPalette='gray'
          flexShrink={0}
          onClick={() => setSubmitted(splitLookupValues(input))}
          disabled={!input.trim()}
        >
          <Icon as={LuSearch} />
          {t('census_detail.remove.find', { defaultValue: 'Find' })}
        </Button>
      </Flex>
      <Text fontSize='xs' color='fg.muted'>
        {t('process_view.lookup.limit', { defaultValue: 'Up to {{max}} at a time.', max: MAX_LOOKUPS })}
      </Text>
      {submitted.length > 0 && (
        // ph-no-capture: member values and names
        <Stack gap={0} as='ul' listStyleType='none' m={0} p={0} className='ph-no-capture'>
          {submitted.map((value, index) => {
            const lookup = lookups[index]
            const participants = lookup?.data ?? []
            return (
              <Box as='li' key={value} py={2} borderTop='1px solid' borderColor='border'>
                {lookup?.isLoading ? (
                  <Skeleton h={5} />
                ) : !participants.length ? (
                  <Flex justify='space-between' gap={2}>
                    <Text fontSize='sm' truncate>
                      {value}
                    </Text>
                    <Badge colorPalette='gray' variant='outline' flexShrink={0}>
                      {lookup?.isError
                        ? t('census.search.error', { defaultValue: 'Could not search the census.' })
                        : t('process_view.lookup.not_in_vote', { defaultValue: 'Not in this vote' })}
                    </Badge>
                  </Flex>
                ) : (
                  participants.map((participant) => {
                    const person = {
                      id: participant.memberId,
                      name: participant.name,
                      surname: participant.surname,
                    } as SelectedMember
                    const name = memberDisplayName(person) || value
                    return (
                      <Checkbox.Root
                        key={participant.memberId}
                        checked={selected.has(participant.memberId)}
                        onCheckedChange={({ checked }) => toggle(person, checked === true)}
                        w='full'
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                        <Checkbox.Label flex='1' minW={0}>
                          <Text fontSize='sm' truncate>
                            {name}
                          </Text>
                          <Text fontSize='xs' color='fg.muted' truncate>
                            {value}
                          </Text>
                        </Checkbox.Label>
                      </Checkbox.Root>
                    )
                  })
                )}
              </Box>
            )
          })}
        </Stack>
      )}
    </Stack>
  )
}
