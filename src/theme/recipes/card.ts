import { cardAnatomy } from '@chakra-ui/react/anatomy'
import { defineSlotRecipe, type SystemStyleObject } from '@chakra-ui/react'

const listItem = {
  root: {
    w: 'full',
    bgColor: 'surface.card',
    border: '[{borderWidths.hairline} solid]',
    borderColor: 'border',
    p: '4',
    gap: '2',
  },
  // The base pads with `px`, `pt`/`pb` and `py`: override those same keys, since a `p` is emitted before them.
  header: {
    px: '0',
    pt: '0',
    pb: '0',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '2',
  },
  body: {
    px: '0',
    py: '0',
    gap: '1',
    fontSize: 'sm',
    color: 'fg.muted',
    // The base draws a hairline above every body after the first; a list item has its own ring instead.
    _notFirst: { borderTopWidth: '[0]' },
  },
} satisfies Partial<Record<string, SystemStyleObject>>

const title = { textStyle: 'control', fontWeight: 'medium-plus' } as const

// Cards are named by what they are for. Radius comes from Chakra's base (`l3`) unless a variant sets
// its own; `size` sets `--card-padding`, which the variants that pad their root read.
// The 1px border is the card's ring, so none of the variants adds a shadow. Every card paints its own fill: the
// dashboard page is grey, so a card that left its background unset would vanish into it.
export const Card = defineSlotRecipe({
  slots: cardAnatomy.keys(),
  base: {
    header: { px: '5', pt: '4', pb: '3' },
    // Rows after the header are told apart by a hairline.
    body: { px: '5', py: '3.5', _notFirst: { borderTopWidth: 'hairline', borderColor: 'border' } },
    footer: { px: '5', pb: '4' },
  },
  variants: {
    // Chakra's sizes only set the title style and `--card-padding`; every title is a control label.
    size: {
      sm: { title: title },
      md: { title: title },
      lg: { title: title },
    },
    variant: {
      // Chakra's filled card; fill and elevation come from the surface roles.
      outline: {
        root: {
          bg: 'surface.card',
        },
      },
      // A bordered region of a page, padded on the root, so its content goes straight in, without Card.Body.
      // Filled like every card, since the dashboard page behind it is grey.
      section: {
        root: {
          bg: 'surface.card',
          borderWidth: 'hairline',
          borderColor: 'border',
          p: 'var(--card-padding)',
        },
      },
      // A border around content that spaces itself, such as a table.
      frame: {
        root: {
          bg: 'surface.card',
          borderWidth: 'hairline',
          borderColor: 'border',
        },
      },
      // A tinted block inside a form or card: a faint fill with the hairline.
      sunken: {
        root: {
          bg: 'bg.subtle',
          borderWidth: 'hairline',
          borderColor: 'border',
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
      // A notice on the accent tint, outlined in the accent, such as a paused process.
      highlight: {
        root: {
          bg: 'accent.subtle',
          color: 'accent.fg',
          borderWidth: 'hairline',
          borderColor: 'accent.line',
          p: 'var(--card-padding)',
        },
      },
      // One entry of a list shown as cards, the small-screen form of a table.
      // `size` only pads the root-padded variants; this one pads itself, so the body takes no top rule.
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
          bg: 'surface.card',
          borderWidth: 'hairline',
          borderStyle: '[dashed]',
          borderColor: 'border.emphasized',
          borderRadius: 'xl',
          p: '10',
          cursor: 'button',
          _dragging: {
            borderColor: 'accent.line',
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
