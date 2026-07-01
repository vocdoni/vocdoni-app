import { Alert, Flex, SimpleGrid, Spinner } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { BookerModalButton } from '~components/Dashboard/Booker'
import { DashboardCardHeader, DashboardContents } from '~components/Dashboard/Contents'
import { useIntegratorInfo } from '~src/queries/integrators'
import { QuotaCard } from './QuotaCard'

/**
 * Integrator landing page: quota cards driven by GET /integrator, plus a "Change plan" action that
 * opens the shared Cal.com scheduling modal (same contact flow as the admin custom plan card).
 */
export const IntegratorOverview = () => {
  const { t } = useTranslation()
  const { data, isLoading, error } = useIntegratorInfo()

  if (isLoading) {
    return (
      <DashboardContents>
        <Spinner />
      </DashboardContents>
    )
  }

  if (error || !data?.limits) {
    return (
      <DashboardContents>
        <Alert.Root status='error'>
          <Alert.Indicator />
          <Alert.Title>
            {t('integrators.overview_error', { defaultValue: 'Unable to load integrator quota' })}
          </Alert.Title>
        </Alert.Root>
      </DashboardContents>
    )
  }

  const { limits, usage } = data

  return (
    <DashboardContents>
      <Flex justify='space-between' align='flex-start' gap={4} wrap='wrap'>
        <DashboardCardHeader
          title={t('integrators.overview_title', { defaultValue: 'Overview' })}
          subtitle={t('integrators.overview_subtitle', {
            defaultValue: 'Your integrator quota and current usage.',
          })}
        />
        <BookerModalButton variant='solid' colorPalette='gray'>
          {t('integrators.change_plan', { defaultValue: 'Change plan' })}
        </BookerModalButton>
      </Flex>
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
        <QuotaCard
          label={t('integrators.quota.managed_orgs', { defaultValue: 'Managed organizations' })}
          usage={usage.managedOrgs}
          limit={limits.maxManagedOrgs}
        />
        <QuotaCard
          label={t('integrators.quota.voting_processes', { defaultValue: 'Voting processes' })}
          usage={usage.managedProcesses}
          limit={limits.maxManagedProcesses}
        />
        <QuotaCard
          label={t('integrators.quota.votes', { defaultValue: 'Votes emitted' })}
          usage={usage.sentVotes}
          limit={limits.maxVotes}
        />
        <QuotaCard
          label={t('integrators.quota.sms', { defaultValue: 'SMS used' })}
          usage={usage.sentSMS}
          limit={limits.maxSMS}
        />
        <QuotaCard
          label={t('integrators.quota.emails', { defaultValue: 'Emails used' })}
          usage={usage.sentEmails}
          limit={limits.maxEmails}
        />
      </SimpleGrid>
    </DashboardContents>
  )
}
