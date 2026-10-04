import { Badge, Box, Button, Flex, Icon, NativeSelect, Skeleton, Stack, Text, Textarea } from '@chakra-ui/react'
import { useQueries } from '@tanstack/react-query'
import { useElection } from '@vocdoni/react-components'
import { TFunction } from 'i18next'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuLock, LuSearch } from 'react-icons/lu'
import { getApiErrorMessage } from '~components/Auth/api'
import { ComingSoonButton } from '~components/ui/ComingSoon'
import { SectionCard as Card } from '~components/ui/SectionCard'
import { QueryKeys } from '~queries/keys'
import {
  isParticipantLookupField,
  type ProcessParticipantEntry,
  type ProcessParticipantLookupField,
} from '~queries/participants'
import { useApiClient } from '~src/providers/ApiClientProvider'

// One request per value; enough for a board or a committee, not a mailing list
export const MAX_LOOKUPS = 20

export const splitLookupValues = (input: string) =>
  Array.from(
    new Set(
      input
        .split(/[\n,;]+/)
        .map((value) => value.trim())
        .filter(Boolean)
    )
  ).slice(0, MAX_LOOKUPS)

const fieldLabel = (t: TFunction, field: ProcessParticipantLookupField) => {
  switch (field) {
    case 'email':
      return t('census.search.field.email', { defaultValue: 'Email' })
    case 'phone':
      return t('census.search.field.phone', { defaultValue: 'Phone' })
    case 'memberNumber':
      return t('census.search.field.member_number', { defaultValue: 'Member number' })
    case 'nationalId':
      return t('census.search.field.national_id', { defaultValue: 'National ID' })
  }
}

// Each question is its own on-chain election, so a voter may have cast some questions and not others
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
        : t('process_view.lookup.not_yet', { defaultValue: 'Not yet' })}
    </Badge>
  )
}

/**
 * "Has someone voted?": look up several members at once by a credential the vote uses, and see
 * whether each has voted. It never shows what anyone chose.
 */
export const VoterLookup = () => {
  const { t } = useTranslation()
  const { client } = useApiClient()
  const { election } = useElection()
  const [field, setField] = useState<ProcessParticipantLookupField | null>(null)
  const [input, setInput] = useState('')
  const [submitted, setSubmitted] = useState<string[]>([])

  const options = useMemo(() => {
    const fields = [...(election?.census?.authFields ?? []), ...(election?.census?.twoFaFields ?? [])]
    return Array.from(new Set(fields)).filter(isParticipantLookupField)
  }, [election?.census])
  const selectedField = field && options.includes(field) ? field : options[0]

  const lookups = useQueries({
    queries: submitted.map((value) => ({
      queryKey: QueryKeys.process.participants(election?.id, selectedField, value),
      queryFn: async () =>
        (await client.elections.participants(election!.id, { field: selectedField, value })).participants,
      enabled: !!election?.id && !!selectedField,
      retry: false,
      staleTime: 30_000,
    })),
  })

  if (!election || !options.length) return null

  const anonymous = election.census?.anonymous

  return (
    <Card title={t('process_view.lookup.title', { defaultValue: 'Has someone voted?' })}>
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
                    {fieldLabel(t, option)}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          )}
          <Textarea
            size='sm'
            rows={1}
            autoresize
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={t('process_view.lookup.placeholder', {
              defaultValue: 'One or more, separated by commas or new lines',
            })}
            aria-label={t('process_view.lookup.label', {
              defaultValue: '{{field}} to look up',
              field: fieldLabel(t, selectedField),
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
            {t('process_view.lookup.check', { defaultValue: 'Check' })}
          </Button>
        </Flex>
        <Text fontSize='xs' color='fg.muted'>
          {t('process_view.lookup.limit', { defaultValue: 'Up to {{max}} at a time.', max: MAX_LOOKUPS })}
        </Text>

        {submitted.length > 0 && (
          <Stack gap={0} as='ul' listStyleType='none' m={0} p={0}>
            {submitted.map((value, index) => {
              const lookup = lookups[index]
              const participants = lookup?.data ?? []
              return (
                <Box as='li' key={value} py={2} borderTop='1px solid' borderColor='border'>
                  {lookup?.isLoading ? (
                    <Skeleton h={5} />
                  ) : lookup?.isError ? (
                    <Flex justify='space-between' gap={2}>
                      <Text fontSize='sm' truncate>
                        {value}
                      </Text>
                      <Text fontSize='xs' color='fg.error'>
                        {getApiErrorMessage(lookup.error) ??
                          t('census.search.error', { defaultValue: 'Could not search the census.' })}
                      </Text>
                    </Flex>
                  ) : participants.length === 0 ? (
                    <Flex justify='space-between' gap={2}>
                      <Text fontSize='sm' truncate>
                        {value}
                      </Text>
                      <Badge colorPalette='gray' variant='outline' flexShrink={0}>
                        {t('process_view.lookup.not_in_vote', { defaultValue: 'Not in this vote' })}
                      </Badge>
                    </Flex>
                  ) : (
                    participants.map((participant) => {
                      const voted = participant.questions.length > 0 && participant.questions.every((q) => q.hasVoted)
                      return (
                        <Flex key={participant.memberId} justify='space-between' align='center' gap={2}>
                          <Box minW={0}>
                            <Text fontSize='sm' fontWeight='bolder' truncate>
                              {[participant.name, participant.surname].filter(Boolean).join(' ') || value}
                            </Text>
                            <Text fontSize='xs' color='fg.muted' truncate>
                              {value}
                            </Text>
                          </Box>
                          <Flex align='center' gap={2} flexShrink={0}>
                            {!voted && (
                              <ComingSoonButton
                                feature='code_delivery_log'
                                label={t('process_view.lookup.delivery', { defaultValue: 'Code delivery' })}
                                title={t('coming_soon.delivery.title', { defaultValue: 'Code delivery log' })}
                                description={t('coming_soon.delivery.description', {
                                  defaultValue:
                                    'See when a sign-in code was sent to this member and whether it was delivered, to settle "I never got the code".',
                                })}
                              />
                            )}
                            <VotedBadge participant={participant} />
                          </Flex>
                        </Flex>
                      )
                    })
                  )}
                </Box>
              )
            })}
          </Stack>
        )}

        {anonymous && (
          <Text fontSize='xs' color='fg.muted' display='flex' gap={1.5} alignItems='flex-start'>
            <Icon as={LuLock} mt={0.5} flexShrink={0} />
            {t('process_view.lookup.anonymous', {
              defaultValue: 'Anonymous vote: you can see whether someone voted, never what they chose.',
            })}
          </Text>
        )}
      </Stack>
    </Card>
  )
}
