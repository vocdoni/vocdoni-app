import { Badge, Box, HStack, Icon, Text, VStack } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { LuCheck, LuUsers } from 'react-icons/lu'
import { Group } from '~src/queries/groups'
import { EASE, fadeUp } from '../VoterAuthentication/motion'

export type GroupCardProps = {
  group: Group
  isSelected: boolean
  onSelect: () => void
  index?: number
}

/** A selectable group card inside the group chooser drawer. */
export const GroupCard = ({ group, isSelected, onSelect, index = 0 }: GroupCardProps) => {
  const { t } = useTranslation()
  const title = group.isAutoGroup ? t('groups_board.auto_group.title', { defaultValue: 'All Members' }) : group.title

  return (
    <HStack
      role='button'
      tabIndex={0}
      aria-pressed={isSelected}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      align='center'
      gap={3}
      p={4}
      borderWidth='2px'
      borderStyle='solid'
      borderColor={isSelected ? 'brand.500' : 'table.border'}
      bg={isSelected ? 'auth.bg' : 'transparent'}
      borderRadius='lg'
      cursor='pointer'
      css={{
        animation: `${fadeUp} 0.3s ${EASE} both`,
        animationDelay: `${index * 0.04}s`,
        transition: `border-color 0.15s ${EASE}, background-color 0.15s ${EASE}, transform 0.15s ${EASE}`,
      }}
      _hover={!isSelected ? { borderColor: 'gray.400', transform: 'translateY(-1px)' } : undefined}
    >
      <Box bg='auth.bg' p={2.5} borderRadius='lg' color='texts.subtle' lineHeight={0} flexShrink={0}>
        <Icon as={LuUsers} boxSize={5} />
      </Box>
      <VStack align='start' gap={0.5} flex={1} minW={0}>
        <HStack gap={2}>
          <Text fontWeight='semibold' lineClamp={1}>
            {title}
          </Text>
          {group.isAutoGroup && (
            <Badge variant='subtle'>{t('voter_auth.group.auto_badge', { defaultValue: 'Auto' })}</Badge>
          )}
        </HStack>
        {group.description && (
          <Text fontSize='sm' color='texts.subtle' lineClamp={2}>
            {group.description}
          </Text>
        )}
      </VStack>
      <HStack gap={1.5} color='texts.subtle' fontSize='sm' flexShrink={0}>
        <Icon as={LuUsers} boxSize={3.5} />
        <Text>{group.membersCount ?? 0}</Text>
      </HStack>
      {isSelected && <Icon as={LuCheck} color='brand.500' boxSize={5} flexShrink={0} />}
    </HStack>
  )
}
