import { Tag, type TagRootProps } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { statusPalette, type StatusTone } from '~theme/status'

export type StatusBadgeProps = Omit<TagRootProps, 'colorPalette' | 'size' | 'variant'> & {
  tone: StatusTone
  variant?: 'subtle' | 'surface' | 'solid'
  /** Trailing icon; kept outside the label, which clamps to one line. */
  endElement?: ReactNode
}

/** The one status chip, always small. Its colour comes from `statusPalette`. */
export const StatusBadge = ({ tone, variant = 'subtle', endElement, children, ...props }: StatusBadgeProps) => (
  <Tag.Root colorPalette={statusPalette[tone]} size='sm' variant={variant} {...props}>
    <Tag.Label>{children}</Tag.Label>
    {endElement && <Tag.EndElement>{endElement}</Tag.EndElement>}
  </Tag.Root>
)
