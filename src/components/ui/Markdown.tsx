import { Box, chakra, Code, Heading, type HeadingProps, Link, List, Table, Text } from '@chakra-ui/react'
import ReactMarkdown, { type Options } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { proseHeadingSizes } from '~theme/textStyles'
import { chakraProps } from '~utils/chakraProps'

type MarkdownProps = Options & {
  children?: string
}

// Sized like the editor's headings (`proseHeadingSizes`), so what organizers type is what voters read.
const ProseHeading = ({ level, ...props }: HeadingProps & { level: keyof typeof proseHeadingSizes }) => (
  <Heading fontSize={proseHeadingSizes[level]} lineHeight='short' mt='5' mb='4' {...props} />
)

const defaultComponents: NonNullable<Options['components']> = {
  a: ({ children, ...props }) => (
    <Link {...chakraProps(props)} target='_blank' rel='noreferrer'>
      {children}
    </Link>
  ),
  // One level down: the page's h1 is the process or organisation name above the description.
  h1: ({ children, ...props }) => (
    <ProseHeading as='h2' level='h1' {...chakraProps(props)}>
      {children}
    </ProseHeading>
  ),
  h2: ({ children, ...props }) => (
    <ProseHeading as='h3' level='h2' {...chakraProps(props)}>
      {children}
    </ProseHeading>
  ),
  h3: ({ children, ...props }) => (
    <ProseHeading as='h4' level='h3' {...chakraProps(props)}>
      {children}
    </ProseHeading>
  ),
  h4: ({ children, ...props }) => (
    <ProseHeading as='h5' level='h4' {...chakraProps(props)}>
      {children}
    </ProseHeading>
  ),
  h5: ({ children, ...props }) => (
    <ProseHeading as='h6' level='h5' {...chakraProps(props)}>
      {children}
    </ProseHeading>
  ),
  h6: ({ children, ...props }) => (
    <ProseHeading as='h6' level='h6' {...chakraProps(props)}>
      {children}
    </ProseHeading>
  ),
  ol: ({ children, ...props }) => (
    <List.Root as='ol' {...chakraProps(props)}>
      {children}
    </List.Root>
  ),
  ul: ({ children, ...props }) => (
    <List.Root as='ul' {...chakraProps(props)}>
      {children}
    </List.Root>
  ),
  li: ({ children, ...props }) => <List.Item {...chakraProps(props)}>{children}</List.Item>,
  p: ({ children, ...props }) => (
    <Text fontWeight='medium' mb='4' {...chakraProps(props)}>
      {children}
    </Text>
  ),
  table: ({ children, ...props }) => (
    <Box overflowX='auto' maxW='full'>
      <chakra.table {...chakraProps(props)}>{children}</chakra.table>
    </Box>
  ),
  tr: ({ children, ...props }) => <Table.Row {...chakraProps(props)}>{children}</Table.Row>,
  th: ({ children, ...props }) => <Table.ColumnHeader {...chakraProps(props)}>{children}</Table.ColumnHeader>,
  td: ({ children, ...props }) => <Table.Cell {...chakraProps(props)}>{children}</Table.Cell>,
  code: ({ children, ...props }) => <Code {...chakraProps(props)}>{children}</Code>,
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
