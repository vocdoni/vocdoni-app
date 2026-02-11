import { defineSlotRecipe } from '@chakra-ui/react'
import { tableAnatomy } from '@chakra-ui/react/anatomy'

const striped = {
  root: {
    borderBottom: 'none',
    overflow: 'hidden',
    bgColor: 'table.bg.light',

    _dark: {
      bgColor: 'table.bg.dark',
    },
  },

  header: {
    bgColor: 'table.thead.bg_light',
    _dark: {
      bgColor: 'table.thead.bg_dark',
      borderColor: 'table.border_color.dark',
    },
  },

  body: {
    'tr:nth-of-type(2n+1) td': {
      bgColor: 'table.variant.striped.light.tr_odd',
      _dark: {
        bgColor: 'table.variant.striped.dark.tr_odd',
      },
    },
    'tr:nth-of-type(2n) td': {
      bgColor: 'table.variant.striped.light.tr_even',
      _dark: {
        bgColor: 'table.variant.striped.dark.tr_even',
      },
    },

    tr: {
      _hover: {
        '& > td': {
          bgColor: 'table.variant.striped.light.hover !important',

          _dark: {
            bgColor: 'table.variant.striped.dark.hover !important',
          },
        },
      },
    },
  },

  columnHeader: {
    textTransform: 'initial',
    borderBottomColor: 'table.variant.striped.light.border',
    _dark: {
      borderBottomColor: 'table.variant.striped.dark.border',
    },
  },

  cell: {
    fontWeight: 'normal',
    borderBottom: 'none',
  },
}

const simple = {
  root: {
    overflow: 'auto',
  },
  header: {
    backgroundColor: 'gray.100',
    _dark: {
      backgroundColor: 'brand.800',
    },

    '&#section-header': {
      backgroundColor: 'gray.50',
      _dark: {
        backgroundColor: 'brand.700',
      },
    },
  },
  row: {
    ['td,th']: {
      borderBottom: '1px solid',
      borderColor: 'table.border',
    },
  },
  columnHeader: {
    px: 4,
    color: 'black',
    _dark: { color: 'white' },
    fontWeight: '500',
    '&[data-is-numeric=true]': {
      textAlign: 'right',
    },
    textTransform: 'none',
  },
  cell: {
    fontSize: '14px',
    px: 4,
    '&[data-is-numeric=true]': {
      textAlign: 'right',
    },
  },
}

export const Table = defineSlotRecipe({
  slots: tableAnatomy.keys(),
  variants: {
    variant: {
      striped,
      simple,
    },
  },
})
