import { defineSlotRecipe, defineStyle } from '@chakra-ui/react'
import { progressAnatomy } from '@chakra-ui/react/anatomy'

// Chakra's `outline` look, which both variants start from.
const track = defineStyle({ shadow: 'inset', bgColor: 'bg.muted' })
const range = defineStyle({ bgColor: 'colorPalette.solid' })

const stripe = '{colors.progress.stripe}'

// Each look owns its height and shape. Chakra applies the `size` and `shape` axes after `variant`, so they live in
// compound variants, which come last.
export const Progress = defineSlotRecipe({
  slots: progressAnatomy.keys(),
  variants: {
    variant: {
      // A vote result: one bar per choice, its title and tally above it.
      results: { track, range },
      // The share of the census that voted.
      turnout: {
        track,
        range: {
          ...range,
          backgroundImage: `[linear-gradient(45deg, ${stripe} 25%, transparent 25%, transparent 50%, ${stripe} 50%, ${stripe} 75%, transparent 75%, transparent)]`,
          backgroundSize: '[{sizes.4} {sizes.4}]',
        },
      },
    },
  },
  compoundVariants: [
    { variant: 'results', css: { track: { h: '2' } } },
    { variant: 'turnout', css: { track: { h: '3', borderRadius: 'full' } } },
  ],
})
