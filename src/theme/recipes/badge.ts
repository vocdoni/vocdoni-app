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
    size: { xs, sm, md, lg },
  },
  defaultVariants: { size: 'xs' },
})
