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
  // In dark the fill is the palette's text colour: the solid blue reads 2.4:1 on the dark track.
  _dark: { bgColor: 'colorPalette.fg' },
})

// A vote result is data, not progress: a thicker track and an ink fill.
const resultsTrack = defineStyle({ shadow: '[none]', bgColor: 'bg.muted', borderRadius: 'none' })
const resultsRange = defineStyle({ bgColor: 'fg', borderRadius: 'none' })

const turnoutTrack = defineStyle({ ...track, borderRadius: 'bar' })
const turnoutRange = defineStyle({ ...range, borderRadius: 'bar' })

// The voter's step progress (ui/StepProgress): a 3px line in the palette's fill with square ends, on no track of its
// own (the strip's bottom rule shows through) and with no gap after the fill. A bar, so the colour is exact, unedged.
const lineTrack = defineStyle({ shadow: '[none]', bgColor: 'transparent', borderRadius: 'none' })
const lineRange = defineStyle({ bgColor: 'colorPalette.solid', borderRadius: 'none', boxShadow: '[none]' })

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
      // The voter's step progress on the strip's bottom rule.
      line: { track: lineTrack, range: lineRange },
    },
    // Chakra's stripes are switched off for good; the `striped` prop stays accepted so callers compile.
    striped: { true: { range: { backgroundImage: '[none]' } } },
  },
  compoundVariants: [
    { variant: 'results', css: { track: { h: '1.5', borderRadius: 'none' } } },
    { variant: 'turnout', css: { root: { borderRadius: 'none' }, track: { h: '1', borderRadius: 'bar' } } },
    { variant: 'line', css: { root: { borderRadius: 'none' }, track: { h: 'bar.thin', borderRadius: 'none' } } },
    ...(['meter', 'job'] as const).map((variant) => ({
      variant,
      css: { root: { borderRadius: 'none' as const }, track: { h: '[3px]' as const, borderRadius: 'none' as const } },
    })),
  ],
})
