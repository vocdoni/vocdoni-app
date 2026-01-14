import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  chakra,
  Divider,
  Flex,
  HStack,
  Icon,
  Progress,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { LuInfo, LuMail, LuMessageSquare, LuUsers, LuVote } from 'react-icons/lu'
import { generatePath, Link as ReactRouterLink } from 'react-router-dom'
import { useSubscription } from '~components/Auth/Subscription'
import { TwoFACodePrice } from '~constants'
import { usePaginatedMembers } from '~queries/members'
import { Routes } from '~routes'
import { DashboardBox, DashboardCardHeader } from '~shared/Dashboard/Contents'

type UsageMetric = {
  icon: React.ElementType
  label: string
  current: number
  max: number
  tooltip?: string
  isSoftLimit?: boolean
  color: string
}

const UsageRow = ({ icon, label, current, max, tooltip, isSoftLimit, color }: UsageMetric) => {
  const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0
  // Ensure a minimum visible percentage for the progress bar (0.5% represents "0" in the UI)
  const displayPercentage = percentage < 0.5 ? 0.5 : percentage
  const isNearLimit = percentage >= 80 && !isSoftLimit
  const isAtLimit = percentage >= 100 && !isSoftLimit

  const progressColor = isAtLimit ? 'red' : isNearLimit ? 'orange' : color

  return (
    <Box>
      <Flex justify='space-between' align='center' mb={2}>
        <HStack spacing={2}>
          <Icon as={icon} boxSize={4} color={`${color}.500`} />
          <Text fontSize='sm' fontWeight='medium' color='texts.primary'>
            {label}
            {tooltip && (
              <Tooltip label={tooltip} placement='auto'>
                <chakra.span verticalAlign='middle'>
                  <Icon as={LuInfo} ml={1} />
                </chakra.span>
              </Tooltip>
            )}
          </Text>
        </HStack>
        <HStack spacing={2} align='baseline'>
          <Text fontSize='lg' fontWeight='bold' color='texts.primary'>
            {current.toLocaleString()}
          </Text>
          <Text fontSize='sm' color='texts.subtle'>
            / {max.toLocaleString()}
          </Text>
        </HStack>
      </Flex>
      <Progress
        value={displayPercentage}
        size='sm'
        colorScheme={progressColor}
        borderRadius='full'
        bg='gray.200'
        sx={{
          _dark: {
            bg: 'gray.600',
          },
        }}
      />
    </Box>
  )
}

export const UsageLimits = () => {
  const { t, i18n } = useTranslation()
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
  const priceFormatter = new Intl.NumberFormat(i18n.resolvedLanguage || i18n.language || 'en', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  })
  const formattedEmailPrice = priceFormatter.format(TwoFACodePrice.email)
  const formattedSmsPrice = priceFormatter.format(TwoFACodePrice.sms)

  const usageMetrics: UsageMetric[] = [
    {
      icon: LuVote,
      label: t('dashboard.usage.voting_processes', { defaultValue: 'Voting Processes' }),
      current: usage.processes || 0,
      max: maxProcesses,
      color: 'blue',
      tooltip: t('dashboard.usage.voting_processes_tooltip', {
        defaultValue:
          'Number of voting processes created this year. Votes with 10 members or fewer are not counted towards the limits.',
      }),
    },
    {
      icon: LuUsers,
      label: t('dashboard.usage.memberbase_size', { defaultValue: 'Memberbase Size' }),
      current: membersData?.pagination?.totalItems || 0,
      max: maxCensusSize,
      color: 'purple',
      tooltip: t('dashboard.usage.memberbase_tooltip', {
        defaultValue: 'Maximum number of members allowed per voting process.',
      }),
    },
  ]

  // Add 2FA metrics if they exist
  if (email2FA > 0) {
    usageMetrics.push({
      icon: LuMail,
      label: t('dashboard.usage.2fa_email', { defaultValue: '2FA Email Codes' }),
      current: usage.sentEmails || 0,
      max: email2FA,
      color: 'green',
      isSoftLimit: true,
      tooltip: t('dashboard.usage.2fa_email_tooltip', {
        defaultValue: 'Email verification codes sent. Exceeding the limit costs €{{price}} per code.',
        price: formattedEmailPrice,
      }),
    })
  }

  if (sms2FA > 0) {
    usageMetrics.push({
      icon: LuMessageSquare,
      label: t('dashboard.usage.2fa_sms', { defaultValue: '2FA SMS Codes' }),
      current: usage.sentSMS || 0,
      max: sms2FA,
      color: 'cyan',
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
    <DashboardBox p={6} height='100%'>
      <VStack align='stretch' spacing={4}>
        <DashboardCardHeader
          title={t('dashboard.usage.plan_usage', { defaultValue: 'Plan Usage' })}
          subtitle={t('dashboard.usage.plan_usage_description', {
            defaultValue: 'Track your current usage against your plan limits',
          })}
        />

        {hasExceededLimit && (
          <Alert
            status='warning'
            variant='left-accent'
            borderRadius='lg'
            py={3}
            px={4}
            bg='orange.50'
            borderColor='orange.400'
            _dark={{
              bg: 'orange.900',
              borderColor: 'orange.500',
            }}
          >
            <AlertIcon color='orange.500' _dark={{ color: 'orange.400' }} />
            <Flex
              flex='1'
              direction={{ base: 'column', md: 'row' }}
              align={{ base: 'flex-start', md: 'center' }}
              gap={3}
            >
              <AlertDescription
                fontSize='sm'
                color='gray.800'
                _dark={{ color: 'gray.100' }}
                fontWeight='medium'
                flex='1'
              >
                {t('dashboard.usage.limit_exceeded_message', {
                  defaultValue:
                    'Your current plan has reached its limits. Upgrade now to continue working without restrictions.',
                })}
              </AlertDescription>
              <Button
                as={ReactRouterLink}
                to={generatePath(Routes.dashboard.settings.subscription)}
                size='sm'
                colorScheme='orange'
                variant='solid'
                flexShrink={0}
                fontWeight='semibold'
              >
                {t('dashboard.usage.upgrade_plan', { defaultValue: 'Upgrade Plan' })}
              </Button>
            </Flex>
          </Alert>
        )}

        <Divider />

        <VStack align='stretch' spacing={4}>
          {usageMetrics.map((metric, index) => (
            <UsageRow key={index} {...metric} />
          ))}
        </VStack>
      </VStack>
    </DashboardBox>
  )
}
