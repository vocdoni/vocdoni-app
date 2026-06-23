import { defineSlotRecipe } from '@chakra-ui/react'
import { tabsAnatomy } from '@chakra-ui/react/anatomy'

const card = {
  list: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    columnGap: '5%',
    rowGap: 8,
    '& > div': {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: 5,
    },
    bgColor: 'transparent',
  },
  trigger: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'start',
    alignItems: 'start',
    gap: 2,
    flex: { md: '0 0 30%' },
    p: 4,
    px: 6,
    boxShadow: 'var(--box-shadow)',
    bgColor: 'tab.variant.card.bg.light',
    borderBottom: 'none',
    borderRadius: 'xl',
    w: 'full',

    '& > svg': {
      w: 5,
      h: 5,
      color: 'tab.variant.card.svg',
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      display: 'none',
    },

    _selected: {
      boxShadow: 'var(--box-shadow)',
      '& > svg': {
        display: 'block',
      },
      '& > .empty': {
        display: 'none',
      },
      _dark: {
        boxShadow: 'var(--box-shadow-dark-mode)',
      },
    },
    _hover: {
      boxShadow: 'none',
    },
    _dark: {
      bgColor: 'tab.variant.card.bg.dark',
      boxShadow: 'none',
    },
    '&:nth-of-type(2)': {
      mr: 'auto',
    },
  },
  content: {
    bgColor: 'tab.variant.card.bg.light',
    borderRadius: 'xl',
    _dark: {
      bgColor: 'tab.variant.card.bg.dark',
    },
  },
}

const settings = {
  root: {
    '--tabs-height': 'auto',
  },
  list: {
    p: 1,
    bgColor: 'tabs.bg',
    borderRadius: 'lg',
    w: 'fit-content',
    maxWidth: 'full',
    overflowX: 'auto',
  },
  trigger: {
    py: 1.5,
    px: 3,
    whiteSpace: 'nowrap',
    // Concentric with the list: outer `lg` (10px) − `p={1}` (4px) padding = 6px (`sm`).
    borderRadius: 'sm',
    fontWeight: 'medium',
    color: 'tabs.tab.color',
    fontSize: 'sm',
    _selected: {
      bgColor: 'tabs.tab.active.bg',
      color: 'tabs.tab.active.color',
      boxShadow: '0 1px 3px 0 #0000001a,0 1px 2px -1px #0000001a',
    },
  },
  content: {
    borderRadius: 'md',
    p: 6,
  },
}

export const Tabs = defineSlotRecipe({
  slots: tabsAnatomy.keys(),
  variants: {
    variant: { card, settings },
  },
  defaultVariants: { variant: 'settings' },
})
