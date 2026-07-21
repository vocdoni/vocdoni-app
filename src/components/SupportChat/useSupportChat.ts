import { useSessionStorage } from '@uidotdev/usehooks'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SessionStorageKeys } from '~constants'
import { useProfile } from '~src/queries/account'
import { SupportTicket, useSendSupportTicket } from '~src/queries/support'

export type ChatPhase = 'greeting' | 'idle' | 'ask_name' | 'sending' | 'sent' | 'error'

type Message = {
  id: string
  from: 'support' | 'user'
  text: string
  isError?: boolean
  // 'contact' bubbles render the book-a-call / WhatsApp buttons underneath
  kind?: 'contact'
}

const TEASER_DELAY = 30_000
const GREETING_DELAY = 900
const INTRO_DELAY = 1_600
const CONTACT_DELAY = 2_300
const MIN_SENDING_DELAY = 800
const TITLE_MAX_LENGTH = 80
// Backend-facing triage metadata, not user-visible
const TICKET_TYPE = 'other'
const TITLE_PREFIX = '[Chat] '

const ticketTitle = (message: string) => {
  const firstLine = message.split('\n')[0].trim()
  const truncated = firstLine.length > TITLE_MAX_LENGTH ? `${firstLine.slice(0, TITLE_MAX_LENGTH - 1)}…` : firstLine
  return `${TITLE_PREFIX}${truncated}`
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const useSupportChat = () => {
  const { t } = useTranslation()
  const { data: profile } = useProfile()
  const { mutateAsync: sendTicket } = useSendSupportTicket()

  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<ChatPhase>('greeting')
  const [messages, setMessages] = useState<Message[]>([])
  const [typing, setTyping] = useState(false)
  const [providedName, setProvidedName] = useState('')

  // Session-scoped: the teaser stays dismissed for this browser session (across
  // reloads) but nudges the user again on their next visit.
  const [teaserDismissed, setTeaserDismissed] = useSessionStorage(SessionStorageKeys.SupportChatTeaserDismissed, false)
  const [teaserVisible, setTeaserVisible] = useState(false)

  const greetedRef = useRef(false)
  const pendingMessageRef = useRef('')
  const lastTicketRef = useRef<SupportTicket | null>(null)
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const messageIdRef = useRef(0)
  // Delayed callbacks (greeting, confirmation) must read the latest profile,
  // not the snapshot captured when they were scheduled — the profile query may
  // resolve in between.
  const profileRef = useRef(profile)
  profileRef.current = profile

  const profileName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ')
  const name = profileName || providedName

  const schedule = (fn: () => void, ms: number) => {
    timeoutsRef.current.push(setTimeout(fn, ms))
  }

  // Clear any scripted-conversation timers on unmount
  useEffect(() => () => timeoutsRef.current.forEach(clearTimeout), [])

  useEffect(() => {
    if (open || teaserDismissed) return
    const id = setTimeout(() => setTeaserVisible(true), TEASER_DELAY)
    return () => clearTimeout(id)
  }, [open, teaserDismissed])

  const dismissTeaser = () => {
    setTeaserVisible(false)
    setTeaserDismissed(true)
  }

  const pushMessage = (from: Message['from'], text: string, extra?: Pick<Message, 'isError' | 'kind'>) => {
    messageIdRef.current += 1
    setMessages((prev) => [...prev, { id: `msg-${messageIdRef.current}`, from, text, ...extra }])
  }

  const openChat = () => {
    setOpen(true)
    dismissTeaser()
    if (greetedRef.current) return
    greetedRef.current = true
    setTyping(true)
    schedule(() => {
      const firstName = profileRef.current?.firstName
      pushMessage(
        'support',
        firstName
          ? t('support_chat.greeting', {
              defaultValue: 'Hi {{name}}, welcome to Vocdoni support!',
              name: firstName,
            })
          : t('support_chat.greeting_no_name', { defaultValue: 'Hi there, welcome to Vocdoni support!' })
      )
    }, GREETING_DELAY)
    schedule(() => {
      pushMessage(
        'support',
        t('support_chat.greeting_intro', {
          defaultValue:
            "If you need help with the platform, want to know how to start a vote, have a request for a voting process, or need support of any kind — describe it in a single message below and we'll get back to you by email.",
        })
      )
    }, INTRO_DELAY)
    schedule(() => {
      pushMessage(
        'support',
        t('support_chat.contact_options', {
          defaultValue: 'Prefer to talk? You can also book a call with our team or message us on WhatsApp.',
        }),
        { kind: 'contact' }
      )
      setTyping(false)
      setPhase('idle')
    }, CONTACT_DELAY)
  }

  const closeChat = () => setOpen(false)

  const buildTicket = (message: string, senderName: string): SupportTicket => ({
    title: ticketTitle(message),
    type: TICKET_TYPE,
    description: senderName ? `${message}\n\n— ${senderName}` : message,
  })

  const submitTicket = async (ticket: SupportTicket, senderName: string) => {
    lastTicketRef.current = ticket
    setPhase('sending')
    setTyping(true)
    try {
      // The minimum delay keeps the typing indicator from flashing on fast
      // responses; allSettled (rather than all) applies it to failures too
      const [sendResult] = await Promise.allSettled([sendTicket(ticket), delay(MIN_SENDING_DELAY)])
      if (sendResult.status === 'rejected') {
        throw sendResult.reason
      }
      setTyping(false)
      const email = profileRef.current?.email
      let confirmation: string
      if (senderName && email) {
        confirmation = t('support_chat.confirmation', {
          defaultValue:
            "Thanks, {{name}}! We've received your message and we'll get back to you at {{email}} as soon as possible.",
          name: senderName.split(' ')[0],
          email,
        })
      } else if (email) {
        confirmation = t('support_chat.confirmation_no_name', {
          defaultValue:
            "Thanks! We've received your message and we'll get back to you at {{email}} as soon as possible.",
          email,
        })
      } else {
        // No known email address (profile still loading) — keep it generic
        confirmation = t('support_chat.confirmation_generic', {
          defaultValue: "Thanks! We've received your message and we'll reply by email as soon as possible.",
        })
      }
      pushMessage('support', confirmation)
      setPhase('sent')
    } catch {
      setTyping(false)
      pushMessage(
        'support',
        t('support_chat.error', { defaultValue: "Sorry — we couldn't send your message. Please try again." }),
        { isError: true }
      )
      setPhase('error')
    }
  }

  const send = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || phase === 'sending' || phase === 'greeting' || phase === 'sent') return
    pushMessage('user', trimmed)
    if (phase === 'ask_name') {
      setProvidedName(trimmed)
      submitTicket(buildTicket(pendingMessageRef.current, trimmed), trimmed)
      return
    }
    if (!name) {
      // Hold the message until we know who we're talking to
      pendingMessageRef.current = trimmed
      setTyping(true)
      schedule(() => {
        pushMessage('support', t('support_chat.ask_name', { defaultValue: "Before we send that — what's your name?" }))
        setTyping(false)
        setPhase('ask_name')
      }, MIN_SENDING_DELAY)
      return
    }
    submitTicket(buildTicket(trimmed, name), name)
  }

  const retry = () => {
    if (!lastTicketRef.current) return
    submitTicket(lastTicketRef.current, name)
  }

  // Deliberate follow-ups only: after a ticket is sent the input is replaced by
  // a "request sent" footer, and this reopens the conversation for a fresh,
  // independent ticket.
  const startNewRequest = () => {
    if (phase !== 'sent') return
    pushMessage('support', t('support_chat.new_request_prompt', { defaultValue: 'What else can we help you with?' }))
    setPhase('idle')
  }

  return {
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
  }
}
