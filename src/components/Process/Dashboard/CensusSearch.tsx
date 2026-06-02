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
import { CensusType, PublishedElection } from '@vocdoni/sdk'
import { TFunction } from 'i18next'
import { useEffect, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { LuCircleHelp, LuSearch } from 'react-icons/lu'
import { getApiErrorMessage } from '~components/Auth/api'
import { SidebarSubtitle } from '~components/Dashboard/Contents'
import { Select } from '~components/Form/Select'
import { useCensusBundle } from '~queries/bundle'
import { CensusParticipant, useParticipantsCheck } from '~queries/participants'

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
const valueForField = (participant: CensusParticipant, field: string, fallback: string) => {
  switch (field) {
    case 'name':
      return participant.name
    case 'surname':
      return participant.surname
    case 'email':
      return participant.email
    case 'memberNumber':
      return participant.memberNumber
    default:
      return fallback
  }
}

// Gate: only CSP/bundle censuses can be searched. The bundle (fetched from the census URI) confirms the
// census is bundle-backed, yields the bundleId, and lists the credentials voters authenticate with, which
// drive the search-field options. The auth-dependent lookup lives in the inner panel so it only runs once
// the section is actually shown.
export const CensusSearch = () => {
  const { election } = useElection()

  const isCsp = election instanceof PublishedElection && election.census.type === CensusType.CSP
  const censusURI = isCsp ? election.census.censusURI : undefined
  const processID = election instanceof PublishedElection ? election.id : undefined

  const { data: bundle, isError: bundleError } = useCensusBundle(censusURI)

  // The credentials voters use to authenticate in this process are the fields we can search by.
  const options = useMemo(() => {
    const fields = [...(bundle?.census.authFields ?? []), ...(bundle?.census.twoFaFields ?? [])]
    return Array.from(new Set(fields))
  }, [bundle])

  if (!isCsp || bundleError || !bundle || !processID || options.length === 0) return null

  return <CensusSearchPanel bundleId={bundle.id} processID={processID} options={options} />
}

type CensusSearchPanelProps = {
  bundleId: string
  processID: string
  options: string[]
}

const CensusSearchPanel = ({ bundleId, processID, options }: CensusSearchPanelProps) => {
  const { t } = useTranslation()

  const [fieldName, setFieldName] = useState<string | null>(null)
  const selectedField = fieldName && options.includes(fieldName) ? fieldName : options[0]

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(timer)
  }, [search])

  const { data, error, isError, isLoading } = useParticipantsCheck({
    bundleId,
    processID,
    fieldName: selectedField,
    value: debouncedSearch,
  })

  const hasSearch = debouncedSearch.trim().length > 0
  const participants = hasSearch ? (data?.participants ?? []) : []

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
        onChange={(option: { value: string } | null) => option && setFieldName(option.value)}
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
                  <Badge colorPalette={participant.hasVoted ? 'green' : 'gray'} flexShrink={0}>
                    {participant.hasVoted
                      ? t('census.search.voted', { defaultValue: 'Voted' })
                      : t('census.search.not_voted', { defaultValue: 'Not voted' })}
                  </Badge>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}
