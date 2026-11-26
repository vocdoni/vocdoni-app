import { Box, Status, type StatusRootProps } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import type { StatusPalette } from '~theme/status'

/** The status palettes (`~theme/status`) plus `gray` for a neutral state. */
export type StatusBadgeColor = StatusPalette | 'gray'

export type StatusBadgeProps = Omit<StatusRootProps, 'colorPalette' | 'size' | 'tone' | 'children'> & {
  colorPalette: StatusBadgeColor
  /** Accepted for old call sites; every variant looks the same now (a dot and a word, never a fill). */
  variant?: 'subtle' | 'surface' | 'solid'
  /** Trailing icon; kept outside the label, which clamps to one line. */
  endElement?: ReactNode
  children?: ReactNode
}

// Info has no colour of its own: only success, a thing to fix and a rejection are coloured.
const TONES = { success: 'success', warning: 'warning', danger: 'danger', info: 'gray', gray: 'gray' } as const

/** The one status marker: a dot and a word, coloured by what the state means. */
export const StatusBadge = ({ colorPalette, variant: _variant, endElement, children, ...props }: StatusBadgeProps) => (
  <Status.Root size='sm' tone={TONES[colorPalette]} {...props}>
    <Status.Indicator />
    <Box as='span' truncate>
      {children}
    </Box>
    {endElement}
  </Status.Root>
)
