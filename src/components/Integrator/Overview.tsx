import { Alert, Box, Flex, HStack, Icon, LinkOverlay, SimpleGrid, Spinner, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { LuArrowUpRight, LuNetwork, LuRocket, LuTerminal } from 'react-icons/lu'
import { BookerModalButton } from '~components/Dashboard/Booker'
import { DashboardBox, DashboardCardHeader, DashboardContents } from '~components/Dashboard/Contents'
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

  // Documentation shortcuts, mirroring the developer portal pillars (Quickstart / SaaS API / SDK).
  const docs = [
    {
      href: 'https://vocdoni.io/developers/docs/quickstart',
      icon: LuRocket,
      title: t('integrators.docs.quickstart_title', { defaultValue: 'Quickstart' }),
      description: t('integrators.docs.quickstart_description', {
        defaultValue:
          'Run a full election end to end — create an org, build a census, open a process and read the tally — in a few API calls.',
      }),
    },
    {
      href: 'https://vocdoni.io/developers/docs',
      icon: LuNetwork,
      title: t('integrators.docs.api_title', { defaultValue: 'SaaS API' }),
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
          'The TypeScript SDK adds client-side voting to your app — CSP auth, ballot encoding and vote signing — all through the SaaS API.',
      }),
    },
  ]

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

      <Box mt={8}>
        <DashboardCardHeader
          title={t('integrators.docs.title', { defaultValue: 'Documentation' })}
          subtitle={t('integrators.docs.subtitle', {
            defaultValue: 'Guides and references to start building with Vocdoni.',
          })}
        />
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
          {docs.map((doc) => (
            <DashboardBox
              key={doc.href}
              position='relative'
              gap={3}
              justifyContent='flex-start'
              transition='border-color 0.15s'
              _hover={{ _light: { borderColor: 'blue.400' }, _dark: { borderColor: 'blue.400' } }}
            >
              <HStack justify='space-between'>
                <Icon as={doc.icon} boxSize={6} color='blue.500' />
                <Icon as={LuArrowUpRight} boxSize={4} color='texts.subtle' />
              </HStack>
              <LinkOverlay href={doc.href} target='_blank' rel='noopener noreferrer' fontWeight='bold' fontSize='md'>
                {doc.title}
              </LinkOverlay>
              <Text fontSize='sm' color='texts.subtle'>
                {doc.description}
              </Text>
            </DashboardBox>
          ))}
        </SimpleGrid>
      </Box>
    </DashboardContents>
  )
}
