import { Alert, Flex, SimpleGrid, Spinner, Stack, Text } from '@chakra-ui/react'
import { useIntegratorInfo } from '~platform/queries/integrator'
import { QuotaCard } from './QuotaCard'
import { UpgradePlansButton } from './UpgradeDialog'

export const IntegratorOverview = () => {
  const { data, isLoading, error } = useIntegratorInfo()

  if (isLoading) return <Spinner />

  if (error || !data?.limits) {
    return (
      <Alert.Root status='error'>
        <Alert.Indicator />
        <Alert.Title>Unable to load integrator quota</Alert.Title>
      </Alert.Root>
    )
  }

  const { limits, usage } = data

  return (
    <Stack gap={5}>
      <Flex justify='space-between' align='flex-start' gap={4} wrap='wrap'>
        <Stack gap={1}>
          <Text fontSize='2xl' fontWeight='bold'>
            Overview
          </Text>
          <Text color='fg.muted' fontSize='sm'>
            Your integrator quota and current usage.
          </Text>
        </Stack>
        <UpgradePlansButton />
      </Flex>
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
        <QuotaCard label='Managed organizations' usage={usage.managedOrgs} limit={limits.maxManagedOrgs} />
        <QuotaCard label='Voting processes' usage={usage.managedProcesses} limit={limits.maxManagedProcesses} />
        <QuotaCard label='Census size' usage={usage.managedCensusSize} limit={limits.maxManagedCensusSize} />
      </SimpleGrid>
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
        <QuotaCard label='Votes emitted' usage={usage.sentVotes} limit={limits.maxVotes} />
        <QuotaCard label='SMS used' usage={usage.sentSMS} limit={limits.maxSMS} />
        <QuotaCard label='Emails used' usage={usage.sentEmails} limit={limits.maxEmails} />
      </SimpleGrid>
    </Stack>
  )
}
