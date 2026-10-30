import { Box, chakra, Flex, HStack, Icon, Progress, Text } from '@chakra-ui/react'
import { ElementType, ReactNode } from 'react'
import { InfoIcon } from '~theme/icons'
import { Tooltip } from './Tooltip'

export type UsageMeterColor = 'chart.1' | 'chart.2' | 'chart.3' | 'chart.4'

export type UsageMeterProps = {
  label: ReactNode
  value: number
  // 0 means there is no limit to measure against: the bar stays empty and never changes tone.
  max: number
  // Muted text after the figure, such as "/ 100" or "used".
  unit: ReactNode
  icon?: ElementType
  tooltip?: string
  // The series colour; the meter's own colour when absent.
  color?: UsageMeterColor
  // Going over costs money but is allowed, so the bar never warns.
  softLimit?: boolean
  // Temporary: the card (integrator quota) and row (plan usage) looks the two meters had.
  layout: 'card' | 'row'
  children?: ReactNode
}

// A usage figure over its limit with a bar that warns at 80 % and turns critical at 100 %.
export const UsageMeter = ({
  label,
  value,
  max,
  unit,
  icon,
  tooltip,
  color,
  softLimit,
  layout,
  children,
}: UsageMeterProps) => {
  const hasLimit = max > 0
  const percentage = hasLimit ? Math.min((value / max) * 100, 100) : 0

  if (layout === 'card') {
    const atLimit = hasLimit && value >= max
    return (
      <>
        <Text textStyle='body-sm' color='fg.muted' fontWeight='medium'>
          {label}
        </Text>
        <HStack align='baseline' gap='1'>
          <Text fontSize='3xl' fontWeight='bold' lineHeight='shorter'>
            {value}
          </Text>
          <Text textStyle='body' color='fg.muted'>
            {unit}
          </Text>
        </HStack>
        <Progress.Root value={hasLimit ? Math.min(value, max) : 0} max={hasLimit ? max : 1} size='sm'>
          <Progress.Track>
            <Progress.Range bgColor={atLimit ? 'meter.critical' : 'meter.ok'} />
          </Progress.Track>
        </Progress.Root>
        {children}
      </>
    )
  }

  // 0.5 % keeps a dot on the track, so an unused meter still reads as a meter.
  const displayPercentage = percentage < 0.5 ? 0.5 : percentage
  const isNearLimit = percentage >= 80 && !softLimit
  const isAtLimit = percentage >= 100 && !softLimit
  const fillColor = isAtLimit ? 'meter.critical' : isNearLimit ? 'meter.warning' : (color ?? 'meter.ok')

  return (
    <Box>
      <Flex justify='space-between' align='center' mb='2'>
        <HStack gap='2'>
          {icon && color && <Icon as={icon} color={`${color}.icon`} />}
          <Text textStyle='body-sm' fontWeight='medium' color='fg'>
            {label}
            {tooltip && (
              <Tooltip portalled={false} content={tooltip}>
                <chakra.span verticalAlign='middle'>
                  <Icon as={InfoIcon} ml='1' />
                </chakra.span>
              </Tooltip>
            )}
          </Text>
        </HStack>
        <HStack gap='2' align='baseline'>
          <Text fontSize='lg' fontWeight='bold' color='fg'>
            {value.toLocaleString()}
          </Text>
          <Text textStyle='body-sm' color='fg.muted'>
            {unit}
          </Text>
        </HStack>
      </Flex>
      <Progress.Root value={displayPercentage} size='sm' shape='full'>
        <Progress.Track bg='chart.track'>
          <Progress.Range bgColor={fillColor} borderRadius='full' />
        </Progress.Track>
      </Progress.Root>
      {children}
    </Box>
  )
}
