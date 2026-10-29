import { Alert, Box, Flex, Link, SimpleGrid, Spinner, Text } from '@chakra-ui/react'
import { useContext } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { LuNetwork, LuRocket, LuTerminal } from 'react-icons/lu'
import { Link as RouterLink } from 'react-router'
import { BookerModalButton } from '~components/Dashboard/Booker'
import { DashboardBox, DashboardCardHeader, DashboardContents } from '~components/Dashboard/Contents'
import { DashboardLayoutContext } from '~elements/DashboardLayoutContext'
import { useIntegratorInfo } from '~src/queries/integrators'
import { useWallet } from '~src/queries/wallet'
import { Routes } from '~src/router/routes'
import { currency } from '~utils/numbers'
import { DocsCard } from './DocsCard'
import { QuotaCard } from './QuotaCard'

/**
 * Integrator landing page: quota cards driven by GET /integrator, a wallet balance card, plus an
 * "Upgrade plan" action that opens the shared Cal.com scheduling modal (same contact flow as the
 * admin custom plan card).
 */
export const IntegratorOverview = () => {
  const { t } = useTranslation()
  const { data, isLoading, error } = useIntegratorInfo()
  // Hidden on error: the current backend has no wallet endpoint, and a managed org gets a 403.
  const wallet = useWallet()
  const layout = useContext(DashboardLayoutContext)

  if (isLoading) {
    return (
      <DashboardContents>
        <Spinner />
      </DashboardContents>
    )
  }

  if (error || !data) {
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

  // `limits` and the managed processes counter are absent under pay-per-process.
  const { limits, usage } = data

  // Documentation shortcuts, mirroring the developer portal pillars (Quickstart / API / SDK).
  const docs = [
    {
      href: 'https://vocdoni.io/developers/docs/quickstart',
      icon: LuRocket,
      title: t('integrators.docs.quickstart_title', { defaultValue: 'Quickstart' }),
      description: t('integrators.docs.quickstart_description', {
        defaultValue:
          'Run a full election end to end in a few API calls: create an org, build a census, open a process and read the tally.',
      }),
    },
    {
      href: 'https://vocdoni.io/developers/docs',
      icon: LuNetwork,
      title: t('integrators.docs.api_title', { defaultValue: 'API reference' }),
      description: t('integrators.docs.api_description', {
        defaultValue:
          'A REST API to run managed elections: organizations, members, censuses, processes, results and async jobs.',
      }),
    },
    {
      href: 'https://vocdoni.io/developers/docs/sdk-quickstart',
      icon: LuTerminal,
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
      <Flex justify='space-between' align='flex-start' gap={4} mb={4}>
        <DashboardCardHeader
          mb={0}
          title={t('integrators.overview_title', { defaultValue: 'Overview' })}
          subtitle={t('integrators.overview_subtitle', {
            defaultValue: 'Your integrator usage and wallet balance.',
          })}
        />
        {/* Desktop: sits at the top-right of the page header. On mobile the layout exposes a slot
            in the shared top bar (next to the sidebar toggle) and the button is portaled there
            instead, so only one instance is ever mounted. */}
        {!layout?.headerActionsNode && (
          <BookerModalButton
            variant='solid'
            colorPalette='gray'
            flexShrink={0}
            display={{ base: 'none', md: 'inline-flex' }}
          >
            {upgradeLabel}
          </BookerModalButton>
        )}
      </Flex>
      {layout?.headerActionsNode &&
        createPortal(
          <BookerModalButton variant='solid' colorPalette='gray' size='xs'>
            {upgradeLabel}
          </BookerModalButton>,
          layout.headerActionsNode
        )}
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
        {wallet.data && (
          <DashboardBox gap={3} justifyContent='flex-start'>
            <Text fontSize='sm' color='texts.subtle' fontWeight='medium'>
              {t('integrators.wallet.balance', { defaultValue: 'Wallet balance' })}
            </Text>
            <Text fontSize='3xl' fontWeight='bold' lineHeight='1'>
              {currency(wallet.data.balanceCents, wallet.data.currency.toUpperCase())}
            </Text>
            <Box minH='22px'>
              <Link asChild fontSize='sm' fontWeight='bold' color='texts.subtle'>
                <RouterLink to={Routes.integrators.configuration.wallet}>
                  {t('integrators.wallet.manage', { defaultValue: 'Manage wallet' })}
                </RouterLink>
              </Link>
            </Box>
          </DashboardBox>
        )}
        {typeof usage.managedOrgs === 'number' && (
          <QuotaCard
            label={t('integrators.quota.managed_orgs', { defaultValue: 'Organizations created' })}
            usage={usage.managedOrgs}
            limit={limits?.maxManagedOrgs}
          />
        )}
        {typeof usage.managedProcesses === 'number' && (
          <QuotaCard
            label={t('integrators.quota.voting_processes', { defaultValue: 'Voting processes created' })}
            usage={usage.managedProcesses}
            limit={limits?.maxManagedProcesses}
          />
        )}
        {typeof usage.sentVotes === 'number' && (
          <QuotaCard
            label={t('integrators.quota.votes', { defaultValue: 'Votes cast' })}
            usage={usage.sentVotes}
            limit={limits?.maxVotes}
          />
        )}
        {typeof usage.sentSMS === 'number' && (
          <QuotaCard
            label={t('integrators.quota.sms', { defaultValue: 'Voter verifications by SMS' })}
            usage={usage.sentSMS}
            limit={limits?.maxSMS}
          />
        )}
        {typeof usage.sentEmails === 'number' && (
          <QuotaCard
            label={t('integrators.quota.emails', { defaultValue: 'Voter verifications by email' })}
            usage={usage.sentEmails}
            limit={limits?.maxEmails}
          />
        )}
      </SimpleGrid>

      <Box mt={8}>
        <DashboardCardHeader
          title={t('integrators.docs.title', { defaultValue: 'Documentation' })}
          subtitle={t('integrators.docs.subtitle', {
            defaultValue: 'Guides and references to start building with Vocdoni.',
          })}
        />
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
          {docs.map((doc) => (
            <DocsCard key={doc.href} {...doc} />
          ))}
        </SimpleGrid>
      </Box>
    </DashboardContents>
  )
}
