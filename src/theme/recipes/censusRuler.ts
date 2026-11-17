import { defineSlotRecipe } from '@chakra-ui/react'

// A turnout bar and its scale (ui/CensusRuler), as the votes boards draw it. From `lg` the box is 30px: the 4px track
// 4px from the top (room for the 12px quorum mark), then the labels 6px under it on a 16px line. Below `lg` the track
// sits at the top and the labels 8px under it (the phone board). The component places the quorum (its share), which
// is data, not look.
//
// 0 and the total are always shown.
export const CensusRuler = defineSlotRecipe({
  slots: ['root', 'track', 'range', 'quorum', 'scale', 'start', 'end', 'quorumLabel'],
  base: {
    root: { position: 'relative', w: 'full' },
    track: { mt: { base: '0', lg: '1' } },
    // The quorum: a dashed 12px tick centred on the track.
    quorum: {
      position: 'absolute',
      top: { base: '-1', lg: '0' },
      h: '3',
      borderInlineStartWidth: 'hairline',
      borderStyle: '[dashed]',
      borderColor: 'fg',
    },
    scale: {
      position: 'relative',
      h: '4',
      mt: { base: '2', lg: '1.5' },
      textStyle: 'figure',
      lineHeight: '[1rem]',
      color: 'fg.subtle',
      whiteSpace: 'nowrap',
    },
    start: { position: 'absolute', insetStart: '0', top: '0' },
    end: { position: 'absolute', insetEnd: '0', top: '0' },
    quorumLabel: {
      position: 'absolute',
      top: '0',
      transform: '[translateX(-50%)]',
    },
  },
  variants: {
    // `scale` prints 0, the total and the quorum; `compact` is the bar alone (12px tall from `lg`), for a
    // strip or a row. Responsive values work: `{ base: 'scale', lg: 'compact' }`.
    layout: {
      scale: {},
      compact: { root: { pb: { base: '0', lg: '1' } }, scale: { display: 'none' } },
    },
    // A finished vote: the fill in ink instead of the accent.
    closed: {
      true: { range: { bgColor: 'fg' } },
      false: {},
    },
  },
  defaultVariants: { layout: 'scale', closed: false },
})
