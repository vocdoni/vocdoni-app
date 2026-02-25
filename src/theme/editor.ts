import { SystemStyleObject } from '@chakra-ui/react'

const editor: SystemStyleObject = {
  '& .lexical-bold': {
    fontWeight: 'extrabold',
  },
  '& .lexical-italic': {
    fontStyle: 'italic',
  },
  '& .lexical-underline': {
    textDecoration: 'underline',
  },
  '& .lexical-strikethrough': {
    textDecoration: 'line-through',
  },
  '& .lexical-underline.lexical-strikethrough': {
    textDecoration: 'underline line-through',
  },
  '& .lexical-ul, & .lexical-ol': {
    paddingInlineStart: '1rem',
    marginBlock: '1rem',
  },
  '& .lexical-ul': {
    listStyleType: 'disc',
  },
  '& .lexical-ol': {
    listStyleType: 'decimal',
  },
  '& .lexical-li': {
    marginBlock: '0.125rem',
  },
  '& .lexical-link': {
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
  '& .lexical-quote': {
    paddingLeft: '1rem',
    marginY: '1.25rem',
    borderLeft: '4px solid',
  },
  '& [class*="lexical-h"]': {
    fontWeight: 'bold',
    marginY: '1.25rem',
    lineHeight: '1.25',
  },
  '& .lexical-h1': {
    fontSize: '3xl',
  },
  '& .lexical-h2': {
    fontSize: '2xl',
  },
  '& .lexical-h3': {
    fontSize: 'xl',
  },
  '& .lexical-h4': {
    fontSize: 'lg',
  },
  '& .lexical-h5': {
    fontSize: 'md',
  },
  '& .lexical-paragraph': {
    fontSize: 'md',
    lineHeight: '24px',
  },
}

export default editor
