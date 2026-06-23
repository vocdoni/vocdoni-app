import { defineLayerStyles } from '@chakra-ui/react'

/**
 * Shared layer styles. Apply with `layerStyle="..."`.
 *
 * - `imageOutline`: a hairline edge for content images/avatars/uploads so they read
 *   with consistent depth on any surface. The colour is intentionally pure black
 *   (light) / pure white (dark) at low opacity — a tinted neutral would pick up the
 *   surface underneath and read as dirt on the image edge. Opt-in: use on content
 *   imagery, not on logos or icons. Inset offset keeps the outline inside rounded
 *   corners; `borderRadius: inherit` matches the image's own radius.
 */
export const layerStyles = defineLayerStyles({
  imageOutline: {
    value: {
      outline: '1px solid',
      outlineColor: { _light: 'rgba(0, 0, 0, 0.1)', _dark: 'rgba(255, 255, 255, 0.1)' },
      outlineOffset: '-1px',
      borderRadius: 'inherit',
    },
  },
})

export default layerStyles
