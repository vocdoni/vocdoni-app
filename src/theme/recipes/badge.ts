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
  // The stock variants read the page palette, which is the accent: a chip stays neutral unless asked otherwise.
  base: { colorPalette: 'gray' },
  variants: {
    variant: {
      // A count next to a label, such as a tab's: a bare figure, no fill.
      count: {
        colorPalette: 'gray',
        textStyle: 'figure',
        bg: 'transparent',
        color: 'fg.subtle',
      },
      // A neutral label showing a raw value (a role name), capitalised.
      label: {
        bg: 'bg.muted',
        color: 'fg.muted',
        textTransform: 'capitalize',
      },
    },
    size: { xs, sm, md, lg },
  },
  // Padding is a `size` value, and sizes apply after the variant.
  compoundVariants: [{ variant: 'count', css: { px: '0' } }],
  defaultVariants: { size: 'xs' },
})

// `Code` shares Chakra's badge variants, so it needs the same neutral default.
export const Code = defineRecipe({
  base: { colorPalette: 'gray' },
})
