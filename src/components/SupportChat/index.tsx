import { Button, Flex, Icon, IconButton, Presence } from '@chakra-ui/react'
import { CloseButton } from '~components/ui/CloseButton'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ChatIcon, CloseIcon } from '~theme/icons'
import { useAuth } from '~components/Auth/useAuth'
import { ChatPanel } from './ChatPanel'
import { useSupportChat } from './useSupportChat'

/**
 * Live-chat-style support widget: looks like a chat, but each conversation
 * files exactly one ticket through the organization support-ticket endpoint.
 * After a send the input is replaced by a "request sent" footer; follow-up
 * tickets require an explicit "Start a new request".
 */
const SupportChat = () => {
  const { currentAddress } = useAuth()

  if (!currentAddress) return null

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
          position='fixed'
          bottom='24'
          right='6'
          zIndex='overlay'
          align='center'
          gap='1'
          pl='4'
          pr='2'
          py='2.5'
          borderRadius='xl'
          borderBottomRightRadius='sm'
          boxShadow='shadow.floating'
          border='sm'
          borderColor='border'
          bg='bg.panel'
          animationName='[slide-from-bottom, fade-in]'
          animationDuration='moderate'
          _motionReduce={{ animation: '[none]' }}
        >
          {/* No aria-label: the visible teaser text is the accessible name, and
              must not collide with the launcher's "Open support chat" */}
          <Button variant='text' onClick={openChat}>
            {t('support_chat.teaser', { defaultValue: 'Do you need help?' })}
          </Button>
          {/* Dismissing unmounts the teaser, so hand focus back to the launcher
              instead of dropping it on <body> */}
          <CloseButton
            size='2xs'
            onClick={() => {
              dismissTeaser()
              launcherRef.current?.focus()
            }}
            aria-label={t('support_chat.teaser_dismiss', { defaultValue: 'Dismiss' })}
          />
        </Flex>
      )}

      <Presence
        present={open}
        lazyMount
        position='fixed'
        bottom='24'
        right='6'
        zIndex='overlay'
        transformOrigin='bottom right'
        animationName={{
          _open: '[slide-from-bottom, fade-in]',
          _closed: '[slide-to-bottom, fade-out]',
        }}
        animationDuration='moderate'
        _motionReduce={{ animation: '[none]' }}
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
        bottom='6'
        right='6'
        zIndex='overlay'
        variant='floating'
        aria-label={
          open
            ? t('support_chat.close_label', { defaultValue: 'Close support chat' })
            : t('support_chat.launcher_label', { defaultValue: 'Open support chat' })
        }
        aria-expanded={open}
        // The panel is lazily mounted, so only reference it once it exists
        aria-controls={open ? 'support-chat-panel' : undefined}
        onClick={open ? close : openChat}
      >
        <Icon as={open ? CloseIcon : ChatIcon} boxSize='icon.lg' />
      </IconButton>
    </>
  )
}

export default SupportChat
