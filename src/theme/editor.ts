import { SystemStyleObject } from '@chakra-ui/react'
import { proseHeadingSizes } from './textStyles'

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
    color: 'link.fg',
    _hover: {
      textDecoration: 'underline',
      color: 'link.fg.hover',
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
    lineHeight: 'shorter',
  },
  ...Object.fromEntries(
    Object.entries(proseHeadingSizes).map(([level, fontSize]) => [`& .lexical-${level}`, { fontSize }])
  ),
  '& .lexical-paragraph': {
    textStyle: 'sm',
    margin: 0,
  },
}

export default editor
