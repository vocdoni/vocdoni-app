import { Box, Button, CloseButton, Flex, Icon, IconButton, Text, Textarea } from '@chakra-ui/react'
import { Fragment, KeyboardEvent, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuCalendar, LuCheck, LuHeadset, LuSend } from 'react-icons/lu'
import { MdOutlineWhatsapp } from 'react-icons/md'
import { BookerModalButton } from '~components/Dashboard/Booker'
import { useAppEnv } from '~src/app-env'
import { MessageBubble, TypingIndicator } from './Messages'
import { ChatMessage, ChatPhase } from './useSupportChat'

const IS_MAC = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform)
const SEND_SHORTCUT = IS_MAC ? '⌘+Enter' : 'Ctrl+Enter'

const ContactActionsRow = () => {
  const { t } = useTranslation()
  const { CALCOM_EVENT_SLUG, WHATSAPP_PHONE_NUMBER } = useAppEnv()
  const phoneNumber = (WHATSAPP_PHONE_NUMBER ?? '').replace(/\D/g, '')

  return (
    <Flex
      alignSelf='flex-start'
      gap={2}
      flexWrap='wrap'
      animationName='slide-from-bottom, fade-in'
      animationDuration='fast'
      _motionReduce={{ animation: 'none' }}
    >
      {CALCOM_EVENT_SLUG && (
        <BookerModalButton
          size='xs'
          variant='outline'
          colorPalette='gray'
          leftIcon={<Icon as={LuCalendar} boxSize={3.5} />}
        >
          {t('support_chat.book_call', { defaultValue: 'Book a call' })}
        </BookerModalButton>
      )}
      {phoneNumber && (
        <Button asChild size='xs' variant='outline' colorPalette='gray'>
          <a href={`https://wa.me/${phoneNumber}`} target='_blank' rel='noopener noreferrer'>
            <Icon as={MdOutlineWhatsapp} boxSize={3.5} />
            {t('support_chat.whatsapp', { defaultValue: 'Chat on WhatsApp' })}
          </a>
        </Button>
      )}
    </Flex>
  )
}

type ChatPanelProps = {
  open: boolean
  phase: ChatPhase
  messages: ChatMessage[]
  typing: boolean
  onSend: (text: string) => void
  onRetry: () => void
  onNewRequest: () => void
  onClose: () => void
}

export const ChatPanel = ({
  open,
  phase,
  messages,
  typing,
  onSend,
  onRetry,
  onNewRequest,
  onClose,
}: ChatPanelProps) => {
  const { t } = useTranslation()
  const [draft, setDraft] = useState('')
  // Armed the first time the draft gains a newline; users who expect Enter to
  // send get told how sending actually works. Re-arms after each send.
  const [showSendHint, setShowSendHint] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const isSent = phase === 'sent'

  useEffect(() => {
    if (open && !isSent) {
      inputRef.current?.focus()
    }
  }, [open, isSent])

  useEffect(() => {
    // Optional call: scrollIntoView is not implemented in jsdom
    bottomRef.current?.scrollIntoView?.({ block: 'end' })
  }, [messages, typing])

  const canSend = draft.trim().length > 0 && phase !== 'sending' && phase !== 'greeting'

  const submit = () => {
    if (!canSend) return
    onSend(draft)
    setDraft('')
    setShowSendHint(false)
  }

  // A send files a whole ticket, so plain Enter only adds a newline — sending
  // is explicit: the send button or Cmd/Ctrl+Enter.
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <Flex
      id='support-chat-panel'
      role='dialog'
      aria-label={t('support_chat.header_title', { defaultValue: 'Vocdoni Support' })}
      direction='column'
      w='sm'
      maxW='calc(100vw - 2rem)'
      maxH='min(560px, calc(100dvh - 8rem))'
      borderRadius='2xl'
      boxShadow='xl'
      border='1px solid'
      borderColor='border'
      bg='bg.panel'
      overflow='hidden'
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          onClose()
        }
      }}
    >
      <Flex align='center' gap={3} px={4} py={3} borderBottomWidth='1px' borderColor='border' bg='dashboard.menu'>
        <Flex align='center' justify='center' w='38px' h='38px' borderRadius='full' bg='bg.emphasized' flexShrink={0}>
          <Icon as={LuHeadset} boxSize={5} />
        </Flex>
        <Box flex='1' minW={0}>
          <Text fontWeight='bold' fontSize='sm' truncate>
            {t('support_chat.header_title', { defaultValue: 'Vocdoni Support' })}
          </Text>
          <Text fontSize='xs' color='fg.muted' truncate>
            {t('support_chat.header_subtitle', { defaultValue: "We'll get back to you by email" })}
          </Text>
        </Box>
        <CloseButton
          size='sm'
          onClick={onClose}
          aria-label={t('support_chat.close_label', { defaultValue: 'Close support chat' })}
        />
      </Flex>

      <Flex
        direction='column'
        gap={2}
        px={4}
        py={4}
        flex='1'
        minH='240px'
        overflowY='auto'
        aria-live='polite'
        aria-label={t('support_chat.messages_label', { defaultValue: 'Support conversation' })}
      >
        {messages.map((message) => (
          <Fragment key={message.id}>
            <MessageBubble message={message} />
            {message.kind === 'contact' && <ContactActionsRow />}
          </Fragment>
        ))}
        {phase === 'error' && (
          <Button alignSelf='flex-start' size='xs' variant='outline' colorPalette='gray' onClick={onRetry}>
            {t('support_chat.retry', { defaultValue: 'Try again' })}
          </Button>
        )}
        {typing && <TypingIndicator />}
        <Box ref={bottomRef} />
      </Flex>

      {showSendHint && !isSent && (
        <Text
          role='status'
          px={4}
          pb={1}
          fontSize='xs'
          color='fg.muted'
          animationName='fade-in'
          animationDuration='fast'
          _motionReduce={{ animation: 'none' }}
        >
          {t('support_chat.send_hint', {
            defaultValue: "When you're done, send with the send button or {{shortcut}}.",
            shortcut: SEND_SHORTCUT,
          })}
        </Text>
      )}

      {isSent ? (
        <Flex align='center' justify='space-between' gap={3} px={4} py={3} borderTopWidth='1px' borderColor='border'>
          {/* role='status' sits on the non-interactive text only — a live region
              must not contain the button next to it */}
          <Flex role='status' align='center' gap={1.5} fontSize='xs' color='fg.muted' minW={0}>
            <Icon as={LuCheck} boxSize={3.5} flexShrink={0} />
            <Text fontSize='xs'>
              {t('support_chat.sent_status', { defaultValue: "Request sent — we'll reply by email" })}
            </Text>
          </Flex>
          <Button size='xs' variant='outline' colorPalette='gray' flexShrink={0} onClick={onNewRequest}>
            {t('support_chat.new_request', { defaultValue: 'Start a new request' })}
          </Button>
        </Flex>
      ) : (
        <Flex align='flex-end' gap={2} px={3} py={3} borderTopWidth='1px' borderColor='border'>
          <Textarea
            ref={inputRef}
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value)
              if (event.target.value.includes('\n')) {
                setShowSendHint(true)
              }
            }}
            onKeyDown={onKeyDown}
            placeholder={t('support_chat.input_placeholder', { defaultValue: 'Describe your request…' })}
            aria-label={t('support_chat.input_placeholder', { defaultValue: 'Describe your request…' })}
            autoresize
            rows={1}
            maxH='120px'
            fontSize='sm'
            borderRadius='xl'
          />
          <IconButton
            aria-label={t('support_chat.send_label', { defaultValue: 'Send message' })}
            onClick={submit}
            disabled={!canSend}
            borderRadius='full'
            size='sm'
          >
            <LuSend />
          </IconButton>
        </Flex>
      )}
    </Flex>
  )
}
