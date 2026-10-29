import { Heading, type HeadingProps, Text, type TextProps } from '@chakra-ui/react'
import { forwardRef } from 'react'

// The page's one h1. Section titles inside it are h2 (`section-title` role).
export const PageTitle = forwardRef<HTMLHeadingElement, HeadingProps>((props, ref) => (
  <Heading as='h1' textStyle='page-title' ref={ref} {...props} />
))

export const PageSubtitle = forwardRef<HTMLParagraphElement, TextProps>((props, ref) => (
  <Text textStyle='body' color='fg.muted' mt={2} mb={4} ref={ref} {...props} />
))
