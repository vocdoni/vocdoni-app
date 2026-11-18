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
  header: {
    p: '0',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '2',
  },
  body: {
    p: '0',
    gap: '1',
    fontSize: 'sm',
    color: 'fg.muted',
  },
} satisfies Partial<Record<string, SystemStyleObject>>

const title = { textStyle: 'control', fontWeight: 'medium-plus' } as const

// The voter page's cards: a panel with the thin ring (no border, so it takes no room) and 12px corners.
const voterCard = {
  bg: 'surface.card',
  borderWidth: '[0]',
  boxShadow: 'shadow.ring',
  borderRadius: 'xl',
} satisfies SystemStyleObject

// Cards are named by what they are for. Radius comes from Chakra's base (`l3`) unless a variant sets
// its own; `size` sets `--card-padding`, which the variants that pad their root read.
// The 1px border is the card's ring, so none of the variants adds a shadow. Every card paints its own fill: the
// dashboard page is grey, so a card that left its background unset would vanish into it.
export const Card = defineSlotRecipe({
  slots: cardAnatomy.keys(),
  base: {
    // The card's inner edge is the guide's: 16px on a phone, 22px from a tablet.
    header: { px: { base: '4', md: 'card' }, pt: '4', pb: '3' },
    // Rows after the header are told apart by a hairline.
    body: {
      px: { base: '4', md: 'card' },
      py: '3.5',
      _notFirst: { borderTopWidth: 'hairline', borderColor: 'border' },
      // The row being worked on (an open question): an accent rule on its leading edge.
      '&[data-current]': { boxShadow: '[inset {borderWidths.thick} 0 0 {colors.accent.line}]' },
    },
    footer: { px: { base: '4', md: 'card' }, pb: '4' },
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
      // A ring, not a border, as the guide's cards: it takes no room, so the card is as tall as its content.
      frame: {
        root: {
          // Filled: the dashboard page is grey, and a card stays white on it.
          bg: 'surface.card',
          borderWidth: '[0]',
          boxShadow: 'shadow.ring',
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
      'list-item': { ...listItem, body: { ...listItem.body, borderTopWidth: '[0]' } },
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
      // An explanation rather than data (what each vote state means): a dashed edge, no fill.
      note: {
        root: {
          borderWidth: 'hairline',
          borderStyle: '[dashed]',
          borderColor: 'border.emphasized',
          p: 'var(--card-padding)',
        },
      },
      // A filled card without a border, around a page-level empty state.
      plain: {
        root: {
          bgColor: 'bg.panel',
        },
      },
      // A card of the voter page: the thin ring, 12px corners, its rows 14px and 18px from the edge at every width (a
      // review row, a receipt's head).
      ballot: {
        root: voterCard,
        header: { px: '4.5', py: '3.5' },
        body: { px: '4.5', py: '3.5' },
        // A receipt's actions sit in the footer under a rule, as the rows above.
        footer: { px: '4.5', py: '3.5', gap: '2.5', borderTopWidth: 'hairline', borderColor: 'border.muted' },
      },
      // The same card around one notice ("Encara no es pot votar"), padded 18px and 20px on the root: its title in
      // semibold over a quiet note (compound variant below, after the size's title).
      'ballot-notice': {
        root: { ...voterCard, px: '5', py: '4.5' },
      },
    },
  },
  compoundVariants: [
    {
      variant: 'ballot-notice',
      css: {
        title: { textStyle: 'ballot-body', fontWeight: 'semibold' },
        description: { textStyle: 'body', color: 'fg.subtle', mt: '0.5' },
      },
    },
  ],
})
