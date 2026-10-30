import { Box, Flex, Heading, type HeadingProps, Text, type TextProps } from '@chakra-ui/react'
import { forwardRef, type ReactNode } from 'react'

// The page's one h1. Section titles inside it are h2 (`section-title` role).
export const PageTitle = forwardRef<HTMLHeadingElement, HeadingProps>((props, ref) => (
  <Heading as='h1' textStyle='page-title' ref={ref} {...props} />
))

// A literal `color` next to a spread of all the style props overflows TypeScript (TS2590), so it is typed once and spread.
const subtitleStyle: TextProps = { textStyle: 'body-sm', color: 'fg.muted', mt: '2', mb: '4' }

export const PageSubtitle = forwardRef<HTMLParagraphElement, TextProps>((props, ref) => (
  <Text ref={ref} {...subtitleStyle} {...props} />
))

type PageHeaderProps = {
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
}

// Title and subtitle with the page's own actions on their right.
export const PageHeader = ({ title, subtitle, actions }: PageHeaderProps) => (
  <Flex justify='space-between' align='flex-start' gap='4' mb='4'>
    <Box>
      <PageTitle>{title}</PageTitle>
      {subtitle && <PageSubtitle mb='[0]'>{subtitle}</PageSubtitle>}
    </Box>
    {actions}
  </Flex>
)
