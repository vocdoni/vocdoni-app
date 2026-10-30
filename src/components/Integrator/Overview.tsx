import { Alert, Box, SimpleGrid } from '@chakra-ui/react'
import { useContext } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { NetworkIcon, RocketIcon, TerminalIcon } from '~theme/icons'
import { BookerModalButton } from '~components/Dashboard/Booker'
import { DashboardContents } from '~components/Dashboard/Contents'
import { SectionHeader } from '~components/ui/SectionHeader'
import { PageLoader } from '~components/ui/Loader'
import { PageHeader } from '~components/ui/PageTitle'
import { DashboardLayoutContext } from '~elements/DashboardLayoutContext'
import { useIntegratorInfo } from '~src/queries/integrators'
import { DocsCard } from './DocsCard'
import { QuotaCard } from './QuotaCard'

/**
 * Integrator landing page: quota cards driven by GET /integrator, plus an "Upgrade plan" action
 * that opens the shared Cal.com scheduling modal (same contact flow as the admin custom plan card).
 */
export const IntegratorOverview = () => {
  const { t } = useTranslation()
  const { data, isLoading, error } = useIntegratorInfo()
  const layout = useContext(DashboardLayoutContext)

  if (isLoading) {
    return (
      <DashboardContents>
        <PageLoader />
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

  // Documentation shortcuts, mirroring the developer portal pillars (Quickstart / API / SDK).
  const docs = [
    {
      href: 'https://vocdoni.io/developers/docs/quickstart',
      icon: RocketIcon,
      title: t('integrators.docs.quickstart_title', { defaultValue: 'Quickstart' }),
      description: t('integrators.docs.quickstart_description', {
        defaultValue:
          'Run a full election end to end in a few API calls: create an org, build a census, open a process and read the tally.',
      }),
    },
    {
      href: 'https://vocdoni.io/developers/docs',
      icon: NetworkIcon,
      title: t('integrators.docs.api_title', { defaultValue: 'API reference' }),
      description: t('integrators.docs.api_description', {
        defaultValue:
          'A REST API to run managed elections: organizations, members, censuses, processes, results and async jobs.',
      }),
    },
    {
      href: 'https://vocdoni.io/developers/docs/sdk-quickstart',
      icon: TerminalIcon,
      title: t('integrators.docs.sdk_title', { defaultValue: 'SDK' }),
      description: t('integrators.docs.sdk_description', {
        defaultValue:
          'The TypeScript SDK adds client-side voting to your app through the API: CSP auth, ballot encoding and vote signing.',
      }),
    },
  ]

  const upgradeLabel = t('integrators.upgrade_plan', { defaultValue: 'Upgrade plan' })

  return (
    <DashboardContents>
      <PageHeader
        title={t('integrators.overview_title', { defaultValue: 'Overview' })}
        subtitle={t('integrators.overview_subtitle', {
          defaultValue: 'Your integrator quota and current usage.',
        })}
        // Desktop: sits at the top-right of the page header. On mobile the layout exposes a slot
        // in the shared top bar (next to the sidebar toggle) and the button is portaled there
        // instead, so only one instance is ever mounted.
        actions={
          !layout?.headerActionsNode && (
            <BookerModalButton
              variant='solid'
              colorPalette='gray'
              flexShrink={0}
              display={{ base: 'none', md: 'inline-flex' }}
            >
              {upgradeLabel}
            </BookerModalButton>
          )
        }
      />
      {layout?.headerActionsNode &&
        createPortal(
          <BookerModalButton variant='solid' colorPalette='gray' size='xs'>
            {upgradeLabel}
          </BookerModalButton>,
          layout.headerActionsNode
        )}
      <SimpleGrid columns={{ base: 1, md: 3 }} gap='4'>
        <QuotaCard
          label={t('integrators.quota.managed_orgs', { defaultValue: 'Organizations created' })}
          usage={usage.managedOrgs}
          limit={limits.maxManagedOrgs}
        />
        <QuotaCard
          label={t('integrators.quota.voting_processes', { defaultValue: 'Voting processes created' })}
          usage={usage.managedProcesses}
          limit={limits.maxManagedProcesses}
        />
        <QuotaCard
          label={t('integrators.quota.votes', { defaultValue: 'Votes cast' })}
          usage={usage.sentVotes}
          limit={limits.maxVotes}
        />
        <QuotaCard
          label={t('integrators.quota.sms', { defaultValue: 'Voter verifications by SMS' })}
          usage={usage.sentSMS}
          limit={limits.maxSMS}
        />
        <QuotaCard
          label={t('integrators.quota.emails', { defaultValue: 'Voter verifications by email' })}
          usage={usage.sentEmails}
          limit={limits.maxEmails}
        />
      </SimpleGrid>

      <Box mt='8'>
        <SectionHeader
          title={t('integrators.docs.title', { defaultValue: 'Documentation' })}
          description={t('integrators.docs.subtitle', {
            defaultValue: 'Guides and references to start building with Vocdoni.',
          })}
          mb='4'
        />
        <SimpleGrid columns={{ base: 1, md: 3 }} gap='4'>
          {docs.map((doc) => (
            <DocsCard key={doc.href} {...doc} />
          ))}
        </SimpleGrid>
      </Box>
    </DashboardContents>
  )
}
