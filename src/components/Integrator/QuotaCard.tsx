import { Badge, Flex, HStack, Progress, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { DashboardBox } from '~components/Dashboard/Contents'

type QuotaCardProps = {
  label: string
  usage: number
  limit: number
}

/**
 * Single quota metric: current usage over its limit with a progress bar. When the metric reaches
 * or exceeds its limit it is visually flagged (red bar + "limit reached" badge).
 */
export const QuotaCard = ({ label, usage, limit }: QuotaCardProps) => {
  const { t } = useTranslation()
  const atLimit = limit > 0 && usage >= limit
  // Cap the visual value at the limit so an over-quota metric still renders a full (not overflowing) bar.
  const value = limit > 0 ? Math.min(usage, limit) : 0

  return (
    <DashboardBox gap={3}>
      <Text fontSize='sm' color='texts.subtle' fontWeight='medium'>
        {label}
      </Text>
      <HStack align='baseline' gap={1}>
        <Text fontSize='3xl' fontWeight='bold' lineHeight='1'>
          {usage}
        </Text>
        <Text fontSize='md' color='texts.subtle'>
          / {limit}
        </Text>
      </HStack>
      <Progress.Root value={value} max={limit > 0 ? limit : 1} size='sm' colorPalette={atLimit ? 'red' : 'blue'}>
        <Progress.Track>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>
      <Flex minH='20px'>
        {atLimit && (
          <Badge colorPalette='red' variant='subtle'>
            {t('integrator.overview.limit_reached', { defaultValue: 'Limit reached' })}
          </Badge>
        )}
      </Flex>
    </DashboardBox>
  )
}
