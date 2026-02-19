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
    bgColor: 'card.pricing.bd',
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
      calendar: {
        root: {
          border: '1px solid #4E525C',
          flexDirection: 'row',
          p: 5,
          gap: 5,
          bgColor: 'transparent',
          borderRadius: 'xl',
        },
        header: {
          p: 0,
        },
        body: { p: 0 },
      },
      'download-spreadsheet': {
        root: {
          p: 6,
          maxW: 64,
          bgColor: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 6,
          mx: 'auto',
        },
        body: {
          p: 0,
          flexGrow: 0,
          textAlign: 'center',
        },
        footer: {
          p: 0,
        },
      },
      'pricing-card': pricingCard,
      'custom-pricing-card': customPricingCard,
      'web3-addresses': {
        root: {
          flexDirection: 'column',
          minH: '220px',
          overflowY: 'scroll',
          borderRadius: 'xl',
          my: 6,
          bgColor: 'process_create.bg_secondary.light',
          _dark: {
            bgColor: 'process_create.bg_secondary.dark',
          },
        },
      },
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
            color: 'home.description.light',
            marginTop: '12px',
            _dark: {
              color: 'home.description.dark',
            },
          },
        },
      },
      benefits: {
        root: {
          w: '350px',
          backdropFilter: 'blur(16px)',
          borderBottomWidth: '0',
          borderBottomColor: 'rgba(255, 255, 255, .15)',
          borderLeftWidth: '0',
          borderLeftColor: 'rgba(255, 255, 255, .15)',
          borderRightWidth: '1px',
          borderRightColor: 'rgba(255, 255, 255, .2)',
          borderRadius: '8px',
          flexDirection: 'column',
          display: 'flex',
          overflow: 'hidden',
          boxShadow: 'inset 0 -1px 0 1px rgba(255, 255, 255, .2), 0 8px 22px rgba(0, 0, 0, .12)',

          '&:nth-of-type(1)': {
            bg: 'home.benefits.bg.light.primary',
            color: 'home.benefits.color.light.bg_primary',
          },
          '&:nth-of-type(2)': {
            bg: 'home.benefits.bg.light.white',
            color: 'home.benefits.color.light.bg_white',
            _dark: {
              bg: 'home.benefits.bg.dark.dark',
              color: 'home.benefits.color.dark',
            },
          },
          '&:nth-of-type(3)': {
            bg: {
              base: 'home.benefits.bg.light.primary',
              benefits1: 'home.benefits.bg.light.white',
              benefits2: 'home.benefits.bg.light.primary',
            },
            color: {
              base: 'home.benefits.color.light.bg_primary',
              benefits1: 'home.benefits.color.light.bg_white',
              benefits2: 'home.benefits.color.light.bg_primary',
            },

            _dark: {
              bg: {
                base: 'home.benefits.bg.light.primary',
                benefits1: 'home.benefits.bg.dark.dark',
                benefits2: 'home.benefits.bg.light.primary',
              },
              color: {
                base: 'home.benefits.color.light.bg_primary',
                benefits1: 'home.benefits.color.dark',
                benefits2: 'home.benefits.color.light.bg_primary',
              },
            },
          },
          '&:nth-of-type(4)': {
            bg: {
              base: 'home.benefits.bg.light.white',
              benefits1: 'home.benefits.bg.light.primary',
              benefits2: 'home.benefits.bg.light.white',
            },
            color: {
              base: 'home.benefits.color.light.bg_white',
              benefits1: 'home.benefits.color.light.bg_primary',
              benefits2: 'home.benefits.color.light.bg_white',
            },

            _dark: {
              bg: {
                base: 'home.benefits.bg.dark.dark',
                benefits1: 'home.benefits.bg.light.primary',
                benefits2: 'home.benefits.bg.dark.dark',
              },
              color: {
                base: 'home.benefits.color.dark',
                benefits1: 'home.benefits.color.light.bg_primary',
                benefits2: 'home.benefits.color.dark',
              },
            },
          },
          '&:nth-of-type(5)': {
            bg: 'home.benefits.bg.light.primary',
            color: 'home.benefits.color.light.bg_primary',
          },
          '&:nth-of-type(6)': {
            bg: 'home.benefits.bg.light.white',
            color: 'home.benefits.color.light.bg_white',

            _dark: {
              bg: 'home.benefits.bg.dark.dark',
              color: 'home.benefits.color.dark',
            },
          },
        },
        header: {
          p: '30px',
          pb: '30px',
          fontSize: { base: '22px', sm: '22px' },
          lineHeight: { base: '26px', sm: '26px' },
          fontWeight: 'bold',
          textAlign: 'left',
          fontFamily: 'basier',
          paddingTop: '0px',
        },
        body: {
          p: '30px',
          pt: 0,
          textAlign: 'left',
        },
      },
      'icon-card': {
        root: {
          bgColor: 'transparent',
        },
        body: {
          p: 0,
          display: 'flex',
          flexDirection: { base: 'column', lg: 'row' },
          gap: { base: '10px', lg: '24px' },

          '& > div:first-of-type': {
            alignSelf: { base: 'center', lg: 'start' },
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 'lg',
            minW: '45px',
            h: '45px',
            bg: 'home.features_icon',

            svg: {
              width: '25px',
              height: '25px',
              color: 'white',
            },
          },

          '& > div:last-of-type': {
            '& > p:first-of-type': {
              fontWeight: '600',
              fontSize: '22px',
              lineHeight: '32px',
              textAlign: { base: 'center', lg: 'start' },
              mb: '6px',
            },

            '& > p:last-of-type': {
              fontSize: '22px',
              textAlign: { base: 'center', lg: 'start' },
              maxW: { base: '100%', sm: '70%', lg: '100%' },
              mx: 'auto',
              color: 'home.description.light',
              _dark: {
                color: 'home.description.dark',
              },
            },
          },
        },
      },
      'image-card': {
        root: {
          bgColor: 'transparent',
        },
        body: {
          p: 0,
          display: 'flex',
          flexDirection: { base: 'column', lg: 'row' },
          gap: { base: '10px', lg: '24px' },

          '& > div:first-of-type': {
            alignSelf: { base: 'center', lg: 'start' },
            backgroundColor: 'transparent',
            w: { base: '80px', xl: '120px' },
            h: { base: '80px', xl: '120px' },
            minW: { base: '80px', xl: '120px' },
          },

          '& > div:last-of-type': {
            '& > p:first-of-type': {
              fontWeight: '600',
              fontSize: '26px',
              lineHeight: '32px',
              textAlign: { base: 'center', lg: 'start' },
            },

            '& > p:last-of-type': {
              fontSize: '22px',
              textAlign: { base: 'center', lg: 'start' },
              maxW: { base: '100%', sm: '70%', lg: '100%' },
              mx: 'auto',
              color: 'home.description.light',
              _dark: {
                color: 'home.description.dark',
              },
            },
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
          color: 'home.description.light',
          fontSize: 'xl',

          _dark: {
            color: 'home.description.dark',
          },
        },
      },
      solutions: {
        root: {
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 2,
          borderRadius: 'md',
          boxShadow: 'var(--box-shadow)',
          p: 3,
          bgColor: 'home.solutions.light_bg',
          fontWeight: 'bold',

          _dark: {
            bgColor: 'home.solutions.dark_bg',
          },
        },
      },
      'no-elections': {
        root: {
          bgColor: 'bg_secondary.light',

          _dark: {
            bgColor: 'bg_secondary.dark',
          },
        },
      },
      aside: {
        root: {
          direction: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          px: { base: 6, xl: 4 },
          py: { base: 6, xl: 4 },
          gap: 4,
          mt: { md: 7 },
          mb: { base: 7, xl: 0 },
          background: 'transparent',
          boxShadow: 'var(--box-shadow-banner)',
          borderRadius: 'lg',
          border: '1px solid ',
          fontSize: 'text',
          w: 'full',
        },
      },
    },
  },
})
