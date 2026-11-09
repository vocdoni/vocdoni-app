import { cardAnatomy } from '@chakra-ui/react/anatomy'
import { defineSlotRecipe } from '@chakra-ui/react'

export const Card = defineSlotRecipe({
  slots: cardAnatomy.keys(),
  variants: {
    variant: {
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
          borderBottomWidth: '1px',
          borderBottomStyle: 'solid',
          borderBottomColor: 'border',
          backgroundColor: 'transparent',
          py: { base: 6, lg: 8 },

          '&:last-of-type': {
            border: 'none',
          },
          '&:nth-last-of-type(2)': {
            borderBottomWidth: { base: '1px', lg: '0' },
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
      'data-list-item': {
        root: {
          w: 'full',
          bgColor: 'transparent',
          border: '1px solid',
          borderColor: 'border.dashboard',
          borderRadius: 'sm',
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
          color: 'texts.subtle',
        },
      },
    },
  },
})
