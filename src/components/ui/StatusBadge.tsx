import { Badge, type BadgeProps, Tag } from '@chakra-ui/react'
import type { StatusPalette } from '~theme/status'

export type StatusBadgeSize = 'xs' | 'sm' | 'md' | 'lg'

/** The status palettes (`~theme/status`) plus `gray` for a neutral chip. */
export type StatusBadgeColor = StatusPalette | 'gray'

export type StatusBadgeProps = Omit<BadgeProps, 'colorPalette' | 'size' | 'variant'> & {
  colorPalette: StatusBadgeColor
  size?: StatusBadgeSize
  variant?: 'subtle' | 'surface' | 'solid'
}

/**
 * The status chip, coloured by a status palette. Sizes `sm` and `md` render a Tag and `xs` and `lg` a
 * Badge, since the two elements differ in weight and height.
 */
export const StatusBadge = ({ colorPalette, size = 'xs', variant, children, ...props }: StatusBadgeProps) => {
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
