import { Flex, FlexProps, Heading, HStack, Icon, Separator, Text } from '@chakra-ui/react'
import { ElementType, ReactNode } from 'react'

export type SectionHeaderProps = Omit<FlexProps, 'title'> & {
  title: ReactNode
  description?: ReactNode
  // Buttons or a badge beside the title block; they drop under it below `md`.
  actions?: ReactNode
  icon?: ElementType
  // A hairline from the title to the end of the row.
  rule?: boolean
  // Temporary: the sizes and title-to-description gaps the sites had before the one section title size.
  size?: 'md' | 'lg'
  titleGap?: FlexProps['gap']
}

// The title (h2) and muted one-liner over a card, settings block or page section.
export const SectionHeader = ({
  title,
  description,
  actions,
  icon,
  rule,
  size,
  titleGap,
  ...props
}: SectionHeaderProps) => {
  const heading = size ? (
    <Heading as='h2' size={size} flexShrink={rule ? 0 : undefined}>
      {title}
    </Heading>
  ) : (
    <Heading as='h2' textStyle='section-title' flexShrink={rule ? 0 : undefined}>
      {title}
    </Heading>
  )

  let titleRow = heading
  if (icon) {
    titleRow = (
      <HStack gap='2'>
        <Icon as={icon} />
        {heading}
      </HStack>
    )
  } else if (rule) {
    titleRow = (
      <Flex align='center' gap='4'>
        {heading}
        <Separator flex='1' />
      </Flex>
    )
  }

  const block = (rest?: FlexProps) => (
    <Flex direction='column' gap={titleGap} {...rest}>
      {titleRow}
      {description && (
        <Text textStyle='body-sm' color='fg.muted'>
          {description}
        </Text>
      )}
    </Flex>
  )

  if (!actions) return block(props)

  return (
    <Flex direction={{ base: 'column', md: 'row' }} justify='space-between' gap='4' {...props}>
      {block({ flex: '1' })}
      {actions}
    </Flex>
  )
}
