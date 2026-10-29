import { cardAnatomy } from '@chakra-ui/react/anatomy'
import { defineSlotRecipe } from '@chakra-ui/react'

const pricing = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    position: 'relative',
    border: '{borderWidths.hairline} solid',
    borderRadius: 'md',
    bgColor: 'card.pricing.bg',
    p: 6,
    flex: 1,
  },
  header: {
    p: 0,
    // minH: 28,
    '& > p:first-of-type': {
      pt: 1.5,
      fontWeight: 'bold',
      mb: 1.5,
      fontSize: 'lg',
    },
    '& > p:nth-of-type(2)': {
      fontSize: 'sm',
      lineHeight: 1.2,
    },
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'start',
    p: 0,
    '& > div > ul': {
      m: 0,
      mt: 4,
      maxW: 'fit-content',
      fontSize: 'sm',
      listStyleType: 'none',
    },
  },
  footer: {
    p: 0,
    display: 'flex',
  },
}

const featured = {
  ...pricing,
  root: {
    ...pricing.root,
    bgColor: 'card.pricing.featured.bg',
    borderColor: 'card.pricing.featured.border',
    color: 'white',
  },
}

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
          color: 'white',
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
      // A plan offer; `featured` is the highlighted one.
      pricing,
      featured,
      // A customer logo with its name, shown on hover.
      'logo-tile': {
        root: {
          border: 'none',
          backgroundColor: 'none',
          w: 'full',

          _hover: {
            lg: {
              '& div:first-of-type': {
                filter: 'none',
              },
              '& span': {
                display: 'block',
                position: 'relative',
              },
            },
          },
        },
        header: {
          p: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          filter: 'grayscale(100%)',
          h: { base: '35px', lg: '45px' },
        },
        body: {
          p: 0,
          fontSize: '2xs',
          minH: '60px',
          display: 'flex',
          justifyContent: 'center',

          span: {
            display: 'none',
            textAlign: 'center',
            fontSize: 'xs',
            fontWeight: 'bold',
            color: 'fg.muted',
            marginTop: 3,
          },
        },
      },
      // Rows separated by a rule, not boxed: a question and its answer.
      divided: {
        root: {
          borderRadius: 'none',
          borderBottomWidth: 'hairline',
          borderBottomStyle: 'solid',
          borderBottomColor: 'border',
          backgroundColor: 'transparent',
          py: { base: 6, lg: 8 },

          '&:last-of-type': {
            border: 'none',
          },
          '&:nth-last-of-type(2)': {
            borderBottomWidth: { base: 'hairline', lg: '0' },
          },
        },
        header: {
          p: 0,
          fontWeight: 'bold',
          mb: 4.5,
          fontSize: 'xl',
        },
        body: {
          p: 0,
          color: 'fg.muted',
          fontSize: 'xl',
        },
      },
      'no-elections': {
        root: {
          bgColor: 'bg.panel',
        },
      },
    },
  },
})
