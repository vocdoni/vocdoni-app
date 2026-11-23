import { defineSlotRecipe } from '@chakra-ui/react'

// Styles of ui/VideoPlayer's click-to-play preview: a thumbnail filling the frame, with a play button over it.
export const VideoPreview = defineSlotRecipe({
  slots: ['root', 'thumbnail', 'icon'],
  base: {
    root: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      w: 'full',
      h: 'full',
      cursor: 'button',
      borderRadius: 'md',
      bg: 'bg.muted',
      color: 'fg.inverted',
      focusVisibleRing: 'outside',
    },
    thumbnail: {
      position: 'absolute',
      inset: '0',
      boxSize: 'full',
      objectFit: 'cover',
    },
    icon: {
      boxSize: '16',
      bg: 'bg.inverted',
      borderRadius: 'full',
    },
  },
})
