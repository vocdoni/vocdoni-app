import { Badge, type BadgeProps, Tag } from '@chakra-ui/react'
import { statusPalette, type StatusTone } from '~theme/status'

export type StatusBadgeSize = 'xs' | 'sm' | 'md' | 'lg'

export type StatusBadgeProps = Omit<BadgeProps, 'colorPalette' | 'size' | 'variant'> & {
  tone: StatusTone
  size?: StatusBadgeSize
  variant?: 'subtle' | 'surface' | 'solid'
}

/**
 * The status chip: its colour always comes from `statusPalette`. Sizes `sm` and `md` render a Tag and
 * `xs` and `lg` a Badge, since the two elements differ in weight and height.
 */
export const StatusBadge = ({ tone, size = 'xs', variant, children, ...props }: StatusBadgeProps) => {
  const colorPalette = statusPalette[tone]

  if (size === 'sm' || size === 'md') {
    return (
      <Tag.Root colorPalette={colorPalette} size={size} variant={variant} {...props}>
        <Tag.Label>{children}</Tag.Label>
      </Tag.Root>
    )
  }

  if (size === 'lg') {
    return (
      <Badge colorPalette={colorPalette} size='md' fontWeight='bold' fontSize='lg' variant={variant} {...props}>
        {children}
      </Badge>
    )
  }

  return (
    <Badge colorPalette={colorPalette} variant={variant} {...props}>
      {children}
    </Badge>
  )
}
