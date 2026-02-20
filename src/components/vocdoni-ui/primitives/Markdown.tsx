import { Box, Code, Heading, Link, Text, chakra } from '@chakra-ui/react'
import ReactMarkdown, { type Options } from 'react-markdown'
import remarkGfm from 'remark-gfm'

type MarkdownProps = Options & {
  children?: string
}

const defaultComponents: NonNullable<Options['components']> = {
  a: ({ children, ...props }) => (
    <Link {...props} target='_blank' rel='noreferrer'>
      {children}
    </Link>
  ),
  h1: ({ children, ...props }) => (
    <Heading size='lg' mt={5} mb={4} {...props}>
      {children}
    </Heading>
  ),
  h2: ({ children, ...props }) => (
    <Heading size='md' mt={5} mb={4} {...props}>
      {children}
    </Heading>
  ),
  h3: ({ children, ...props }) => (
    <Heading as='h3' size='sm' mt={5} mb={4} {...props}>
      {children}
    </Heading>
  ),
  ol: ({ children, ...props }) => <chakra.ol {...props}>{children}</chakra.ol>,
  ul: ({ children, ...props }) => <chakra.ul {...props}>{children}</chakra.ul>,
  li: ({ children, ...props }) => <chakra.li {...props}>{children}</chakra.li>,
  p: ({ children, ...props }) => (
    <Text fontWeight='medium' mb={4} {...props}>
      {children}
    </Text>
  ),
  table: ({ children, ...props }) => (
    <Box overflowX='auto' maxW='full'>
      <chakra.table {...props}>{children}</chakra.table>
    </Box>
  ),
  tr: ({ children, ...props }) => <chakra.tr {...props}>{children}</chakra.tr>,
  th: ({ children, ...props }) => <chakra.th {...props}>{children}</chakra.th>,
  td: ({ children, ...props }) => <chakra.td {...props}>{children}</chakra.td>,
  code: ({ children, ...props }) => <Code {...props}>{children}</Code>,
}

export const Markdown = ({ children, components, remarkPlugins, ...rest }: MarkdownProps) => {
  if (!children) return null

  return (
    <ReactMarkdown
      remarkPlugins={remarkPlugins ?? [remarkGfm]}
      components={{ ...defaultComponents, ...components }}
      {...rest}
    >
      {children}
    </ReactMarkdown>
  )
}
