import { defineSlotRecipe, type SystemStyleObject } from '@chakra-ui/react'
import { tabsAnatomy } from '@chakra-ui/react/anatomy'

// The default look: a hairline under the list and a 2px line in the text colour (ink, never the accent) under
// the current tab. Chakra's `line` variant draws the line; this restyles it over the size axis' padding.
const line = {
  root: {
    '--tabs-height': 'auto',
  },
  // One line, edge to edge: a long tab bar scrolls sideways instead of wrapping.
  list: {
    gap: '6',
    flexWrap: 'nowrap',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
  },
  // 44px tall with 15px text up to `lg`, where it is the text and a 10px gap above the line.
  trigger: {
    px: '0',
    pt: '0',
    pb: { base: '0', lg: '2.5' },
    h: { base: 'control.touch', lg: 'auto' },
    flexShrink: '0',
    whiteSpace: 'nowrap',
    textStyle: 'control-tab',
    fontWeight: 'medium',
    color: 'fg.subtle',
    _selected: {
      color: 'fg',
      fontWeight: 'semibold',
      _horizontal: { '--indicator-color': 'colors.fg' },
      _vertical: { '--indicator-color': 'colors.fg' },
    },
  },
} satisfies Partial<Record<string, SystemStyleObject>>

// A segmented control: a recessed track and a raised, ringed current segment.
const pill = {
  root: {
    '--tabs-height': 'auto',
  },
  list: {
    p: '[calc({spacing.1} * 0.75)]', // 3px
    gap: '0.5',
    bg: 'bg.muted',
    borderRadius: 'l2',
    w: 'fit',
    maxWidth: 'full',
    overflowX: 'auto',
  },
  trigger: {
    height: '7',
    py: '0',
    px: '3',
    whiteSpace: 'nowrap',
    borderRadius: 'l1',
    textStyle: 'control',
    fontWeight: 'medium',
    color: 'fg.muted',
    _selected: {
      bg: 'bg.panel',
      color: 'fg',
      fontWeight: 'semibold',
      boxShadow: '[0 0 0 1px {colors.border}]',
    },
  },
  content: {
    borderRadius: 'md',
    p: '6',
  },
} satisfies Partial<Record<string, SystemStyleObject>>

export const Tabs = defineSlotRecipe({
  slots: tabsAnatomy.keys(),
  variants: {
    variant: { line, pill },
  },
  defaultVariants: { variant: 'line' },
})
