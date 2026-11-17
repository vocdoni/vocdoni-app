import { defineStyle } from '@chakra-ui/react'

// A control drawn smaller than a fingertip (the voter's 22px language tag, a receipt code) keeps a 44px hit area: an
// invisible layer centred on it, as tall and as wide as the touch target, takes the tap without moving the layout.
// On a control that is already that large the layer sits inside it.
export const touchTarget = defineStyle({
  position: 'relative',
  _before: {
    content: '""',
    position: 'absolute',
    inset: '[calc((100% - {sizes.control.touch}) / 2)]',
  },
})
