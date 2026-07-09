import { HStack, Icon, LinkOverlay, Text } from '@chakra-ui/react'
import { IconType } from 'react-icons'
import { LuArrowUpRight } from 'react-icons/lu'
import { DashboardBox } from '~components/Dashboard/Contents'

export type DocsCardProps = {
  href: string
  icon: IconType
  title: string
  description: string
}

/**
 * External documentation shortcut card: icon + title + description, the whole box clickable via a
 * LinkOverlay pointing to the developer portal.
 */
export const DocsCard = ({ href, icon, title, description }: DocsCardProps) => (
  <DashboardBox
    position='relative'
    gap={3}
    justifyContent='flex-start'
    transition='border-color 0.15s'
    _hover={{ _light: { borderColor: 'blue.400' }, _dark: { borderColor: 'blue.400' } }}
  >
    <HStack justify='space-between'>
      <Icon as={icon} boxSize={6} color='blue.500' />
      <Icon as={LuArrowUpRight} boxSize={4} color='texts.subtle' />
    </HStack>
    <LinkOverlay href={href} target='_blank' rel='noopener noreferrer' fontWeight='bold' fontSize='md'>
      {title}
    </LinkOverlay>
    <Text fontSize='sm' color='texts.subtle'>
      {description}
    </Text>
  </DashboardBox>
)
