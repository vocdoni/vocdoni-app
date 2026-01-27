import { Box, type ChakraProps } from '@chakra-ui/react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Props = ChakraProps & { children?: string }

export const ElectionDescription = ({ children, ...rest }: Props) => (
  <Box {...rest}>
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{children ?? ''}</ReactMarkdown>
  </Box>
)
