import { AlertRoot as Alert, AlertDescription, AlertIndicator, Button, Flex, Separator, VStack } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { MailIcon, SmsIcon, UsersIcon, VoteIcon } from '~theme/icons'
import { generatePath, Link as ReactRouterLink } from 'react-router'
import { useSubscription } from '~components/Auth/Subscription'
import { DashboardBox } from '~components/Dashboard/Contents'
import { SectionHeader } from '~components/ui/SectionHeader'
import { UsageMeter, type UsageMeterColor } from '~components/ui/UsageMeter'
import { TwoFACodePrice } from '~constants'
import { usePublicLanguage } from '~i18n/usePublicLanguage'
import { usePaginatedMembers } from '~queries/members'
import { Routes } from '~routes'
import { statusPalette } from '~theme/status'

type UsageMetric = {
  icon: React.ElementType
  label: string
  current: number
  max: number
  tooltip?: string
  isSoftLimit?: boolean
  color: UsageMeterColor
}

export const UsageLimits = (props: React.ComponentProps<typeof DashboardBox>) => {
  const { t } = useTranslation()
  const language = usePublicLanguage()
  const { subscription, loading } = useSubscription()

  // Fetch memberbase data to get total count
  const { data: membersData } = usePaginatedMembers({ showAll: true })

  if (loading || !subscription) {
    return null
  }

  const { plan, usage, subscriptionDetails } = subscription

  const maxProcesses = plan.organization.maxProcesses
  const maxCensus = plan.organization.maxCensus
  const maxCensusSize = subscriptionDetails.maxCensusSize || maxCensus

  const email2FA = plan.features['2FAemail'] || 0
  const sms2FA = plan.features['2FAsms'] || 0
  const priceFormatter = new Intl.NumberFormat(language, {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  })
  const formattedEmailPrice = priceFormatter.format(TwoFACodePrice.email)
  const formattedSmsPrice = priceFormatter.format(TwoFACodePrice.sms)

  const usageMetrics: UsageMetric[] = [
    {
      icon: VoteIcon,
      label: t('dashboard.usage.voting_processes', { defaultValue: 'Voting processes' }),
      current: usage.processes || 0,
      max: maxProcesses,
      color: 'chart.1',
      tooltip: t('dashboard.usage.voting_processes_tooltip', {
        defaultValue:
          'Number of voting processes created this year. Votes with 10 members or fewer are not counted towards the limits.',
      }),
    },
    {
      icon: UsersIcon,
      label: t('dashboard.usage.memberbase_size', { defaultValue: 'Memberbase size' }),
      current: membersData?.pagination?.totalItems || 0,
      max: maxCensusSize,
      color: 'chart.2',
      tooltip: t('dashboard.usage.memberbase_tooltip', {
        defaultValue: 'Maximum number of members allowed per voting process.',
      }),
    },
  ]

  // Add 2FA metrics if they exist
  if (email2FA > 0) {
    usageMetrics.push({
      icon: MailIcon,
      label: t('dashboard.usage.2fa_email', { defaultValue: '2FA email codes' }),
      current: usage.sentEmails || 0,
      max: email2FA,
      color: 'chart.3',
      isSoftLimit: true,
      tooltip: t('dashboard.usage.2fa_email_tooltip', {
        defaultValue: 'Email verification codes sent. Exceeding the limit costs €{{price}} per code.',
        price: formattedEmailPrice,
      }),
    })
  }

  if (sms2FA > 0) {
    usageMetrics.push({
      icon: SmsIcon,
      label: t('dashboard.usage.2fa_sms', { defaultValue: '2FA SMS codes' }),
      current: usage.sentSMS || 0,
      max: sms2FA,
      color: 'chart.4',
      isSoftLimit: true,
      tooltip: t('dashboard.usage.2fa_sms_tooltip', {
        defaultValue: 'SMS verification codes sent. Exceeding the limit costs €{{price}} per code.',
        price: formattedSmsPrice,
      }),
    })
  }

  // Check if any hard limit has been exceeded (not counting soft limits like 2FA)
  const hasExceededLimit = usageMetrics.some(
    (metric) => !metric.isSoftLimit && metric.max > 0 && metric.current >= metric.max
  )

  return (
    <DashboardBox size='md' height='full' {...props}>
      <VStack align='stretch' gap='4'>
        <SectionHeader
          title={t('dashboard.usage.plan_usage', { defaultValue: 'Plan usage' })}
          description={t('dashboard.usage.plan_usage_description', {
            defaultValue: 'Track your current usage against your plan limits',
          })}
          mb='4'
        />

        {hasExceededLimit && (
          <Alert status='warning' layout='compact'>
            <AlertIndicator />
            <Flex
              flex='1'
              direction={{ base: 'column', md: 'row' }}
              align={{ base: 'flex-start', md: 'center' }}
              gap='3'
            >
              <AlertDescription fontSize='sm' fontWeight='medium' flex='1'>
                {t('dashboard.usage.limit_exceeded_message', {
                  defaultValue:
                    'Your current plan has reached its limits. Upgrade now to continue working without restrictions.',
                })}
              </AlertDescription>
              <Button asChild size='sm' colorPalette={statusPalette.warning} variant='solid' flexShrink={0}>
                <ReactRouterLink to={generatePath(Routes.dashboard.settings.subscription)}>
                  {t('dashboard.usage.upgrade_plan', { defaultValue: 'Upgrade plan' })}
                </ReactRouterLink>
              </Button>
            </Flex>
          </Alert>
        )}

        <Separator />

        <VStack align='stretch' gap='4'>
          {usageMetrics.map(({ icon, label, current, max, tooltip, isSoftLimit, color }, index) => (
            <UsageMeter
              key={index}
              icon={icon}
              label={label}
              value={current}
              max={max}
              unit={`/ ${max.toLocaleString(language)}`}
              tooltip={tooltip}
              color={color}
              softLimit={isSoftLimit}
            />
          ))}
        </VStack>
      </VStack>
    </DashboardBox>
  )
}
