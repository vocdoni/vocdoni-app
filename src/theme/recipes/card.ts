import { cardAnatomy } from '@chakra-ui/react/anatomy'
import { defineSlotRecipe } from '@chakra-ui/react'

const listItem = {
  root: {
    w: 'full',
    bgColor: 'transparent',
    border: '{borderWidths.hairline} solid',
    borderColor: 'border',
    p: 4,
    gap: 2,
  },
  header: {
    p: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 2,
  },
  body: {
    p: 0,
    gap: 1,
    fontSize: 'sm',
    color: 'fg.muted',
  },
}

// Cards are named by what they are for. Radius comes from Chakra's base (`l3`) unless a variant sets
// its own; `size` sets `--card-padding`, which the variants that pad their root read.
export const Card = defineSlotRecipe({
  slots: cardAnatomy.keys(),
  variants: {
    variant: {
      // Chakra's filled card; fill and elevation come from the surface roles.
      outline: {
        root: {
          bg: 'surface.card',
          boxShadow: 'shadow.card',
        },
      },
      // A bordered region of a page. Unfilled, so it shows whatever holds it; padded on the root, so its
      // content goes straight in, without Card.Body.
      section: {
        root: {
          borderWidth: 'hairline',
          borderColor: 'border',
          boxShadow: 'shadow.card',
          p: 'var(--card-padding)',
        },
      },
      // A border around content that spaces itself, such as a table.
      frame: {
        root: {
          borderWidth: 'hairline',
          borderColor: 'border',
        },
      },
      // A recessed panel inside a form or card, told apart by its fill instead of a border.
      sunken: {
        root: {
          bg: 'surface.sunken',
          p: 'var(--card-padding)',
        },
      },
      // A card that stays dark in both colour modes.
      inverse: {
        root: {
          bg: 'surface.inverse',
          color: 'surface.inverse.fg',
        },
      },
      // A notice outlined in the brand colour, such as a paused process.
      highlight: {
        root: {
          color: 'brand.fg',
          borderWidth: 'hairline',
          borderColor: 'brand.fg',
          p: 'var(--card-padding)',
          _dark: {
            color: 'white',
          },
        },
      },
      // One entry of a list shown as cards, the small-screen form of a table.
      'list-item': listItem,
      // A page whose whole content is one card, such as the sign-in forms.
      standalone: {
        root: {
          bgColor: 'auth.card.bg',
          _light: {
            borderWidth: 'hairline',
            borderColor: 'auth.card.border',
          },
        },
      },
      // A file drop target. A control rather than a card, so it keeps its own radius and padding; set
      // `data-dragging` while a file is over it.
      dropzone: {
        root: {
          borderWidth: 'hairline',
          borderStyle: 'dashed',
          borderColor: 'border',
          borderRadius: 'xl',
          p: 10,
          cursor: 'pointer',
          _dragging: {
            borderColor: 'border.emphasized',
          },
        },
      },
      // A filled card without a border, around a page-level empty state.
      plain: {
        root: {
          bgColor: 'bg.panel',
        },
      },
    },
  },
})
