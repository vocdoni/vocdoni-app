import type { GlobalStyleObject } from '@chakra-ui/react'

const editor: GlobalStyleObject = {
  '.lexical-bold': {
    fontWeight: 'extrabold',
  },
  '.lexical-italic': {
    fontStyle: 'italic',
  },
  '.lexical-underline': {
    textDecoration: 'underline',
  },
  '.lexical-strikethrough': {
    textDecoration: 'line-through',
  },
  '.lexical-underline.lexical-strikethrough': {
    textDecoration: 'underline line-through',
  },
  '.lexical-ul': {
    paddingLeft: '20px',
  },
  '.lexical-ol': {
    paddingLeft: '20px',
  },
  '.lexical-li': {
    marginBottom: '10px',
  },
  '.lexical-link': {
    color: 'gray.800',
    _dark: {
      color: 'gray.400',
      _hover: {
        color: 'gray.200',
      },
    },
    _hover: {
      textDecoration: 'underline',
      color: 'gray.500',
    },
  },
  '.lexical-quote': {
    paddingLeft: '16px',
    marginBottom: '20px',
  },
  '.lexical-h1': {
    fontWeight: 600,
    fontSize: '36px',
    lineHeight: '44px',
    letterSpacing: '-2%',
    mb: '30px',
  },
  '.shared-census .lexical-h1': {
    textAlign: 'center',
  },
  '.shared-census .lexical-h1 + p': {
    textAlign: 'center',
    mt: '-30px',
  },
  '.lexical-h2': {
    fontWeight: 600,
    fontSize: '30px',
    lineHeight: '38px',
    letterSpacing: '0%',
    mb: '25px',
  },
  '.lexical-h3': {
    fontWeight: 600,
    fontSize: '24px',
    lineHeight: '32px',
    letterSpacing: '0%',
    mb: '20px',
  },
  '.lexical-h4': {
    fontWeight: 600,
    fontSize: '20px',
    lineHeight: '28px',
    letterSpacing: '0%',
    mb: '20px',
  },
  '.lexical-h5': {
    fontWeight: 600,
    fontSize: '16px',
    lineHeight: '24px',
    letterSpacing: '0%',
    mb: '20px',
  },

  '.lexical-paragraph': {
    fontSize: '16px',
    lineHeight: '24px',
  },

  '[contenteditable="false"] .lexical-paragraph': {
    mb: '20px',
    '&:not(:has(+ p, + ul, + ol, + blockquote, + li))': {
      mb: '60px',
    },
  },
}

export default editor
