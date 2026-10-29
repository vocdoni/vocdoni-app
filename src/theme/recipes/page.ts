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
      // The other page widths in use, until they are folded into the ones above.
      chrome: { maxW: 'navbar' },
      voting: { maxW: 'voting.contents.max' },
      clients: { maxW: 'content.clients' },
      legal: { maxW: '6xl' },
      summary: { maxW: 'breakpoint-lg' },
      archive: { maxW: '4xl' },
    },
    gutter: {
      page: { px: { base: 2.5, sm: 5, md: 20 } },
      // The public header and footer, which step at other breakpoints.
      chrome: { px: { base: 4, md: 6, xl: 10 } },
      none: {},
    },
  },
  defaultVariants: {
    size: 'wide',
    gutter: 'page',
  },
})
