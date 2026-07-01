import { Alert, ButtonGroup, Center, Flex, IconButton, Spinner, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu'
import { DashboardCardHeader, DashboardContents } from '~components/Dashboard/Contents'
import { ManagedOrganizationsTable } from '~components/Integrator/ManagedOrganizationsTable'
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
      <DashboardCardHeader
        title={t('integrators.managed.title', { defaultValue: 'Managed organizations' })}
        subtitle={t('integrators.managed.subtitle', {
          defaultValue: 'Organizations you manage on behalf of your customers.',
        })}
      />

      {isLoading ? (
        <Center py={16}>
          <Spinner />
        </Center>
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
        <Alert.Root status='info'>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>
              {t('integrators.managed.empty_title', { defaultValue: 'No managed organizations yet' })}
            </Alert.Title>
            <Alert.Description>
              {t('integrators.managed.empty_description', {
                defaultValue: 'Organizations you provision for your customers will appear here.',
              })}
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      ) : (
        <Flex direction='column' gap={4}>
          <ManagedOrganizationsTable organizations={organizations} />
          {pagination && pagination.lastPage > 1 && (
            <Flex justify='space-between' align='center' gap={4} wrap='wrap'>
              <Text fontSize='sm' color='texts.subtle'>
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
                  <LuChevronLeft />
                </IconButton>
                <IconButton
                  aria-label={t('pagination.next', { defaultValue: 'Next page' })}
                  disabled={pagination.nextPage === null}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <LuChevronRight />
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
