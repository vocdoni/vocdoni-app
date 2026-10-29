import { Box, Code, Heading, Link, List, Table, Text, chakra } from '@chakra-ui/react'
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
  // One level down: the page's h1 is the process or organisation name above the description.
  h1: ({ children, ...props }) => (
    <Heading as='h2' size='lg' mt={5} mb={4} {...props}>
      {children}
    </Heading>
  ),
  h2: ({ children, ...props }) => (
    <Heading as='h3' size='md' mt={5} mb={4} {...props}>
      {children}
    </Heading>
  ),
  h3: ({ children, ...props }) => (
    <Heading as='h4' size='sm' mt={5} mb={4} {...props}>
      {children}
    </Heading>
  ),
  h4: ({ children, ...props }) => <chakra.h5 {...props}>{children}</chakra.h5>,
  h5: ({ children, ...props }) => <chakra.h6 {...props}>{children}</chakra.h6>,
  h6: ({ children, ...props }) => <chakra.h6 {...props}>{children}</chakra.h6>,
  ol: ({ children, ...props }) => (
    <List.Root as='ol' {...props}>
      {children}
    </List.Root>
  ),
  ul: ({ children, ...props }) => (
    <List.Root as='ul' {...props}>
      {children}
    </List.Root>
  ),
  li: ({ children, ...props }) => <List.Item {...props}>{children}</List.Item>,
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
  tr: ({ children, ...props }) => <Table.Row {...props}>{children}</Table.Row>,
  th: ({ children, ...props }) => <Table.ColumnHeader {...props}>{children}</Table.ColumnHeader>,
  td: ({ children, ...props }) => <Table.Cell {...props}>{children}</Table.Cell>,
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
