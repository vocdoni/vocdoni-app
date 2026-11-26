import { defineSlotRecipe } from '@chakra-ui/react'
import { tableAnatomy } from '@chakra-ui/react/anatomy'

// Rows are told apart by a hairline on top (Chakra's `outline` draws one underneath, which this replaces).
const rowTopRule = {
  '&:not(:last-of-type)': { borderBottomWidth: '[0]' },
  '&:not(:first-of-type)': { borderTopWidth: 'hairline', borderColor: 'border' },
}

export const Table = defineSlotRecipe({
  slots: tableAnatomy.keys(),
  base: {
    caption: {
      p: '4',
    },
    // Quiet headers: small, medium weight, no fill.
    columnHeader: {
      textStyle: 'xs',
      fontWeight: 'medium',
      color: 'fg.subtle',
    },
    // The selected row: accent tint and a 2px line on its left.
    row: {
      _selected: {
        bg: 'accent.subtle',
        boxShadow: '[inset 2px 0 0 {colors.accent.line}]',
      },
    },
  },
  variants: {
    variant: {
      line: {
        cell: { borderBottomWidth: '[0]' },
        row: rowTopRule,
      },
      outline: {
        header: { bg: 'transparent' },
        row: rowTopRule,
      },
    },
    // Chakra's sizes set the cell padding after the base, so the 10px rows live here.
    size: {
      md: { columnHeader: { py: '2.5' }, cell: { py: '2.5' } },
      lg: { columnHeader: { py: '2.5' }, cell: { py: '2.5' } },
    },
    // Chakra's own `interactive` hover reads the color palette, not the shared state tokens.
    interactive: {
      true: {
        body: {
          '& tr': {
            _hover: {
              bg: 'state.hover.bg',
            },
          },
        },
      },
    },
    // Opt-in: the same hover and selection on rows that are not `interactive`.
    rowStates: {
      true: {
        row: {
          _hover: {
            bg: 'state.hover.bg',
          },
          _selected: {
            bg: 'accent.subtle',
          },
        },
      },
    },
  },
})
