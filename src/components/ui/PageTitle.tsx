import { Heading, type HeadingProps, Text, type TextProps } from '@chakra-ui/react'
import { forwardRef } from 'react'

// The page's one h1. Section titles inside it are h2 (`section-title` role).
export const PageTitle = forwardRef<HTMLHeadingElement, HeadingProps>((props, ref) => (
  <Heading as='h1' textStyle='page-title' ref={ref} {...props} />
))

// A literal `color` next to a spread of all the style props overflows TypeScript (TS2590), so it is typed once and spread.
const subtitleStyle: TextProps = { textStyle: 'body-sm', color: 'fg.muted', mt: '2', mb: '4' }

export const PageSubtitle = forwardRef<HTMLParagraphElement, TextProps>((props, ref) => (
  <Text ref={ref} {...subtitleStyle} {...props} />
))
