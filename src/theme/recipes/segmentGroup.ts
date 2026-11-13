import { defineSlotRecipe } from '@chakra-ui/react'
import { segmentGroupAnatomy } from '@chakra-ui/react/anatomy'

// A sunken track holding 28px segments; the chosen one is a panel with a 1px ring. One size, whatever the prop.
const size = { item: { height: '7', px: '3', gap: '2', textStyle: 'control' } }

export const SegmentGroup = defineSlotRecipe({
  slots: segmentGroupAnatomy.keys(),
  base: {
    root: {
      '--segment-radius': 'radii.l1',
      borderRadius: 'l2',
      p: '[3px]',
      boxShadow: '[none]',
      bg: 'bg.muted',
    },
    item: {
      color: 'fg.muted',
      fontWeight: 'medium',
      // No divider lines between segments.
      _before: { display: 'none' },
      '&[data-state=checked]': { color: 'fg', fontWeight: 'semibold' },
      '&[data-state=checked][data-ssr]': {
        boxShadow: '[0 0 0 {borderWidths.hairline} {colors.border}]',
        bg: 'bg.panel',
      },
    },
    indicator: {
      '--segment-indicator-bg': 'colors.bg.panel',
      shadow: '[0 0 0 {borderWidths.hairline} {colors.border}]',
    },
  },
  variants: {
    size: { xs: size, sm: size, md: size, lg: size },
  },
})
