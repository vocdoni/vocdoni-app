import { defineRecipe, defineSlotRecipe } from '@chakra-ui/react'

// The rank before an option of a ranked question on the voter page (ui/RankBadge, board V4VoterWide 6): a 32px square
// with 6px corners and the position in mono. Still to give, it is the next free position ringed in the track grey;
// given (`set`), it fills with the vote's colour, edged when that colour is too pale for the page.
export const RankBadge = defineRecipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxSize: '8',
    borderRadius: 'md',
    textStyle: 'ballot-rank',
    fontWeight: 'medium',
    color: 'fg.subtle',
    boxShadow: 'shadow.mark',
  },
  variants: {
    set: {
      true: { bg: 'accent.solid', color: 'accent.contrast', boxShadow: 'shadow.edge.inner' },
      false: {},
    },
  },
  defaultVariants: { set: false },
})

// The disc over a vote that landed (ui/SuccessDisc): 48px, 56px from `lg`, in the live green with a 28px white tick.
// A status colour: it never takes the vote's colour.
export const SuccessDisc = defineSlotRecipe({
  slots: ['root', 'icon'],
  base: {
    root: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      boxSize: { base: '12', lg: '14' },
      borderRadius: 'full',
      bg: 'status.success.solid',
      color: 'status.success.contrast',
    },
    icon: { boxSize: '7' },
  },
})
