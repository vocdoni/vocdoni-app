import { defineSlotRecipe, defineStyle } from '@chakra-ui/react'
import { progressAnatomy } from '@chakra-ui/react/anatomy'

// Progress of something under way: a 3px track with square ends and a fill that leaves a 2px gap after it (the
// fill's own panel-coloured shadow). No inset shadow, no stripes. The turnout bar is the boards' 4px bar with round
// ends (`radii.bar`).
const track = defineStyle({ shadow: '[none]', bgColor: 'bg.track', borderRadius: 'none' })
const range = defineStyle({
  bgColor: 'colorPalette.solid',
  borderRadius: 'none',
  boxShadow: '[2px 0 0 {colors.bg.panel}]',
})

// A vote result is data, not progress: a thicker track and an ink fill.
const resultsTrack = defineStyle({ shadow: '[none]', bgColor: 'bg.muted', borderRadius: 'none' })
const resultsRange = defineStyle({ bgColor: 'fg', borderRadius: 'none' })

const turnoutTrack = defineStyle({ ...track, borderRadius: 'bar' })
const turnoutRange = defineStyle({ ...range, borderRadius: 'bar' })

// Each look owns its height and shape. Chakra applies the `size` and `shape` axes after `variant`, so they live in
// compound variants, which come last.
export const Progress = defineSlotRecipe({
  slots: progressAnatomy.keys(),
  variants: {
    variant: {
      // A vote result: one bar per choice, its title and tally above it.
      results: { track: resultsTrack, range: resultsRange },
      // The share of the census that voted.
      turnout: { track: turnoutTrack, range: turnoutRange },
      // A usage figure's bar (ui/UsageMeter). The fill colour is the meter's tone, set per use.
      meter: { track, range },
      // A background job, such as the members import.
      job: { track, range },
    },
    // Chakra's stripes are switched off for good; the `striped` prop stays accepted so callers compile.
    striped: { true: { range: { backgroundImage: '[none]' } } },
  },
  compoundVariants: [
    { variant: 'results', css: { track: { h: '1.5', borderRadius: 'none' } } },
    { variant: 'turnout', css: { root: { borderRadius: 'none' }, track: { h: '1', borderRadius: 'bar' } } },
    ...(['meter', 'job'] as const).map((variant) => ({
      variant,
      css: { root: { borderRadius: 'none' as const }, track: { h: '[3px]' as const, borderRadius: 'none' as const } },
    })),
  ],
})
