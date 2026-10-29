import { Tag, type TagRootProps } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import type { StatusPalette } from '~theme/status'

/** The status palettes (`~theme/status`) plus `gray` for a neutral chip. */
export type StatusBadgeColor = StatusPalette | 'gray'

export type StatusBadgeProps = Omit<TagRootProps, 'colorPalette' | 'size' | 'variant'> & {
  colorPalette: StatusBadgeColor
  variant?: 'subtle' | 'surface' | 'solid'
  /** Trailing icon; kept outside the label, which clamps to one line. */
  endElement?: ReactNode
}

/** The one status chip, always small, coloured by a status palette. */
export const StatusBadge = ({ colorPalette, variant = 'subtle', endElement, children, ...props }: StatusBadgeProps) => (
  <Tag.Root colorPalette={colorPalette} size='sm' variant={variant} {...props}>
    <Tag.Label>{children}</Tag.Label>
    {endElement && <Tag.EndElement>{endElement}</Tag.EndElement>}
  </Tag.Root>
)
