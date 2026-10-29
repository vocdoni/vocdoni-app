import { HStack, Icon, LinkBox, LinkOverlay, Text } from '@chakra-ui/react'
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
    as={LinkBox}
    gap={3}
    justifyContent='flex-start'
    transition='border-color {durations.fast}'
    _hover={{ borderColor: 'colorPalette.solid' }}
  >
    <HStack justify='space-between'>
      <Icon as={icon} boxSize={6} color='colorPalette.fg' />
      <Icon as={LuArrowUpRight} boxSize={4} color='fg.muted' />
    </HStack>
    <LinkOverlay href={href} target='_blank' rel='noopener noreferrer' fontWeight='bold' fontSize='md'>
      {title}
    </LinkOverlay>
    <Text fontSize='sm' color='fg.muted'>
      {description}
    </Text>
  </DashboardBox>
)
