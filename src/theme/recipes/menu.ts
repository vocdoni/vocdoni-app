import { menuAnatomy } from '@chakra-ui/react/anatomy'
import { defineSlotRecipe, type SystemStyleObject } from '@chakra-ui/react'

const baseStyle = {
  content: {
    p: '1',
    borderRadius: 'l2',
    boxShadow: 'shadow.raised',
    bg: 'surface.raised',
  },
  item: {
    bg: 'surface.raised',
    _selected: {
      bg: 'state.selected.bg',
      color: 'state.selected.fg',
    },
  },

  separator: {
    m: '0',
  },
} satisfies Partial<Record<string, SystemStyleObject>>

// Items are rows with a control label, 52px on a phone, 40px on a tablet and 32px from `lg`, with 16px, 14px and
// 13.5px text (`control-input`); Chakra's sizes set their padding and text after the base.
const item = {
  textStyle: 'control-input',
  py: '1',
  minH: { base: 'control.row', md: 'control.tablet', lg: '8' },
} as const

// Highlight under the pointer or the keyboard (Ark menu items are highlighted, never focused).
const highlight = { _highlighted: { bg: 'state.hover.bg', color: 'state.hover.fg' } } as const

export const Menu = defineSlotRecipe({
  slots: menuAnatomy.keys(),
  base: baseStyle,
  variants: {
    size: {
      sm: { item },
      md: { item },
    },
    variant: {
      // Chakra's default variant: items are highlighted (pointer or keyboard), never focused.
      subtle: {
        item: {
          ...highlight,
          // After `_highlighted`, so a selected item keeps its fill under the pointer.
          _selected: {
            bg: 'state.selected.bg',
            color: 'state.selected.fg',
          },
        },
      },
      // A list of actions (ui/ResponsiveMenu's dropdown, from `md`): see the compound variant below.
      actions: {
        item: {
          _highlighted: { bg: 'state.hover.bg' },
        },
      },
    },
  },
  // The boards' action menu, after the sizes so it keeps its own rows. On a tablet a 200px menu of 40px rows with
  // 18px icons; from `lg` a 252px menu of 34px rows without icons, a halo around its ring and a rule before the
  // destructive items. A destructive item (`data-danger`) is in the danger colour, its icon too.
  compoundVariants: [
    {
      variant: 'actions',
      css: {
        content: {
          w: { base: 'menu', lg: 'menu.wide' },
          minW: '0',
          p: '1',
          borderRadius: 'md',
          boxShadow: { base: 'shadow.raised', lg: 'shadow.raised.halo' },
        },
        item: {
          minH: '0',
          h: { base: 'control.tablet', lg: 'control.md' },
          py: '0',
          px: '2.5',
          gap: { base: '3', lg: '2' },
          borderRadius: 'sm',
          fontWeight: 'medium',
          color: 'fg',
          _icon: { boxSize: '4.5', color: 'fg.subtle', display: { base: 'block', lg: 'none' } },
          '&[data-danger]': { color: 'danger.action', _icon: { color: 'danger.action' } },
        },
        separator: {
          display: { base: 'none', lg: 'block' },
          h: '0',
          // 4px above and below, out to the menu's edges. As `m`: Chakra emits the base's `m: 0` after any longhand.
          m: '[{spacing.1} calc({spacing.1} * -1)]',
          bg: 'transparent',
          borderTopWidth: 'hairline',
          borderTopColor: 'border',
        },
      },
    },
  ],
})
