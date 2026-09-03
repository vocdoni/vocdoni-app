import { Avatar, Badge, Box, Button, Card, Flex, Heading, Link, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Editor from '~components/Editor'
import { RouterAwareLink } from '~components/RouterAwareLink'
import { useDateFns } from '~i18n/use-date-fns'
import { usePublicLanguage } from '~i18n/usePublicLanguage'
import { useAppEnv } from '~src/app-env'
import { useLocalizedText } from '~src/legacy/use-localized-text'
import {
  fetchLegacyOrganizationElections,
  getVochainGatewayUrl,
  type LegacyElectionListItem,
  type LegacyElectionsPage,
  type LegacyOrganization,
} from '~src/legacy/vochain-archive'
import { getPublicProcessPath } from '~src/ssr/public-pages'

const ElectionRow = ({ election }: { election: LegacyElectionListItem }) => {
  const { t } = useTranslation()
  const { format } = useDateFns()
  const localize = useLocalizedText()
  const publicLanguage = usePublicLanguage()

  const title = localize(election.title) || election.id

  return (
    <Card.Root variant='outline' size='sm'>
      <Card.Body>
        <Flex justify='space-between' align='center' gap={4} flexWrap='wrap'>
          <Box flex='1' minW={0}>
            <Link asChild fontWeight='medium'>
              <RouterAwareLink to={getPublicProcessPath({ id: election.id, language: publicLanguage })}>
                <Text truncate>{title}</Text>
              </RouterAwareLink>
            </Link>
            <Text fontSize='sm' color='texts.subtle'>
              {t('election.ends_on', {
                defaultValue: 'Ends on {{date}}',
                date: format(election.endDate, t('organization.date_format')),
              })}
            </Text>
          </Box>
          <Flex align='center' gap={3} flexShrink={0}>
            <Badge colorPalette={election.status === 'ONGOING' ? 'green' : 'gray'}>{election.status}</Badge>
            <Text fontSize='sm' whiteSpace='nowrap'>
              {t('election.total_votes', { defaultValue: '{{totalVotes}} votes', totalVotes: election.voteCount })}
            </Text>
          </Flex>
        </Flex>
      </Card.Body>
    </Card.Root>
  )
}

/**
 * Read-only public page for a legacy-only (vochain archive) organization:
 * account metadata plus its archived elections with load-more pagination.
 * Organizations known to the SaaS API render the regular v2 page instead.
 */
export const ArchiveOrganizationView = ({
  organization,
  initialElectionsPage,
}: {
  organization: LegacyOrganization
  initialElectionsPage?: LegacyElectionsPage
}) => {
  const { t } = useTranslation()
  const localize = useLocalizedText()
  const { VOCDONI_ENVIRONMENT } = useAppEnv()
  const [elections, setElections] = useState<LegacyElectionListItem[]>(initialElectionsPage?.elections ?? [])
  const [pagination, setPagination] = useState(initialElectionsPage?.pagination)
  const [loading, setLoading] = useState(false)

  const name = localize(organization.account?.name) || organization.address
  const description = localize(organization.account?.description)
  const hasMore = pagination?.nextPage !== null && pagination?.nextPage !== undefined

  const loadMore = async () => {
    if (!pagination || loading) return

    setLoading(true)
    try {
      const nextPage = await fetchLegacyOrganizationElections(
        getVochainGatewayUrl(VOCDONI_ENVIRONMENT),
        organization.address,
        pagination.nextPage ?? pagination.currentPage + 1
      )
      setElections((current) => [...current, ...nextPage.elections])
      setPagination(nextPage.pagination)
    } finally {
      setLoading(false)
    }
  }

  return (
    <VStack align='stretch' gap={6} maxW='4xl' mx='auto' px={4} py={8} w='full'>
      <Flex align='center' gap={4}>
        <Avatar.Root size='xl'>
          {organization.account?.avatar && <Avatar.Image src={organization.account.avatar} alt={name} />}
          <Avatar.Fallback name={name} />
        </Avatar.Root>
        <Box>
          <Heading size='xl'>{name}</Heading>
          <Text fontSize='sm' color='texts.subtle'>
            {organization.address}
          </Text>
        </Box>
      </Flex>

      {description && (
        <Box className='md-sizes'>
          <Editor defaultValue={description} isDisabled />
        </Box>
      )}

      <VStack align='stretch' gap={3}>
        <Heading size='md'>{t('organization.elections_list', { defaultValue: 'Voting processes' })}</Heading>
        {elections.length === 0 && (
          <Text color='texts.subtle'>
            {t('organization.elections_list_empty.not_owner', {
              defaultValue: 'This organization has no voting processes yet.',
            })}
          </Text>
        )}
        {elections.map((election) => (
          <ElectionRow key={election.id} election={election} />
        ))}
        {hasMore && (
          <Button onClick={loadMore} loading={loading} variant='outline' alignSelf='center'>
            {t('organization.elections_list_load_more', { defaultValue: 'Load more' })}
          </Button>
        )}
      </VStack>
    </VStack>
  )
}

export default ArchiveOrganizationView
