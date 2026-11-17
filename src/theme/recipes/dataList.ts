import { dataListAnatomy } from '@chakra-ui/react/anatomy'
import { defineSlotRecipe } from '@chakra-ui/react'

// Labelled values in rows (ui/FactList): label left, value right, rows split by a quiet rule.
export const DataList = defineSlotRecipe({
  slots: dataListAnatomy.keys(),
  variants: {
    variant: {
      facts: {
        root: { gap: '0' },
        item: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: '4',
          py: '1.5',
          textStyle: 'control',
          _notFirst: { borderTopWidth: 'hairline', borderColor: 'border.muted' },
        },
        itemLabel: { color: 'fg.subtle', minW: '0' },
        itemValue: { flex: '0 1 auto', justifyContent: 'flex-end', textAlign: 'end', fontWeight: 'medium' },
      },
      // Facts that fill a card under its title (the ballot's "How voting works"): every row under a rule and padded
      // to the card's edge, the label as a quiet note.
      ruled: {
        root: { gap: '0' },
        item: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: '4',
          py: { base: '3', lg: '2.5' },
          px: { base: '4', md: 'card' },
          borderTopWidth: 'hairline',
          borderColor: 'border.muted',
        },
        // The label keeps its line; a long value wraps under itself instead.
        itemLabel: {
          fontSize: { base: 'md', lg: 'sm' },
          lineHeight: 'moderate',
          color: 'fg.subtle',
          minW: '0',
          flexShrink: '0',
        },
        itemValue: {
          flex: '0 1 auto',
          justifyContent: 'flex-end',
          textAlign: 'end',
          fontSize: { base: 'item', md: 'md' },
          lineHeight: 'moderate',
          fontWeight: 'medium',
        },
      },
      // A vote's facts: a grid of label over value (two columns on a phone, four on a tablet) under a rule, and the
      // `facts` rows from `lg`, where they sit beside the headline figure.
      summary: {
        root: {
          display: { base: 'grid', lg: 'flex' },
          flexDirection: 'column',
          gridTemplateColumns: { base: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
          columnGap: '4',
          rowGap: { base: '3.5', lg: '0' },
          pt: { base: '4', lg: '0' },
          borderTopWidth: { base: 'hairline', lg: '[0]' },
          borderColor: 'border',
        },
        item: {
          display: 'flex',
          flexDirection: { base: 'column', lg: 'row' },
          justifyContent: { base: 'flex-start', lg: 'space-between' },
          alignItems: { base: 'flex-start', lg: 'baseline' },
          gap: { base: '0', lg: '4' },
          py: { base: '0', lg: 'fact' },
          // From `lg` every row has its rule, the first one clear, so each row is as tall as the board's.
          borderTopWidth: { base: '[0]', lg: 'hairline' },
          borderColor: 'border.muted',
          _first: { borderColor: 'transparent' },
        },
        itemLabel: { color: 'fg.subtle', minW: '0', textStyle: { base: 'body-sm', lg: 'control' } },
        itemValue: {
          flex: '0 1 auto',
          textAlign: { base: 'start', lg: 'end' },
          justifyContent: { base: 'flex-start', lg: 'flex-end' },
          fontWeight: 'medium',
          textStyle: { base: 'fact-value', lg: 'control' },
        },
      },
    },
  },
})
