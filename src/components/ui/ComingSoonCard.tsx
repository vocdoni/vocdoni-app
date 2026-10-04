import { Box, Flex, Icon, Text } from '@chakra-ui/react'
import { ElementType, ReactNode } from 'react'
import { InterestButton, SoonFeature, SoonTag } from './ComingSoon'
import { SectionCard, type SectionCardProps } from './SectionCard'

type ComingSoonCardProps = Omit<SectionCardProps, 'title'> & {
  feature: SoonFeature
  title: ReactNode
  description: ReactNode
  icon?: ElementType
  /** Where the card sits, sent with the interest event */
  surface?: string
}

/**
 * A dashed card for a feature that isn't available yet, in the place it will live: what it will do,
 * a Soon tag, and "I'd use this".
 */
export const ComingSoonCard = ({ feature, title, description, icon, surface, ...props }: ComingSoonCardProps) => (
  <SectionCard borderStyle='dashed' {...props}>
    <Flex direction={{ base: 'column', sm: 'row' }} align={{ sm: 'center' }} gap={3}>
      {icon && <Icon as={icon} boxSize={5} color='fg.muted' flexShrink={0} />}
      <Box flex='1' minW={0}>
        <Text fontSize='sm' fontWeight='bolder' display='flex' alignItems='center' gap={2}>
          {title}
          <SoonTag />
        </Text>
        <Text fontSize='sm' color='fg.muted'>
          {description}
        </Text>
      </Box>
      <InterestButton feature={feature} surface={surface} flexShrink={0} />
    </Flex>
  </SectionCard>
)
