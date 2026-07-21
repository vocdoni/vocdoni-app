import { chakra, CloseButton, Flex, Icon, IconButton, Presence } from '@chakra-ui/react'
import { useClient } from '@vocdoni/react-components'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { LuMessageCircle, LuX } from 'react-icons/lu'
import { ChatPanel } from './ChatPanel'
import { useSupportChat } from './useSupportChat'

/**
 * Live-chat-style support widget: looks like a chat, but each conversation
 * files exactly one ticket through the organization support-ticket endpoint.
 * After a send the input is replaced by a "request sent" footer; follow-up
 * tickets require an explicit "Start a new request".
 */
const SupportChat = () => {
  const { account } = useClient()

  if (!account?.address) return null

  return <SupportChatWidget />
}

const SupportChatWidget = () => {
  const { t } = useTranslation()
  const launcherRef = useRef<HTMLButtonElement>(null)
  const {
    open,
    openChat,
    closeChat,
    phase,
    messages,
    typing,
    teaserVisible,
    dismissTeaser,
    send,
    retry,
    startNewRequest,
  } = useSupportChat()

  const close = () => {
    closeChat()
    launcherRef.current?.focus()
  }

  return (
    <>
      {teaserVisible && !open && (
        <Flex
          role='status'
          position='fixed'
          bottom={24}
          right={6}
          zIndex='overlay'
          align='center'
          gap={1}
          pl={4}
          pr={2}
          py={2.5}
          borderRadius='xl'
          borderBottomRightRadius='sm'
          boxShadow='lg'
          border='1px solid'
          borderColor='border'
          bg='bg.panel'
          animationName='slide-from-bottom, fade-in'
          animationDuration='moderate'
          _motionReduce={{ animation: 'none' }}
        >
          <chakra.button
            type='button'
            fontSize='sm'
            fontWeight='medium'
            cursor='pointer'
            onClick={openChat}
            aria-label={t('support_chat.launcher_label', { defaultValue: 'Open support chat' })}
          >
            {t('support_chat.teaser', { defaultValue: 'Do you need help?' })}
          </chakra.button>
          <CloseButton
            size='2xs'
            onClick={dismissTeaser}
            aria-label={t('support_chat.teaser_dismiss', { defaultValue: 'Dismiss' })}
          />
        </Flex>
      )}

      <Presence
        present={open}
        lazyMount
        position='fixed'
        bottom={24}
        right={6}
        zIndex='overlay'
        transformOrigin='bottom right'
        animationName={{
          _open: 'slide-from-bottom, fade-in',
          _closed: 'slide-to-bottom, fade-out',
        }}
        animationDuration='moderate'
        _motionReduce={{ animation: 'none' }}
      >
        <ChatPanel
          open={open}
          phase={phase}
          messages={messages}
          typing={typing}
          onSend={send}
          onRetry={retry}
          onNewRequest={startNewRequest}
          onClose={close}
        />
      </Presence>

      <IconButton
        ref={launcherRef}
        position='fixed'
        bottom={6}
        right={6}
        zIndex='overlay'
        w='52px'
        h='52px'
        borderRadius='full'
        boxShadow='lg'
        aria-label={
          open
            ? t('support_chat.close_label', { defaultValue: 'Close support chat' })
            : t('support_chat.launcher_label', { defaultValue: 'Open support chat' })
        }
        aria-expanded={open}
        aria-controls='support-chat-panel'
        onClick={open ? close : openChat}
        transition='transform 0.15s'
        _hover={{ transform: 'scale(1.06)' }}
        _active={{ transform: 'scale(0.96)' }}
        _motionReduce={{ transition: 'none', _hover: { transform: 'none' }, _active: { transform: 'none' } }}
      >
        <Icon as={open ? LuX : LuMessageCircle} boxSize={6} />
      </IconButton>
    </>
  )
}

export default SupportChat
