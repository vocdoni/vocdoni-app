import { createMultiStyleConfigHelpers } from '@chakra-ui/react'
import { questionsAnatomy, questionsEmptyAnatomy, questionsErrorAnatomy, questionsConfirmationAnatomy } from '~components/vocdoni-ui'
import checkIconBlack from '/assets/check-icon-black.png'
import checkIcon from '/assets/check-icon.png'

const { defineMultiStyleConfig, definePartsStyle } = createMultiStyleConfigHelpers(questionsAnatomy)

const baseStyle = definePartsStyle({
  alert: {
    width: 'full',
    px: { base: 3, sm: 5 },
    py: 7,
    mb: '30px',
    borderRadius: '8px',
    bgColor: 'process.questions.alert.bg',
    display: 'grid',
    columnGap: 4,
    justifyContent: 'center',
    alignItems: 'center',
    gridTemplateColumns: 'auto 1fr',
    gridTemplateRows: 'auto auto',
    border: 'none',

    '& span': {
      ml: { base: 2, lg: 10, xl: 2 },
      gridRow: '1/3',
      gridColumn: '1/2',
    },
  },

  alertTitle: {
    fontSize: 'lg',
    mb: 3,
    color: 'white',
  },

  alertDescription: {
    display: 'flex',
    gap: 2,
    flexDirection: { base: 'column', lg2: 'row' },
    justifyContent: 'center',
    alignItems: { md: 'center' },
    whiteSpace: { base: 'pre-wrap', lg2: 'nowrap' },
    color: 'white',
  },

  alertLink: {
    display: 'block',
    w: '100%',
    px: 2,
    py: 1,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    color: 'link.light',
    backgroundColor: 'process.questions.alert.link_bg',
    borderRadius: 'md',
    fontSize: 'sm',

    _dark: {
      color: 'link.light',
    },
    _hover: {
      textDecoration: 'none',
    },
  },

  wrapper: {
    '& > form': {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      // Hides voting type label
      '& > div:nth-of-type(-n+2):has(> label)': { display: 'none' },
    },
  },

  question: {
    width: { base: 'full', xl: '80%' },
    m: 0,
    mx: 'auto',

    '& > div': {
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    },
  },

  title: {
    display: 'block',
    textAlign: 'start',
    lineHeight: 1.3,
    fontSize: 'lg',
    fontWeight: 'semibold',
    mb: 6,
  },

  description: {
    wordBreak: 'break-word',
    px: 1,
    textAlign: 'start',
    fontSize: 'md !important',

    '& a': {
      textDecoration: 'underline',
    },
  },

  stack: {
    // Only for extended question type
    '&:has(img), &:has(.chakra-skeleton img)': {
      display: 'grid',
      gridTemplateColumns: {
        base: '1fr',
        md: 'repeat(2, minmax(0, 1fr))',
        lg: 'repeat(3, minmax(0, 1fr))',
      },
      '& label': {
        width: '100%',
        position: 'relative',

        '& span:nth-of-type(1)': {
          position: 'absolute',
          top: 2,
          right: 2,
        },
        '& span:nth-of-type(2)': {
          p: 0,
          h: '100%',
        },
      },
    },

    '& label': {
      '&:has(img), &:has(.chakra-skeleton img)': {
        minH: '220px',
      },
      gap: 2,

      '& span:nth-of-type(1)': {
        '&[data-checked=""]': {
          '&:before': {
            display: 'none',
          },
          bgColor: 'black',
          _dark: {
            bgColor: 'white',
            bgImage: checkIconBlack,
          },
          borderWidth: '1px',
          bgSize: '12px',
          bgRepeat: 'no-repeat',
          bgPosition: 'center',
          bgImage: checkIcon,
        },
      },
      '& span:nth-of-type(2)': {
        p: 2,
        m: 0,
        border: '1px solid',
        borderColor: 'table.border',
        borderRadius: 'lg',
        '&[data-checked=""]': {
          outline: '2px solid',
          outlineColor: 'process.questions.outline.checked.light',
          _dark: {
            outlineColor: 'process.questions.outline.checked.dark',
          },
        },

        w: '100%',
        _hover: {
          bgColor: 'process.questions.hover.light',

          _dark: {
            bgColor: 'process.questions.hover.dark',
          },
        },
      },
    },
  },

  checkbox: {
    /* Disable svg icon that comes with chakra */
    '& svg': { display: 'none' },
  },

  error: {
    display: 'flex',
    justifyContent: 'center',
  },
})

export const ElectionQuestions = defineMultiStyleConfig({
  baseStyle,
})
