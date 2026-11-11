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
      faqs: {
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
      'data-list-item': {
        root: {
          w: 'full',
          bgColor: 'transparent',
          border: '{borderWidths.hairline} solid',
          borderColor: 'border',
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
          color: 'fg.muted',
        },
      },
    },
  },
})
