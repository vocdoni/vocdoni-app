import { defineRecipe } from '@chakra-ui/react'

// `lineHeight: 'inherit'` is deliberate: it replaces the sizes 'xs'..'lg', which are not line-height tokens. Those
// values were invalid CSS but still displaced the line height of Chakra's own badge text style, so every badge
// inherits its line height. Dropping the key would bring Chakra's per-size line height back (a visible change).

const xs = {
  fontSize: 'xs',
  lineHeight: 'inherit',
  px: 1,
  py: 0.5,
}

const sm = {
  fontSize: 'sm',
  lineHeight: 'inherit',
  px: 2,
  py: 1,
}

const md = {
  fontSize: 'md',
  lineHeight: 'inherit',
  px: 3,
  py: 2,
}

const lg = {
  fontSize: 'lg',
  lineHeight: 'inherit',
  px: 3,
  py: 2,
}

export const Badge = defineRecipe({
  variants: {
    size: { xs, sm, md, lg },
  },
  defaultVariants: { size: 'xs' },
})
