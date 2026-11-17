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
    },
  },
})
