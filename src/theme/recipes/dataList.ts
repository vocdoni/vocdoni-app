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
    },
  },
})
