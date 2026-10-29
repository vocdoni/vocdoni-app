import {
  AlertRoot as Alert,
  AlertDescription,
  AlertIndicator,
  Box,
  chakra,
  Flex,
  HStack,
  Icon,
  Progress,
  Separator,
  Text,
  TooltipContent,
  TooltipPositioner,
  TooltipRoot,
  TooltipTrigger,
  VStack,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { LuInfo, LuUsers, LuVote } from 'react-icons/lu'
import { useSaasAccount } from '~components/Account/SaasAccountProvider'
import { DashboardBox, DashboardCardHeader } from '~components/Dashboard/Contents'
import { MaxMembersPerOrg } from '~constants'
import { usePaginatedMembers } from '~queries/members'
import { quantity } from '~utils/numbers'

type UsageMetric = {
  icon: React.ElementType
  label: string
  current: number
  // Absent for a metric with no cap, which then shows its count alone
  max?: number
  tooltip?: string
  color: string
}

const UsageRow = ({ icon, label, current, max, tooltip, color }: UsageMetric) => {
  const percentage = max !== undefined && max > 0 ? Math.min((current / max) * 100, 100) : 0
  // Ensure a minimum visible percentage for the progress bar (0.5% represents "0" in the UI)
  const displayPercentage = percentage < 0.5 ? 0.5 : percentage
  const isNearLimit = percentage >= 80
  const isAtLimit = percentage >= 100

  const progressColor = isAtLimit ? 'red' : isNearLimit ? 'orange' : color

  return (
    <Box>
      <Flex justify='space-between' align='center' mb={2}>
        <HStack gap={2}>
          <Icon as={icon} boxSize={4} color={`${color}.500`} />
          <Text fontSize='sm' fontWeight='medium' color='texts.primary'>
            {label}
            {tooltip && (
              <TooltipRoot>
                <TooltipTrigger asChild>
                  <chakra.span verticalAlign='middle'>
                    <Icon as={LuInfo} ml={1} />
                  </chakra.span>
                </TooltipTrigger>
                <TooltipPositioner>
                  <TooltipContent>{tooltip}</TooltipContent>
                </TooltipPositioner>
              </TooltipRoot>
            )}
          </Text>
        </HStack>
        <HStack gap={2} align='baseline'>
          <Text fontSize='lg' fontWeight='bold' color='texts.primary'>
            {current.toLocaleString()}
          </Text>
          {max !== undefined && (
            <Text fontSize='sm' color='texts.subtle'>
              / {max.toLocaleString()}
            </Text>
          )}
        </HStack>
      </Flex>
      {max !== undefined && (
        <Progress.Root value={displayPercentage} size='sm' colorPalette={progressColor} shape='full'>
          <Progress.Track bg='bg.emphasized'>
            <Progress.Range borderRadius='full' />
          </Progress.Track>
        </Progress.Root>
      )}
    </Box>
  )
}

export const UsageLimits = (props: React.ComponentProps<typeof DashboardBox>) => {
  const { t } = useTranslation()
  const { organization, isLoading } = useSaasAccount()

  // Fetch memberbase data to get total count
  const { data: membersData } = usePaginatedMembers({ showAll: true })

  if (isLoading || !organization) {
    return null
  }

  const usageMetrics: UsageMetric[] = [
    {
      icon: LuVote,
      label: t('dashboard.usage.voting_processes', { defaultValue: 'Voting processes' }),
      current: organization.counters?.processes || 0,
      color: 'blue',
    },
    {
      icon: LuUsers,
      label: t('dashboard.usage.memberbase_size', { defaultValue: 'Memberbase size' }),
      current: membersData?.pagination?.totalItems || 0,
      max: MaxMembersPerOrg,
      color: 'purple',
      tooltip: t('dashboard.usage.memberbase_tooltip', {
        defaultValue: 'Maximum number of members allowed per voting process.',
      }),
    },
  ]

  const hasExceededLimit = usageMetrics.some(
    (metric) => metric.max !== undefined && metric.max > 0 && metric.current >= metric.max
  )

  return (
    <DashboardBox p={6} height='100%' {...props}>
      <VStack align='stretch' gap={4}>
        <DashboardCardHeader
          title={t('dashboard.usage.title', { defaultValue: 'Usage' })}
          subtitle={t('dashboard.usage.description', {
            defaultValue: 'Track your organization usage against its limits',
          })}
        />

        {hasExceededLimit && (
          <Alert status='warning' variant='subtle' borderRadius='lg' py={3} px={4}>
            <AlertIndicator />
            <AlertDescription fontSize='sm' fontWeight='medium'>
              {t('dashboard.usage.limit_exceeded_message', {
                defaultValue: 'Your memberbase has reached the limit of {{max}} members.',
                max: quantity(MaxMembersPerOrg),
              })}
            </AlertDescription>
          </Alert>
        )}

        <Separator />

        <VStack align='stretch' gap={4}>
          {usageMetrics.map((metric, index) => (
            <UsageRow key={index} {...metric} />
          ))}
        </VStack>
      </VStack>
    </DashboardBox>
  )
}
