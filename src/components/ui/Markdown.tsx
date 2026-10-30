import { Box, chakra, Code, Heading, type HeadingProps, Link, List, Table, Text } from '@chakra-ui/react'
import ReactMarkdown, { type Options } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { proseHeadingSizes } from '~theme/textStyles'

type MarkdownProps = Options & {
  children?: string
}

// Sized like the editor's headings (`proseHeadingSizes`), so what organizers type is what voters read.
const ProseHeading = ({ level, ...props }: HeadingProps & { level: keyof typeof proseHeadingSizes }) => (
  <Heading fontSize={proseHeadingSizes[level]} lineHeight='shorter' mt={5} mb={4} {...props} />
)

const defaultComponents: NonNullable<Options['components']> = {
  a: ({ children, ...props }) => (
    <Link {...props} target='_blank' rel='noreferrer'>
      {children}
    </Link>
  ),
  // One level down: the page's h1 is the process or organisation name above the description.
  h1: ({ children, ...props }) => (
    <ProseHeading as='h2' level='h1' {...props}>
      {children}
    </ProseHeading>
  ),
  h2: ({ children, ...props }) => (
    <ProseHeading as='h3' level='h2' {...props}>
      {children}
    </ProseHeading>
  ),
  h3: ({ children, ...props }) => (
    <ProseHeading as='h4' level='h3' {...props}>
      {children}
    </ProseHeading>
  ),
  h4: ({ children, ...props }) => (
    <ProseHeading as='h5' level='h4' {...props}>
      {children}
    </ProseHeading>
  ),
  h5: ({ children, ...props }) => (
    <ProseHeading as='h6' level='h5' {...props}>
      {children}
    </ProseHeading>
  ),
  h6: ({ children, ...props }) => (
    <ProseHeading as='h6' level='h6' {...props}>
      {children}
    </ProseHeading>
  ),
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
