import { Box, HStack, Icon, Text, VStack } from '@chakra-ui/react'
import { IconType } from 'react-icons'
import { LuCheck } from 'react-icons/lu'
import { EASE, fadeUp, popIn } from './motion'

export type MethodCardProps = {
  icon: IconType
  label: string
  description: string
  isSelected: boolean
  onSelect: () => void
  index?: number
}

/** Selectable 2FA delivery-method card (email / SMS / voter's choice). */
export const MethodCard = ({ icon, label, description, isSelected, onSelect, index = 0 }: MethodCardProps) => (
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
    gap={3}
    p={3}
    borderWidth='2px'
    borderStyle='solid'
    borderColor={isSelected ? 'brand.500' : 'table.border'}
    bg={isSelected ? 'auth.bg' : 'transparent'}
    borderRadius='xl'
    cursor='pointer'
    css={{
      animation: `${fadeUp} 0.3s ${EASE} both`,
      animationDelay: `${index * 0.05}s`,
      transition: `border-color 0.15s ${EASE}, background-color 0.15s ${EASE}`,
    }}
    _hover={!isSelected ? { borderColor: 'gray.400' } : undefined}
  >
    <Box color={isSelected ? 'texts.primary' : 'texts.subtle'} bg='auth.bg' p={2} borderRadius='md' lineHeight={0}>
      <Icon as={icon} boxSize={4} />
    </Box>
    <VStack align='start' gap={0} flex={1}>
      <Text fontSize='sm' fontWeight='semibold'>
        {label}
      </Text>
      <Text fontSize='xs' color='texts.subtle'>
        {description}
      </Text>
    </VStack>
    {isSelected && (
      <Box color='green.500' css={{ animation: `${popIn} 0.25s ${EASE} both` }}>
        <Icon as={LuCheck} boxSize={4} />
      </Box>
    )}
  </HStack>
)
