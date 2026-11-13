import { defineSlotRecipe, type SystemStyleObject } from '@chakra-ui/react'
import { avatarAnatomy } from '@chakra-ui/react/anatomy'

// A person is a white disc with a control ring and ink initials. Chakra's three variants each paint their own
// fill and colour, so all of them restate the one look; sizes keep Chakra's names and dimensions.
const disc = {
  root: {
    bg: 'bg.panel',
    color: 'fg',
    boxShadow: 'shadow.control',
    borderWidth: '[0]',
  },
} satisfies Partial<Record<string, SystemStyleObject>>

export const Avatar = defineSlotRecipe({
  slots: avatarAnatomy.keys(),
  base: {
    fallback: { fontWeight: 'semibold' },
  },
  variants: {
    variant: {
      solid: disc,
      subtle: disc,
      outline: disc,
    },
  },
})
