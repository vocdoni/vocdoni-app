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
    paddingInlineStart: '4',
    marginBlock: '4',
  },
  '& .lexical-ul': {
    listStyleType: 'disc',
  },
  '& .lexical-ol': {
    listStyleType: 'decimal',
  },
  '& .lexical-li': {
    marginBlock: '0.5',
  },
  '& .lexical-link': {
    color: 'link.fg',
    _hover: {
      textDecoration: 'underline',
      color: 'link.fg.hover',
    },
  },
  '& .lexical-quote': {
    paddingLeft: '4',
    marginY: '5',
    borderLeft: 'lg',
  },
  '& [class*="lexical-h"]': {
    fontWeight: 'bold',
    marginY: '5',
    lineHeight: 'short',
  },
  ...Object.fromEntries(
    Object.entries(proseHeadingSizes).map(([level, fontSize]) => [`& .lexical-${level}`, { fontSize }])
  ),
  '& .lexical-paragraph': {
    textStyle: 'sm',
    margin: '[0]',
  },
}

export default editor
