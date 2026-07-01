import { Badge, Box, HStack, Progress, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { DashboardBox } from '~components/Dashboard/Contents'

export type QuotaCardProps = {
  label: string
  // Both optional: the integrator endpoint may omit a metric, and reports 0 as "unlimited" for the
  // pooled caps. See the IntegratorLimits note in ~queries/integrators — the backend's zero
  // semantics are not uniform, but we mirror the reference dashboard's simple rendering here.
  usage?: number
  limit?: number
}

/** Single quota metric: usage over its limit with a progress bar, flagged when at/over the limit. */
export const QuotaCard = ({ label, usage, limit }: QuotaCardProps) => {
  const { t } = useTranslation()
  const used = usage ?? 0
  const hasLimit = typeof limit === 'number' && limit > 0
  const atLimit = hasLimit && used >= limit
  // limit absent -> just count it ("used"); limit 0 -> "unlimited"; limit > 0 -> "/ N".
  const denominator =
    limit === undefined
      ? t('integrators.quota.used', { defaultValue: 'used' })
      : hasLimit
        ? `/ ${limit}`
        : t('integrators.quota.unlimited', { defaultValue: 'Unlimited' })

  return (
    <DashboardBox gap={3} justifyContent='flex-start'>
      <Text fontSize='sm' color='texts.subtle' fontWeight='medium'>
        {label}
      </Text>
      <HStack align='baseline' gap={1}>
        <Text fontSize='3xl' fontWeight='bold' lineHeight='1'>
          {used}
        </Text>
        <Text fontSize='md' color='texts.subtle'>
          {denominator}
        </Text>
      </HStack>
      <Progress.Root
        value={hasLimit ? Math.min(used, limit) : 0}
        max={hasLimit ? limit : 1}
        size='sm'
        colorPalette={atLimit ? 'red' : 'blue'}
      >
        <Progress.Track>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>
      <Box minH='22px'>
        {atLimit && (
          <Badge colorPalette='red' variant='subtle'>
            {t('integrators.quota.limit_reached', { defaultValue: 'Limit reached' })}
          </Badge>
        )}
      </Box>
    </DashboardBox>
  )
}
