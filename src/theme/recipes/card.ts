import { cardAnatomy } from '@chakra-ui/react/anatomy'
import { defineSlotRecipe } from '@chakra-ui/react'

const pricingCard = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    position: 'relative',
    border: '1px solid',
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
    '& > button': {
      mx: 'auto',
      mt: 3,
      mb: 2,
      w: 'full',
      borderRadius: 'md',
      border: '1px',
      borderColor: 'gray.300',
      p: 4,
    },
  },
}

const customPricingCard = {
  ...pricingCard,
  root: {
    ...pricingCard.root,
    bgColor: 'card.pricing.featured.bg',
    borderColor: 'card.pricing.featured.border',
    color: 'white',
  },
}

export const Card = defineSlotRecipe({
  slots: cardAnatomy.keys(),
  variants: {
    variant: {
      'pricing-card': pricingCard,
      'custom-pricing-card': customPricingCard,
      client: {
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
          fontSize: '10px',
          minH: '60px',
          display: 'flex',
          justifyContent: 'center',

          span: {
            display: 'none',
            textAlign: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            color: 'fg.muted',
            marginTop: '12px',
          },
        },
      },
      faqs: {
        root: {
          borderRadius: 'none',
          borderBottom: '1px solid rgb(229, 229, 229)',
          backgroundColor: 'transparent',
          py: { base: 6, lg: 8 },

          '&:last-of-type': {
            border: 'none',
          },
          '&:nth-last-of-type(2)': {
            borderBottom: { base: '1px solid rgb(229, 229, 229)', lg: 'none' },
          },
        },
        header: {
          p: 0,
          fontWeight: 'bold',
          mb: '18px',
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
