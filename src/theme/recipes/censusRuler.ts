import { defineSlotRecipe } from '@chakra-ui/react'

// The scale under a turnout bar (ui/CensusRuler): 0 at the start, the census at the end and the count under the
// fill's end. The component places the marker at the fill's share and shifts it left by the same share, so it never
// leaves the bar.
export const CensusRuler = defineSlotRecipe({
  slots: ['scale', 'start', 'end', 'marker'],
  base: {
    scale: { position: 'relative', h: '4', mt: '1.5', textStyle: 'figure', color: 'fg.subtle' },
    start: { position: 'absolute', insetStart: '0', top: '0' },
    end: { position: 'absolute', insetEnd: '0', top: '0' },
    marker: {
      position: 'absolute',
      top: '0',
      color: 'accent.fg',
      fontWeight: 'medium',
      whiteSpace: 'nowrap',
    },
  },
})
