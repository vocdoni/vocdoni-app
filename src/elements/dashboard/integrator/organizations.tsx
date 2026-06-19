import { Flex, Progress } from '@chakra-ui/react'
import { RoutedPaginationProvider } from '@vocdoni/react-components/pagination'
import { useTranslation } from 'react-i18next'
import { DashboardCardHeader, DashboardContents } from '~components/Dashboard/Contents'
import { ListStateAlert } from '~components/Feedback/ListStateAlert'
import { CreateManagedOrganizationButton } from '~components/Integrator/CreateManagedOrganizationModal'
import { ManagedOrganizationsTable } from '~components/Integrator/ManagedOrganizationsTable'
import { usePaginatedManagedOrganizations } from '~queries/integrator'
import { Routes } from '~routes'

const ManagedOrganizations = () => {
  const { t } = useTranslation()
  const { data, isLoading, error } = usePaginatedManagedOrganizations()

  const hasError = !!error && !isLoading
  const isEmpty = (data?.organizations?.length ?? 0) === 0 && !isLoading && !hasError
  const showAlert = hasError || isEmpty
  const alertTitle = hasError
    ? t('integrator.organizations.load_error', { defaultValue: 'Unable to load organizations' })
    : t('integrator.organizations.empty', { defaultValue: 'No managed organizations yet' })
  const alertDescription = hasError
    ? error instanceof Error
      ? error.message
      : t('integrator.organizations.load_error_description', { defaultValue: 'Please try again.' })
    : t('integrator.organizations.empty_description', {
        defaultValue: 'Create an organization to start managing it.',
      })

  const pagination = data?.pagination || {
    totalItems: 0,
    currentPage: 0,
    lastPage: 0,
    previousPage: null,
    nextPage: null,
  }

  return (
    <DashboardContents>
      <Flex justify='space-between' align='flex-start' gap={4} wrap='wrap'>
        <DashboardCardHeader
          title={t('integrator.organizations.title', { defaultValue: 'Managed organizations' })}
          subtitle={t('integrator.organizations.subtitle', {
            defaultValue: 'Organizations you manage on behalf of your customers.',
          })}
        />
        <CreateManagedOrganizationButton />
      </Flex>

      {isLoading ? (
        <Progress.Root size='xs' value={null} colorPalette='gray'>
          <Progress.Track>
            <Progress.Range />
          </Progress.Track>
        </Progress.Root>
      ) : (
        <RoutedPaginationProvider
          initialPage={1}
          path={Routes.dashboard.integrator.organizations}
          pagination={pagination}
        >
          {showAlert && (
            <ListStateAlert
              show
              status={hasError ? 'error' : 'info'}
              title={alertTitle}
              description={alertDescription}
            />
          )}
          <ManagedOrganizationsTable organizations={data?.organizations ?? []} />
        </RoutedPaginationProvider>
      )}
    </DashboardContents>
  )
}

export default ManagedOrganizations
