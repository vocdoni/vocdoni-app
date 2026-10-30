import { defineRecipe } from '@chakra-ui/react'

// Styles of ui/PageContainer, read by import. Gutters live here and not in tokens, because a token
// cannot change per breakpoint.
export const PageContainer = defineRecipe({
  base: {
    mx: 'auto',
  },
  variants: {
    size: {
      wide: { maxW: 'content.wide' },
      medium: { maxW: 'content.medium' },
      narrow: { maxW: 'content.narrow' },
    },
    gutter: {
      // Shared by the public header, content and footer, so their edges line up.
      page: { px: { base: 2.5, sm: 5, md: 20 } },
      none: {},
    },
  },
  defaultVariants: {
    size: 'wide',
    gutter: 'page',
  },
})
