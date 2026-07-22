import {
  Badge,
  Box,
  chakra,
  HStack,
  Icon,
  Input,
  InputGroup,
  Spinner,
  Text,
  TooltipContent,
  TooltipPositioner,
  TooltipRoot,
  TooltipTrigger,
} from '@chakra-ui/react'
import { useElection } from '@vocdoni/react-components'
import { TFunction } from 'i18next'
import { useEffect, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { LuCircleHelp, LuSearch } from 'react-icons/lu'
import { getApiErrorMessage } from '~components/Auth/api'
import { SidebarSubtitle } from '~components/Dashboard/Contents'
import { Select } from '~components/Form/Select'
import {
  isParticipantLookupField,
  ProcessParticipantEntry,
  ProcessParticipantLookupField,
  useProcessParticipants,
} from '~queries/participants'

// Maps a census credential field to a human label. Unknown fields fall back to their raw key.
const fieldLabel = (t: TFunction, field: string) => {
  switch (field) {
    case 'name':
      return t('census.search.field.name', { defaultValue: 'Name' })
    case 'surname':
      return t('census.search.field.surname', { defaultValue: 'Surname' })
    case 'email':
      return t('census.search.field.email', { defaultValue: 'Email' })
    case 'phone':
      return t('census.search.field.phone', { defaultValue: 'Phone' })
    case 'memberNumber':
      return t('census.search.field.member_number', { defaultValue: 'Member number' })
    case 'nationalId':
      return t('census.search.field.national_id', { defaultValue: 'National ID' })
    case 'birthDate':
      return t('census.search.field.birth_date', { defaultValue: 'Birth date' })
    default:
      return field
  }
}

// Shows the value of the searched credential next to the name. The response only carries a subset of
// member fields, so credentials not present in it (e.g. phone, nationalId) fall back to the typed value.
const valueForField = (participant: ProcessParticipantEntry, field: string, fallback: string) => {
  switch (field) {
    case 'email':
      return participant.email ?? fallback
    case 'memberNumber':
      return participant.memberNumber ?? fallback
    default:
      return fallback
  }
}

// The credentials voters authenticate with (census.authFields/twoFaFields) drive the search-field
// options, intersected with the fields the admin lookup endpoint can actually query by (it rejects
// name/surname/birthDate). The auth-dependent lookup lives in the inner panel so it only runs once
// the section is actually shown.
export const CensusSearch = () => {
  const { election } = useElection()
  const processID = election?.id

  const options = useMemo(() => {
    const fields = [...(election?.census?.authFields ?? []), ...(election?.census?.twoFaFields ?? [])]
    return Array.from(new Set(fields)).filter(isParticipantLookupField)
  }, [election?.census])

  if (!processID || options.length === 0) return null

  return <CensusSearchPanel processID={processID} options={options} />
}

// Voted status across the process's questions: each question is its own on-chain election, so a
// voter may have cast some questions and not others. A single question renders a plain
// Voted/Not voted badge; multi-question processes show the voted fraction when it's partial.
const VotedBadge = ({ participant }: { participant: ProcessParticipantEntry }) => {
  const { t } = useTranslation()

  const total = participant.questions.length
  const voted = participant.questions.filter((question) => question.hasVoted).length

  if (voted > 0 && voted < total) {
    return (
      <Badge colorPalette='orange' flexShrink={0}>
        {t('census.search.voted_partial', { defaultValue: 'Voted {{voted}}/{{total}}', voted, total })}
      </Badge>
    )
  }

  const hasVoted = total > 0 && voted === total
  return (
    <Badge colorPalette={hasVoted ? 'green' : 'gray'} flexShrink={0}>
      {hasVoted
        ? t('census.search.voted', { defaultValue: 'Voted' })
        : t('census.search.not_voted', { defaultValue: 'Not voted' })}
    </Badge>
  )
}

type CensusSearchPanelProps = {
  processID: string
  options: ProcessParticipantLookupField[]
}

const CensusSearchPanel = ({ processID, options }: CensusSearchPanelProps) => {
  const { t } = useTranslation()

  const [fieldName, setFieldName] = useState<ProcessParticipantLookupField | null>(null)
  const selectedField = fieldName && options.includes(fieldName) ? fieldName : options[0]

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(timer)
  }, [search])

  const { data, error, isError, isLoading } = useProcessParticipants({
    processId: processID,
    field: selectedField,
    value: debouncedSearch,
  })

  const hasSearch = debouncedSearch.trim().length > 0
  const participants = hasSearch ? (data ?? []) : []

  const fieldOptions = options.map((field) => ({ label: fieldLabel(t, field), value: field }))
  const selectedOption = fieldOptions.find((option) => option.value === selectedField) ?? null

  const memberbaseNote = t('census.search.memberbase_note', {
    defaultValue:
      'These results are based on your current Memberbase. If members are added, removed, or updated, these results may no longer be accurate.',
  })

  return (
    // pt mirrors the sidebar-subtitle's top padding for separation from the section above; the subtitle's
    // own py is zeroed so the title→description gap matches the uniform gap between the other items.
    <Box display='flex' flexDirection='column' gap={3} pt={4}>
      <HStack gap={1} alignItems='center'>
        <SidebarSubtitle py={0}>
          <Trans i18nKey='census.search.title'>Check participants</Trans>
        </SidebarSubtitle>
        <TooltipRoot positioning={{ placement: 'top' }}>
          <TooltipTrigger asChild>
            <chakra.span display='inline-flex' alignItems='center' cursor='default' color='fg.muted' opacity={0.5}>
              <Icon as={LuCircleHelp} boxSize={3} />
            </chakra.span>
          </TooltipTrigger>
          <TooltipPositioner>
            <TooltipContent maxW='16rem'>{memberbaseNote}</TooltipContent>
          </TooltipPositioner>
        </TooltipRoot>
      </HStack>
      <Text fontSize='sm' color='texts.subtle'>
        <Trans i18nKey='census.search.description'>
          Look up a voter by their credentials to check whether they are in the census and if they have already voted.
        </Trans>
      </Text>
      {/* menuPosition='fixed' + a high menuPortal z-index keep the dropdown above the sidebar
                (position: absolute, z-index 10), matching the pattern in SaasSelector. */}
      <Select
        size='sm'
        isSearchable={false}
        isClearable={false}
        menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
        menuPosition='fixed'
        styles={{ menuPortal: (base) => ({ ...base, zIndex: 1600 }) }}
        options={fieldOptions}
        value={selectedOption}
        onChange={(option: { value: ProcessParticipantLookupField } | null) => option && setFieldName(option.value)}
        aria-label={t('census.search.field_selector', { defaultValue: 'Search field' })}
      />
      <InputGroup endElement={<Icon as={LuSearch} color='fg.muted' />}>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('census.search.placeholder', { defaultValue: 'Search census…' })}
          aria-label={t('census.search.placeholder', { defaultValue: 'Search census…' })}
        />
      </InputGroup>

      {hasSearch && (
        <Box>
          {isError ? (
            <Text fontSize='sm' color='red.500'>
              {getApiErrorMessage(error) ?? t('census.search.error', { defaultValue: 'Could not search the census.' })}
            </Text>
          ) : isLoading && !data ? (
            <HStack gap={2}>
              <Spinner size='sm' />
              <Text fontSize='sm' color='texts.subtle'>
                <Trans i18nKey='census.search.loading'>Searching census…</Trans>
              </Text>
            </HStack>
          ) : participants.length === 0 ? (
            <Text fontSize='sm' color='texts.subtle'>
              <Trans i18nKey='census.search.no_results'>
                There is no one in the census matching those credentials.
              </Trans>
            </Text>
          ) : (
            <Box maxH='240px' overflowY='auto' display='flex' flexDirection='column' gap={3}>
              {participants.map((participant) => (
                <Box
                  key={participant.memberId}
                  display='flex'
                  justifyContent='space-between'
                  alignItems='center'
                  gap={2}
                >
                  <Box minW={0}>
                    <Text fontSize='sm' fontWeight='bold' truncate>
                      {[participant.name, participant.surname].filter(Boolean).join(' ')}
                    </Text>
                    <Text fontSize='sm' color='texts.subtle' truncate>
                      {valueForField(participant, selectedField, debouncedSearch.trim())}
                    </Text>
                  </Box>
                  <VotedBadge participant={participant} />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}
