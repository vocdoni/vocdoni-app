import { Box, Flex } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'

export type ChatMessage = {
  id: string
  from: 'support' | 'user'
  text: string
  isError?: boolean
  // 'contact' bubbles render the book-a-call / WhatsApp buttons underneath
  kind?: 'contact'
}

const dotBounce = keyframes({
  '0%, 60%, 100%': { transform: 'translateY(0)', opacity: 0.4 },
  '30%': { transform: 'translateY(-4px)', opacity: 1 },
})

export const TypingIndicator = () => (
  <Flex
    aria-hidden='true'
    alignSelf='flex-start'
    align='center'
    gap={1}
    bg='bg.emphasized'
    borderRadius='xl'
    borderBottomLeftRadius='sm'
    px={3}
    py={2.5}
    animationName='slide-from-bottom, fade-in'
    animationDuration='fast'
    _motionReduce={{ animation: 'none' }}
  >
    {[0, 1, 2].map((dot) => (
      <Box
        key={dot}
        w='6px'
        h='6px'
        borderRadius='full'
        bg='fg.muted'
        css={{ animation: `${dotBounce} 1.2s ease-in-out ${dot * 0.15}s infinite` }}
        _motionReduce={{ animation: 'none', opacity: 0.6 }}
      />
    ))}
  </Flex>
)

export const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.from === 'user'

  return (
    <Box
      alignSelf={isUser ? 'flex-end' : 'flex-start'}
      maxW='85%'
      px={3}
      py={2}
      fontSize='sm'
      lineHeight='1.45'
      whiteSpace='pre-wrap'
      wordBreak='break-word'
      borderRadius='xl'
      borderBottomRightRadius={isUser ? 'sm' : 'xl'}
      borderBottomLeftRadius={isUser ? 'xl' : 'sm'}
      bg={isUser ? 'fg' : 'bg.emphasized'}
      color={isUser ? 'bg' : 'fg'}
      borderWidth={message.isError ? '1px' : undefined}
      borderColor={message.isError ? 'border.error' : undefined}
      animationName='slide-from-bottom, fade-in'
      animationDuration='fast'
      _motionReduce={{ animation: 'none' }}
    >
      {message.text}
    </Box>
  )
}
