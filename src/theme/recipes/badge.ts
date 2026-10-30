import { defineRecipe, defineStyle } from '@chakra-ui/react'

// `lineHeight: 'inherit'` is deliberate: badges take their line height from the parent. Dropping the key would
// bring back the per-size line height of Chakra's badge text styles, a visible change.

const xs = defineStyle({
  fontSize: 'xs',
  lineHeight: '[inherit]',
  px: '1',
  py: '0.5',
})

const sm = defineStyle({
  fontSize: 'sm',
  lineHeight: '[inherit]',
  px: '2',
  py: '1',
})

const md = defineStyle({
  fontSize: 'md',
  lineHeight: '[inherit]',
  px: '3',
  py: '2',
})

const lg = defineStyle({
  fontSize: 'lg',
  lineHeight: '[inherit]',
  px: '3',
  py: '2',
})

export const Badge = defineRecipe({
  variants: {
    variant: {
      // The ribbon on the featured plan.
      featured: {
        bg: 'card.plan.featured.badge.bg',
        color: 'card.plan.featured.badge.color',
        fontWeight: 'extrabold',
      },
      // A count next to a label, such as a tab's.
      count: {
        colorPalette: 'gray',
        bg: 'colorPalette.subtle',
        color: 'colorPalette.fg',
        borderRadius: 'full',
      },
      // A neutral label showing a raw value (a role name), capitalised. Chakra's `surface` look.
      label: {
        bg: 'colorPalette.subtle',
        color: 'colorPalette.fg',
        boxShadow: '[inset 0 0 0 {borderWidths.hairline} {colors.colorPalette.muted}]',
        textTransform: 'capitalize',
      },
    },
    size: { xs, sm, md, lg },
  },
  // Padding is a `size` value, and sizes apply after the variant.
  compoundVariants: [
    { variant: 'featured', css: { px: '3' } },
    { variant: 'count', css: { px: '1.5' } },
  ],
  defaultVariants: { size: 'xs' },
})
