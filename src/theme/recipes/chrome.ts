import { defineRecipe } from '@chakra-ui/react'

// A bar of the app's frame, such as the top bar under `lg` that opens the sidebar: the sidebar's fill, with a hairline
// under it.
export const ChromeBar = defineRecipe({
  base: {
    bg: 'surface.sidebar',
    borderBottom: 'sm',
    borderBottomColor: 'border',
  },
})
