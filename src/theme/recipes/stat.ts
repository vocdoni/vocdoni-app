import { statAnatomy } from '@chakra-ui/react/anatomy'
import { defineSlotRecipe } from '@chakra-ui/react'

// Figures and labelled values (`Stat`), merged over chakra's own stat recipe: a quiet label over
// the value, with an optional faint unit after it. The number stays sans: mono is for small data only.
export const Stat = defineSlotRecipe({
  slots: statAnatomy.keys(),
  base: {
    label: {
      textStyle: 'caption',
      color: 'fg.subtle',
    },
    valueText: {
      fontVariantNumeric: 'tabular-nums',
      fontWeight: 'semibold',
      letterSpacing: 'tight',
      alignItems: 'baseline',
    },
    valueUnit: {
      textStyle: 'body-sm',
      color: 'fg.subtle',
    },
  },
  variants: {
    size: {
      // A labelled field, such as a date on a card.
      sm: { valueText: { textStyle: 'body-sm', fontWeight: 'normal' } },
      md: { valueText: { textStyle: 'body' } },
      // A headline figure.
      lg: { valueText: { textStyle: '2xl' } },
      // The one headline figure of a screen (a vote's turnout): its label as a section title, the unit faint.
      // letterSpacing and weight restate the text style's so the base valueText cannot win by prop order.
      hero: {
        // A quiet 13px label up to `lg`, the section title from `lg`.
        label: {
          textStyle: { base: 'sm', lg: 'section-title' },
          fontWeight: { base: 'medium', lg: 'semibold' },
          color: { base: 'fg.subtle', lg: 'fg' },
        },
        // The unit sits against the figure, a step further from it as the figure grows.
        valueText: { textStyle: 'figure-hero', letterSpacing: 'figure.hero', fontWeight: 'semibold', gap: '0' },
        valueUnit: {
          textStyle: 'figure-hero-unit',
          letterSpacing: 'figure.unit',
          fontWeight: 'medium',
          color: 'fg.subtle',
          ms: { base: '0.5', lg: '1.5' },
        },
      },
    },
  },
  defaultVariants: {
    size: 'lg',
  },
})
