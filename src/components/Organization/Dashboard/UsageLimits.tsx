import { AlertRoot as Alert, AlertDescription, AlertIndicator, Separator, VStack } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useSaasAccount } from '~components/Account/SaasAccountProvider'
import { UsersIcon, VoteIcon } from '~theme/icons'
import { DashboardBox } from '~components/Dashboard/Contents'
import { SectionHeader } from '~components/ui/SectionHeader'
import { UsageMeter, type UsageMeterColor } from '~components/ui/UsageMeter'
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
  color: UsageMeterColor
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
      icon: VoteIcon,
      label: t('dashboard.usage.voting_processes', { defaultValue: 'Voting processes' }),
      current: organization.counters?.processes || 0,
      color: 'chart.1',
    },
    {
      icon: UsersIcon,
      label: t('dashboard.usage.memberbase_size', { defaultValue: 'Memberbase size' }),
      current: membersData?.pagination?.totalItems || 0,
      max: MaxMembersPerOrg,
      color: 'chart.2',
      tooltip: t('dashboard.usage.memberbase_tooltip', {
        defaultValue: 'Maximum number of members allowed per voting process.',
      }),
    },
  ]

  const hasExceededLimit = usageMetrics.some(
    (metric) => metric.max !== undefined && metric.max > 0 && metric.current >= metric.max
  )

  return (
    <DashboardBox size='md' height='full' {...props}>
      <VStack align='stretch' gap='4'>
        <SectionHeader
          title={t('dashboard.usage.title', { defaultValue: 'Usage' })}
          description={t('dashboard.usage.description', {
            defaultValue: 'Track your organization usage against its limits',
          })}
          mb='4'
        />

        {hasExceededLimit && (
          <Alert status='warning' layout='compact'>
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

        <VStack align='stretch' gap='4'>
          {usageMetrics.map(({ icon, label, current, max, tooltip, color }, index) => (
            <UsageMeter
              key={index}
              icon={icon}
              label={label}
              value={current}
              max={max}
              unit={max !== undefined ? `/ ${max.toLocaleString()}` : undefined}
              tooltip={tooltip}
              color={color}
            />
          ))}
        </VStack>
      </VStack>
    </DashboardBox>
  )
}
