import { chakra, Icon, Progress, Stat } from '@chakra-ui/react'
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
  children?: ReactNode
}

// The bar's fill: the series colour, the warning tone from 80 % and the critical one at 100 % of a hard limit.
export const usageMeterFill = ({
  value,
  max,
  softLimit,
  color,
}: Pick<UsageMeterProps, 'value' | 'max' | 'softLimit' | 'color'>) => {
  const percentage = max > 0 ? (value / max) * 100 : 0
  if (max > 0 && !softLimit && percentage >= 100) return 'meter.critical'
  if (max > 0 && !softLimit && percentage >= 80) return 'meter.warning'
  return color ?? 'meter.ok'
}

// A usage figure over its limit, with a bar that changes tone as the limit nears.
export const UsageMeter = ({ label, value, max, unit, icon, tooltip, color, softLimit, children }: UsageMeterProps) => {
  const hasLimit = max > 0
  const percentage = hasLimit ? Math.min((value / max) * 100, 100) : 0

  return (
    <Stat.Root gap='2'>
      <Stat.Label>
        {icon && <Icon as={icon} color={color ? `${color}.icon` : undefined} />}
        {label}
        {tooltip && (
          <Tooltip portalled={false} content={tooltip}>
            <chakra.span verticalAlign='middle'>
              <Icon as={InfoIcon} />
            </chakra.span>
          </Tooltip>
        )}
      </Stat.Label>
      <Stat.ValueText>
        {value.toLocaleString()}
        <Stat.ValueUnit>{unit}</Stat.ValueUnit>
      </Stat.ValueText>
      {/* 0.5 % keeps a dot on the track, so an unused meter still reads as a meter. */}
      <Progress.Root value={hasLimit ? Math.max(percentage, 0.5) : 0} size='sm' shape='full'>
        <Progress.Track bg='chart.track'>
          <Progress.Range bgColor={usageMeterFill({ value, max, softLimit, color })} borderRadius='full' />
        </Progress.Track>
      </Progress.Root>
      {children}
    </Stat.Root>
  )
}
