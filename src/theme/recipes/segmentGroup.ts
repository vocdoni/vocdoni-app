import { defineSlotRecipe, type SystemStyleObject } from '@chakra-ui/react'
import { segmentGroupAnatomy } from '@chakra-ui/react/anatomy'

// A sunken track holding 28px segments; the chosen one is a lighter fill with a 1px ring. One size, whatever the prop.
const size: Record<string, SystemStyleObject> = { item: { height: '7', px: '3', gap: '2', textStyle: 'control' } }

export const SegmentGroup = defineSlotRecipe({
  slots: segmentGroupAnatomy.keys(),
  base: {
    root: {
      '--segment-radius': 'radii.l1',
      borderRadius: 'l2',
      p: 'track',
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
        bg: 'segment.selected',
      },
    },
    indicator: {
      '--segment-indicator-bg': 'colors.segment.selected',
      shadow: '[0 0 0 {borderWidths.hairline} {colors.border}]',
    },
  },
  variants: {
    size: { xs: size, sm: size, md: size, lg: size },
  },
})
