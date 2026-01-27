import { accordionAnatomy } from '@chakra-ui/react/anatomy'
import { defineSlotRecipe } from '@chakra-ui/react'

const dashboard = {
  itemTrigger: {
    borderRadius: 'xl',
    bg: 'dashboard.sidebar.bg.light',
    border: 'var(--border)',
    boxShadow: 'sm',
    _dark: { bg: 'dashboard.sidebar.bg.dark', boxShadow: '0 0 10px #101010' },
    p: 4,
  },
  root: {
    border: 'none',
  },
  itemContent: {
    border: 'none',
    _dark: {},
  },
  itemIndicator: {
    _dark: {},
  },
}

export const Accordion = defineSlotRecipe({
  slots: accordionAnatomy.keys(),
  variants: {
    variant: { dashboard },
  },
})
