import { defineSlotRecipe } from '@chakra-ui/react'
import { choiceCardAnatomy } from '~components/vocdoni-ui/theming/anatomy'

const baseStyle = {
  item: {
    borderRadius: 'md',
    borderWidth: '1px',
    borderColor: 'gray.200',
    _dark: { borderColor: 'brand.700' },
    overflow: 'hidden',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
    bg: 'transparent',
    '&[data-state="checked"]': {
      borderColor: 'black',
      _dark: { borderColor: 'white' },
    },
    '&[data-disabled="true"]': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
  control: {
    flexShrink: 0,
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    minW: 0,
  },
  media: {
    width: '100%',
    display: 'block',
  },
}

const list = {
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    p: 3,
  },
  body: {
    flex: 1,
  },
}

const grid = {
  item: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    position: 'relative',
    p: 0,
  },
  control: {
    position: 'absolute',
    top: 2,
    right: 2,
    zIndex: 'docked',
    bg: 'white',
    borderRadius: 'full',
    borderWidth: '1px',
    borderColor: 'table.border',
    boxShadow: 'sm',
    _dark: { bg: 'gray.800' },
  },
  body: {
    p: 4,
    flex: 1,
  },
  media: {
    overflow: 'hidden',
  },
}

export const ChoiceCard = defineSlotRecipe({
  slots: choiceCardAnatomy,
  base: baseStyle,
  variants: {
    layout: { list, grid },
  },
  defaultVariants: {
    layout: 'list',
  },
})
