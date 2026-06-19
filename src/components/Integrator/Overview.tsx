import { Progress, SimpleGrid } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { DashboardCardHeader } from '~components/Dashboard/Contents'
import { ListStateAlert } from '~components/Feedback/ListStateAlert'
import { useIntegratorInfo } from '~queries/integrator'
import { QuotaCard } from './QuotaCard'

/**
 * Integrator overview: three quota cards (managed orgs, processes, census size) each showing
 * usage against its limit. Reachable only through the integrator guard, so `enabled` is always
 * true here, but we defend against a missing `limits` payload just in case.
 */
export const IntegratorOverview = () => {
  const { t } = useTranslation()
  const { data, isLoading, error } = useIntegratorInfo()

  if (isLoading) {
    return (
      <Progress.Root size='xs' value={null} colorPalette='gray'>
        <Progress.Track>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>
    )
  }

  if (error || !data?.limits) {
    return (
      <ListStateAlert
        show
        status='error'
        title={t('integrator.overview.load_error', { defaultValue: 'Unable to load integrator quota' })}
        description={error instanceof Error ? error.message : undefined}
      />
    )
  }

  const { limits, usage } = data

  return (
    <>
      <DashboardCardHeader
        title={t('integrator.overview.title', { defaultValue: 'Overview' })}
        subtitle={t('integrator.overview.subtitle', {
          defaultValue: 'Your integrator quota and current usage.',
        })}
      />
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
        <QuotaCard
          label={t('integrator.overview.managed_orgs', { defaultValue: 'Managed organizations' })}
          usage={usage.managedOrgs}
          limit={limits.maxManagedOrgs}
        />
        <QuotaCard
          label={t('integrator.overview.managed_processes', { defaultValue: 'Voting processes' })}
          usage={usage.managedProcesses}
          limit={limits.maxManagedProcesses}
        />
        <QuotaCard
          label={t('integrator.overview.managed_census', { defaultValue: 'Census size' })}
          usage={usage.managedCensusSize}
          limit={limits.maxManagedCensusSize}
        />
      </SimpleGrid>
    </>
  )
}
