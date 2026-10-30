import { Alert, ButtonGroup, Flex, IconButton, SimpleGrid, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeftIcon, ChevronRightIcon, DocsIcon } from '~theme/icons'
import { DashboardContents } from '~components/Dashboard/Contents'
import { PageSubtitle, PageTitle } from '~components/ui/PageTitle'
import { DocsCard } from '~components/Integrator/DocsCard'
import { ManagedOrganizationsTable } from '~components/Integrator/ManagedOrganizationsTable'
import { EmptyState } from '~components/ui/EmptyState'
import { ListLoader } from '~components/ui/Loader'
import { useManagedOrganizations } from '~src/queries/integrators'

const LIMIT = 10

/**
 * Read-only list of the organizations the integrator manages. Creation/editing happens through the
 * integrator's own API (out of scope for the dashboard).
 */
const IntegratorManagedOrganizations = () => {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const { data, isLoading, error } = useManagedOrganizations(page, LIMIT)

  const pagination = data?.pagination
  const organizations = data?.organizations ?? []

  return (
    <DashboardContents>
      <PageTitle>{t('integrators.managed.title', { defaultValue: 'Managed organizations' })}</PageTitle>
      <PageSubtitle>
        {t('integrators.managed.subtitle', {
          defaultValue: 'Organizations you manage on behalf of your customers.',
        })}
      </PageSubtitle>

      {isLoading ? (
        <ListLoader />
      ) : error ? (
        <Alert.Root status='error'>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>
              {t('integrators.managed.error', { defaultValue: 'Unable to load organizations' })}
            </Alert.Title>
            <Alert.Description>{(error as Error).message}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      ) : organizations.length === 0 ? (
        <Flex direction='column' gap='4'>
          <EmptyState
            size='lg'
            title={t('integrators.managed.empty_title', { defaultValue: 'No organizations yet' })}
            description={t('integrators.managed.empty_description', {
              defaultValue:
                'Organizations are created through the API, not from this dashboard. Once you provision your first organization it will appear here.',
            })}
          />
          {/* Docs shortcut shown only until the first organization exists */}
          <SimpleGrid columns={{ base: 1, md: 3 }} gap='4'>
            <DocsCard
              href='https://vocdoni.io/en/developers/docs/organizations#creating-an-organization'
              icon={DocsIcon}
              title={t('integrators.managed.docs_card_title', { defaultValue: 'Creating an organization' })}
              description={t('integrators.managed.docs_card_description', {
                defaultValue: 'Learn how to create and manage organizations programmatically through the API.',
              })}
            />
          </SimpleGrid>
        </Flex>
      ) : (
        <Flex direction='column' gap='4'>
          <ManagedOrganizationsTable organizations={organizations} />
          {pagination && pagination.lastPage > 1 && (
            <Flex justify='space-between' align='center' gap='4' wrap='wrap'>
              <Text textStyle='body-sm' color='fg.muted'>
                {t('integrators.managed.pagination', {
                  defaultValue: 'Page {{page}} of {{total}} · {{items}} total',
                  page: pagination.currentPage,
                  total: pagination.lastPage,
                  items: pagination.totalItems,
                })}
              </Text>
              <ButtonGroup size='sm' variant='outline' attached>
                <IconButton
                  aria-label={t('pagination.previous', { defaultValue: 'Previous page' })}
                  disabled={pagination.previousPage === null}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeftIcon />
                </IconButton>
                <IconButton
                  aria-label={t('pagination.next', { defaultValue: 'Next page' })}
                  disabled={pagination.nextPage === null}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRightIcon />
                </IconButton>
              </ButtonGroup>
            </Flex>
          )}
        </Flex>
      )}
    </DashboardContents>
  )
}

export default IntegratorManagedOrganizations
