import { Box, HStack, Icon, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import { LuCheck } from 'react-icons/lu'
import { CredentialMeta } from './credentialMeta'
import { EASE, fadeUp, popIn, shake } from './motion'

export type CredentialCardProps = {
  meta: CredentialMeta
  isSelected: boolean
  isDisabled?: boolean
  onToggle: () => void
  index?: number
}

/**
 * A toggleable identity-credential card. Selecting it adds the field to the
 * voter's screen. Teaches the field via an example value and an icon.
 */
export const CredentialCard = ({ meta, isSelected, isDisabled = false, onToggle, index = 0 }: CredentialCardProps) => {
  const [shaking, setShaking] = useState(false)

  const handleClick = () => {
    if (isDisabled) {
      setShaking(true)
      return
    }
    onToggle()
  }

  return (
    <Box
      role='button'
      tabIndex={0}
      aria-pressed={isSelected}
      aria-disabled={isDisabled}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      onAnimationEnd={() => shaking && setShaking(false)}
      position='relative'
      borderWidth='2px'
      borderStyle='solid'
      borderColor={isSelected ? 'brand.500' : 'table.border'}
      bg={isSelected ? 'auth.bg' : 'transparent'}
      borderRadius='lg'
      p={3}
      cursor={isDisabled ? 'not-allowed' : 'pointer'}
      opacity={isDisabled ? 0.55 : 1}
      css={{
        animation: shaking ? `${shake} 0.4s ${EASE}` : `${fadeUp} 0.32s ${EASE} both`,
        animationDelay: shaking ? '0s' : `${index * 0.04}s`,
        transition: `border-color 0.15s ${EASE}, background-color 0.15s ${EASE}, transform 0.15s ${EASE}, box-shadow 0.15s ${EASE}`,
      }}
      _hover={!isDisabled && !isSelected ? { borderColor: 'gray.400', transform: 'translateY(-1px)' } : undefined}
      boxShadow={isSelected ? '0 4px 14px -8px rgba(0,0,0,0.35)' : 'none'}
    >
      <VStack align='start' gap={1.5}>
        <HStack justify='space-between' w='full'>
          <Box color={isSelected ? 'texts.primary' : 'texts.subtle'} css={{ transition: `color 0.15s ${EASE}` }}>
            <Icon as={meta.icon} boxSize={5} />
          </Box>
          {isSelected && (
            <Box
              boxSize={5}
              borderRadius='full'
              bg='brand.500'
              color='white'
              display='flex'
              alignItems='center'
              justifyContent='center'
              css={{ animation: `${popIn} 0.25s ${EASE} both` }}
            >
              <Icon as={LuCheck} boxSize={3} />
            </Box>
          )}
        </HStack>
        <Box>
          <Text fontSize='sm' fontWeight='semibold' lineHeight={1.2}>
            {meta.label}
          </Text>
          <Text fontSize='xs' color='texts.subtle' lineClamp={1}>
            {meta.example}
          </Text>
        </Box>
      </VStack>
    </Box>
  )
}
