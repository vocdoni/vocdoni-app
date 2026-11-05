import { Box, Button, Flex, Heading, HStack, Icon, Spinner, Stack, Text, VisuallyHidden } from '@chakra-ui/react'
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { IconType } from 'react-icons'
import {
  LuCheck,
  LuCircleAlert,
  LuCircleCheck,
  LuCopy,
  LuExternalLink,
  LuInfo,
  LuRotateCcw,
  LuShare,
} from 'react-icons/lu'
import { Trans, useTranslation } from 'react-i18next'
import { useAppEnv } from '~src/app-env'
import { P, Panel, Small, Tiny } from './kit'
import { Consent } from './IdentifyPanel'
import {
  cleanPageUrl,
  handoffUrl,
  intentUrl,
  iosOpenUrl,
  useEscapeHandoff,
  type EscapeHandoff,
} from './useEscapeHandoff'

export type EscapeVariant = 'in-app' | 'ios-other-browser' | 'old-firefox-android'

type OpenPhase = 'idle' | 'opening' | 'blocked' | 'returned'
type CopyPhase = 'idle' | 'copied' | 'failed'

// ---------- shared pieces ----------

/** The hand-off link as selectable text so the voter can always copy it manually. */
const LinkText = ({ linkRef }: { linkRef: React.RefObject<HTMLParagraphElement | null> }) => {
  const { t } = useTranslation()
  const url = handoffUrl()
  // Split URL into base path and param so the param can be dimmed.
  const qIdx = url.indexOf('?')
  const base = qIdx >= 0 ? url.slice(0, qIdx) : url
  const param = qIdx >= 0 ? url.slice(qIdx) : ''
  // Insert <wbr> after each / so the link wraps at slashes, not mid-word.
  const parts = base.split('/')
  return (
    <Box>
      <Tiny id='escape-link-label' color='fg.muted' fontWeight='semibold' mb={1}>
        {t('cert_auth.escape.link_label', { defaultValue: 'Link to this vote' })}
      </Tiny>
      <Box border='1px solid' borderColor='border' borderRadius='md' bg='bg.muted' px={3} py={2}>
        <Text
          as='p'
          ref={linkRef}
          aria-labelledby='escape-link-label'
          fontSize='sm'
          lineHeight='1.5'
          fontFamily='mono'
          overflowWrap='anywhere'
          userSelect='all'
        >
          {parts.map((part, i) => (
            <span key={i}>
              {i > 0 && '/'}
              {part}
              {i < parts.length - 1 && <wbr />}
            </span>
          ))}
          {param && (
            <Text as='span' fontSize='sm' color='fg.muted'>
              {param}
            </Text>
          )}
        </Text>
      </Box>
    </Box>
  )
}

type Status = { tone: 'success' | 'warning' | 'info'; text: ReactNode; busy?: boolean } | null

const toneIcon: Record<'success' | 'warning' | 'info', [IconType, string]> = {
  success: [LuCircleCheck, 'fg.success'],
  warning: [LuCircleAlert, 'fg.warning'],
  info: [LuInfo, 'fg.muted'],
}

/** Always mounted so screen readers announce every change via aria-live. */
const StatusLine = ({ status }: { status: Status }) => (
  <Box role='status' aria-live='polite' aria-atomic>
    {status?.busy && <VisuallyHidden>{status.text}</VisuallyHidden>}
    {status && !status.busy && (
      <HStack align='start' gap={2} bg='bg.subtle' borderRadius='md' px={3} py={2}>
        <Icon as={toneIcon[status.tone][0]} color={toneIcon[status.tone][1]} boxSize={4} mt='3px' flexShrink={0} />
        <Small>{status.text}</Small>
      </HStack>
    )}
  </Box>
)

const StepNumber = ({ n }: { n: number }) => (
  <Flex boxSize={7} borderRadius='full' bg='bg.emphasized' align='center' justify='center' flexShrink={0} aria-hidden>
    <Small fontWeight='semibold'>{n}</Small>
  </Flex>
)

const Step = ({
  n,
  title,
  srTitle,
  children,
}: {
  n: number
  title: string
  srTitle?: string
  children?: ReactNode
}) => {
  const { t } = useTranslation()
  return (
    <Flex gap={3} align='start'>
      <StepNumber n={n} />
      <Stack gap={3} flex='1' minW={0}>
        <Heading as='h3' fontSize='md' fontWeight='semibold' lineHeight='1.4' mt='3px'>
          <VisuallyHidden>
            {t('cert_auth.escape.step_sr', { defaultValue: 'Step {{n}}: ', n })}
            {srTitle ?? title}
          </VisuallyHidden>
          <span aria-hidden>{title}</span>
        </Heading>
        {children}
      </Stack>
    </Flex>
  )
}

const bigButton = {
  size: 'lg',
  w: 'full',
  whiteSpace: 'normal',
  h: 'auto',
  minH: 12,
  py: 3,
  lineHeight: '1.3',
} as const

// ---------- buttons ----------

const CopyButton = ({ copied, solid, onCopy }: { copied: boolean; solid?: boolean; onCopy: () => void }) => {
  const { t } = useTranslation()
  return (
    <Button {...bigButton} variant={solid ? 'solid' : 'outline'} onClick={onCopy} data-testid='copy'>
      <Icon as={copied ? LuCheck : LuCopy} boxSize={5} />
      {copied
        ? t('cert_auth.escape.copied', { defaultValue: 'Link copied' })
        : t('cert_auth.escape.copy', { defaultValue: 'Copy link' })}
    </Button>
  )
}

/**
 * Android open action: a real anchor styled as a button. aria-disabled while opening keeps
 * focus stable on AT — focus would otherwise jump to body when the element is disabled.
 */
const OpenLink = ({
  phase,
  onOpen,
  openRef,
  variant,
  compact,
  label,
}: {
  phase: OpenPhase
  onOpen: (e: React.MouseEvent) => void
  openRef?: React.RefObject<HTMLAnchorElement | null>
  variant: 'solid' | 'outline'
  compact?: boolean
  label: string
}) => {
  const opening = phase === 'opening'
  return (
    <Button {...bigButton} {...(compact ? { size: 'md', minH: 11 } : {})} variant={variant} asChild>
      <a ref={openRef} href={intentUrl()} onClick={onOpen} aria-disabled={opening || undefined} data-testid='open'>
        {opening ? <Spinner size='sm' /> : <Icon as={phase === 'blocked' ? LuRotateCcw : LuExternalLink} boxSize={5} />}
        <span>{label}</span>
      </a>
    </Button>
  )
}

/** iOS tertiary: x-safari-https link, behind the kill-switch env flag. */
const TryOpenLink = ({ phase, onOpen }: { phase: OpenPhase; onOpen: (e: React.MouseEvent) => void }) => {
  const { t } = useTranslation()
  const opening = phase === 'opening'
  return (
    <Button
      variant='plain'
      size='sm'
      px={0}
      h='auto'
      alignSelf='start'
      textDecoration='underline'
      textUnderlineOffset='3px'
      whiteSpace='normal'
      asChild
    >
      <a href={iosOpenUrl()} onClick={onOpen} aria-disabled={opening || undefined} data-testid='try-open'>
        {opening ? <Spinner size='xs' /> : <Icon as={LuExternalLink} />}
        {opening
          ? t('cert_auth.escape.opening', { defaultValue: 'Opening your browser...' })
          : t('cert_auth.escape.try_open', { defaultValue: 'Try opening it for me' })}
      </a>
    </Button>
  )
}

// ---------- action blocks ----------

type EscapeHandlers = {
  openPhase: OpenPhase
  copyPhase: CopyPhase
  onOpen: (e: React.MouseEvent) => void
  onCopy: () => void
  onShare: () => void
  linkRef: React.RefObject<HTMLParagraphElement | null>
  openRef: React.RefObject<HTMLAnchorElement | null>
  hasShare: boolean
  disableIosOpenLink: boolean
}

type StatusStrings = { copied: string; copyFailed: string }
const copyStatus = (phase: CopyPhase, s: StatusStrings): Status =>
  phase === 'copied'
    ? { tone: 'success', text: s.copied }
    : phase === 'failed'
      ? { tone: 'warning', text: s.copyFailed }
      : null

type TryOpenStrings = { opening: string; blocked: string; returned: string }
const tryOpenStatus = (phase: OpenPhase, s: TryOpenStrings): Status =>
  phase === 'opening'
    ? { tone: 'info', text: s.opening, busy: true }
    : phase === 'blocked'
      ? { tone: 'warning', text: s.blocked }
      : phase === 'returned'
        ? { tone: 'info', text: s.returned }
        : null

const AndroidActions = ({ openPhase, copyPhase, onOpen, onCopy, linkRef, openRef }: EscapeHandlers) => {
  const { t } = useTranslation()
  const blocked = openPhase === 'blocked'
  const openStatus: Status =
    openPhase === 'opening'
      ? { tone: 'info', text: t('cert_auth.escape.opening', { defaultValue: 'Opening your browser...' }), busy: true }
      : openPhase === 'blocked'
        ? {
            tone: 'warning',
            text: t('cert_auth.escape.blocked', {
              defaultValue:
                "Your browser didn't open. This app may not allow it: copy the link below and paste it into your browser.",
            }),
          }
        : openPhase === 'returned'
          ? {
              tone: 'info',
              text: t('cert_auth.escape.returned', {
                defaultValue: "Did your browser open this vote? Continue there. If it didn't, copy the link below.",
              }),
            }
          : null

  return (
    <Stack gap={3}>
      <OpenLink
        phase={openPhase}
        onOpen={onOpen}
        openRef={openRef}
        variant={blocked ? 'outline' : 'solid'}
        label={
          openPhase === 'opening'
            ? t('cert_auth.escape.opening', { defaultValue: 'Opening your browser...' })
            : blocked
              ? t('cert_auth.escape.open_again', { defaultValue: 'Try opening it again' })
              : t('cert_auth.escape.open', { defaultValue: 'Open in your browser' })
        }
      />
      <Consent />
      <StatusLine
        status={
          copyPhase !== 'idle'
            ? copyStatus(copyPhase, {
                copied: t('cert_auth.escape.copied_status', {
                  defaultValue: 'Link copied. Now open your browser and paste it.',
                }),
                copyFailed: t('cert_auth.escape.copy_failed', {
                  defaultValue: "We couldn't copy it for you. Touch and hold the link below, then choose Copy.",
                }),
              })
            : openStatus
        }
      />
      <Stack gap={3} mt={2} pt={4} borderTop='1px solid' borderColor='border'>
        <Small fontWeight='semibold'>
          {blocked
            ? t('cert_auth.escape.blocked_hint', { defaultValue: 'Copy the link and paste it into your browser.' })
            : t('cert_auth.escape.if_not_open', {
                defaultValue: "If your browser doesn't open, copy the link and paste it there.",
              })}
        </Small>
        <LinkText linkRef={linkRef} />
        <CopyButton copied={copyPhase === 'copied'} solid={blocked} onCopy={onCopy} />
      </Stack>
    </Stack>
  )
}

const CopyFirstActions = ({
  platform,
  variant,
  openPhase,
  copyPhase,
  onOpen,
  onCopy,
  onShare,
  linkRef,
  hasShare,
  disableIosOpenLink,
}: EscapeHandlers & { platform: 'ios' | 'other'; variant: EscapeVariant }) => {
  const { t } = useTranslation()
  const isIos = platform === 'ios'
  // Variants without in-app mechanics don't show the app-menu instructions.
  const showMenu = variant === 'in-app'

  return (
    <Stack gap={5}>
      <Flex gap={3} align='start'>
        <Box pt='10px'>
          <StepNumber n={1} />
        </Box>
        <Stack gap={3} flex='1' minW={0}>
          <VisuallyHidden>
            <Heading as='h3'>
              {t('cert_auth.escape.step_sr', { defaultValue: 'Step {{n}}: ', n: 1 })}
              {t('cert_auth.escape.step1_sr', { defaultValue: 'Copy the link' })}
            </Heading>
          </VisuallyHidden>
          <CopyButton copied={copyPhase === 'copied'} solid onCopy={onCopy} />
          <Consent align='start' />
          <StatusLine
            status={copyStatus(copyPhase, {
              copied: t('cert_auth.escape.copied_status', {
                defaultValue: 'Link copied. Now open your browser and paste it.',
              }),
              copyFailed: t('cert_auth.escape.copy_failed', {
                defaultValue: "We couldn't copy it for you. Touch and hold the link below, then choose Copy.",
              }),
            })}
          />
          <LinkText linkRef={linkRef} />
          {hasShare && (
            <Button variant='outline' size='sm' alignSelf='start' onClick={onShare} data-testid='share'>
              <Icon as={LuShare} />
              {t('cert_auth.escape.share', { defaultValue: 'Send the link to yourself' })}
            </Button>
          )}
        </Stack>
      </Flex>
      <Step
        n={2}
        title={t('cert_auth.escape.step2', { defaultValue: 'Open your browser and paste the link in the address bar' })}
        srTitle={t('cert_auth.escape.step2', {
          defaultValue: 'Open your browser and paste the link in the address bar',
        })}
      >
        {isIos && (
          <>
            <Small color='fg.muted'>
              {t('cert_auth.escape.ios_note', {
                defaultValue:
                  "On iPhone and iPad, use the browser that was already on your device. Browsers you installed yourself can't use certificates.",
              })}
            </Small>
            {!disableIosOpenLink && <TryOpenLink phase={openPhase} onOpen={onOpen} />}
            <StatusLine
              status={tryOpenStatus(openPhase, {
                opening: t('cert_auth.escape.opening', { defaultValue: 'Opening your browser...' }),
                blocked: t('cert_auth.escape.try_open_blocked', {
                  defaultValue: "That didn't work in this app. Use Copy link above instead.",
                }),
                returned: t('cert_auth.escape.try_open_returned', {
                  defaultValue: "Did your browser open this vote? Continue there. If it didn't, use Copy link above.",
                }),
              })}
            />
          </>
        )}
      </Step>
      {showMenu && (
        <Box bg='bg.subtle' borderRadius='md' px={4} py={3}>
          <Small>
            <Trans
              i18nKey='cert_auth.escape.menu'
              components={{ b: <b /> }}
              defaults="<b>Or use this app's menu.</b> Many apps have a menu button at the top or bottom of the screen, with an option to open the page in your browser."
            />
            {isIos &&
              ' ' +
                t('cert_auth.escape.menu_ios', {
                  defaultValue: 'If it opens a browser you installed yourself, come back and copy the link instead.',
                })}
          </Small>
        </Box>
      )}
    </Stack>
  )
}

// ---------- shared open and copy state ----------

export type EscapeActions = {
  openPhase: OpenPhase
  copyPhase: CopyPhase
  onOpen: (e: React.MouseEvent) => void
  onCopy: () => void
  onShare: () => void
  linkRef: React.RefObject<HTMLParagraphElement | null>
  openRef: React.RefObject<HTMLAnchorElement | null>
}

/** Open and copy mechanics, owned once per page so the panel and the sticky action stay in step. */
export const useEscapeActions = (): EscapeActions => {
  const [openPhase, setOpenPhase] = useState<OpenPhase>('idle')
  const [copyPhase, setCopyPhase] = useState<CopyPhase>('idle')
  const linkRef = useRef<HTMLParagraphElement | null>(null)
  const openRef = useRef<HTMLAnchorElement | null>(null)
  const timer = useRef<number | undefined>(undefined)
  // Tracks whichever visibilitychange listener is currently active so it can be removed on unmount.
  const activeListenerRef = useRef<(() => void) | undefined>(undefined)

  useEffect(
    () => () => {
      window.clearTimeout(timer.current)
      if (activeListenerRef.current) {
        document.removeEventListener('visibilitychange', activeListenerRef.current)
        activeListenerRef.current = undefined
      }
    },
    []
  )

  // Back from a bfcache restore should not leave the button stuck on "Opening".
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) setOpenPhase((p) => (p === 'opening' ? 'idle' : p))
    }
    window.addEventListener('pageshow', onPageShow)
    return () => window.removeEventListener('pageshow', onPageShow)
  }, [])

  const onOpen = (e: React.MouseEvent) => {
    if (openPhase === 'opening') {
      e.preventDefault()
      return
    }
    // Let the link navigate; watch visibilitychange for 2.5 s.
    setCopyPhase('idle')
    setOpenPhase('opening')
    window.clearTimeout(timer.current)

    const onHide = () => {
      if (!document.hidden) return
      document.removeEventListener('visibilitychange', onHide)
      activeListenerRef.current = undefined
      window.clearTimeout(timer.current)
      // Page hidden = browser probably opened; wait for it to become visible again.
      const onShow = () => {
        if (document.hidden) return
        document.removeEventListener('visibilitychange', onShow)
        activeListenerRef.current = undefined
        setOpenPhase('returned')
      }
      document.addEventListener('visibilitychange', onShow)
      activeListenerRef.current = onShow
    }
    document.addEventListener('visibilitychange', onHide)
    activeListenerRef.current = onHide

    timer.current = window.setTimeout(() => {
      document.removeEventListener('visibilitychange', onHide)
      activeListenerRef.current = undefined
      setOpenPhase('blocked')
    }, 2500)
  }

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(handoffUrl())
      setCopyPhase('copied')
    } catch {
      // Fall back to execCommand, then ask the voter to copy manually.
      try {
        const range = document.createRange()
        if (linkRef.current) range.selectNodeContents(linkRef.current)
        const sel = window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(range)
        const ok = document.execCommand('copy')
        if (ok) {
          setCopyPhase('copied')
          return
        }
      } catch {
        // ignore
      }
      setCopyPhase('failed')
    }
  }

  const onShare = () => {
    // Share the clean URL: whoever receives it gets normal detection, never the hand-off param.
    navigator.share?.({ url: cleanPageUrl() }).catch(() => {})
  }

  return { openPhase, copyPhase, onOpen, onCopy: () => void onCopy(), onShare, linkRef, openRef }
}

// ---------- main panel ----------

type EscapePanelProps = { platform: 'android' | 'ios' | 'other'; variant: EscapeVariant }

const EscapePanelBody = ({ platform, variant, actions }: EscapePanelProps & { actions: EscapeActions }) => {
  const { t } = useTranslation()
  const { DISABLE_CERTIFICATE_IOS_OPEN_LINK: disableIosOpenLink = false } = useAppEnv()

  const hasShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  const sentence =
    variant === 'ios-other-browser'
      ? t('cert_auth.escape.ios_other_browser', {
          defaultValue: "This browser can't use your digital certificate. The browser that came with your device can.",
        })
      : variant === 'old-firefox-android'
        ? t('cert_auth.escape.old_firefox', {
            defaultValue:
              "This browser version can't use your digital certificate. Update it, or open this page in another browser.",
          })
        : t('cert_auth.escape.in_app', {
            defaultValue:
              "You opened this link inside an app. Its built-in viewer can't use your digital certificate, but your browser can.",
          })

  const handlers: EscapeHandlers = { ...actions, hasShare, disableIosOpenLink }

  return (
    <Panel as='section' aria-labelledby='escape-title' p={{ base: 4, md: 6 }}>
      <Heading id='escape-title' as='h2' fontSize='xl' fontWeight='semibold' lineHeight='1.3' tabIndex={-1}>
        {t('cert_auth.escape.title', { defaultValue: 'Continue in your browser' })}
      </Heading>
      <P mt={1} mb={4} as='p'>
        {sentence}
      </P>
      {platform === 'android' ? (
        <AndroidActions {...handlers} />
      ) : (
        <CopyFirstActions {...handlers} platform={platform} variant={variant} />
      )}
    </Panel>
  )
}

const OwnEscapePanel = (props: EscapePanelProps) => <EscapePanelBody {...props} actions={useEscapeActions()} />

/**
 * Panel shown when the voter opened the process page inside an app's built-in browser. Pass the page's
 * `actions` to share them with the sticky action; without them the panel keeps its own.
 */
export const EscapePanel = ({ actions, ...props }: EscapePanelProps & { actions?: EscapeActions }) =>
  actions ? <EscapePanelBody {...props} actions={actions} /> : <OwnEscapePanel {...props} />

// ---------- sticky action ----------

/** Sticky CTA that mirrors the main panel's primary action. Caller manages the shared state. */
export const EscapeStickyAction = ({
  platform,
  variant,
  openPhase = 'idle',
  copyPhase = 'idle',
  onOpen,
  onCopy,
}: {
  platform: 'android' | 'ios' | 'other'
  variant: EscapeVariant
  openPhase?: OpenPhase
  copyPhase?: CopyPhase
  onOpen: (e: React.MouseEvent) => void
  onCopy: () => void
}) => {
  const { t } = useTranslation()
  const stickyHint =
    copyPhase === 'copied'
      ? t('cert_auth.escape.sticky_copied', { defaultValue: 'Now open your browser and paste it.' })
      : copyPhase === 'failed'
        ? t('cert_auth.escape.sticky_failed', {
            defaultValue: 'Touch and hold the link in the box above, then choose Copy.',
          })
        : null

  if (platform === 'android' && openPhase !== 'blocked') {
    return (
      <OpenLink
        phase={openPhase}
        onOpen={onOpen}
        variant='outline'
        compact
        label={
          openPhase === 'opening'
            ? t('cert_auth.escape.opening', { defaultValue: 'Opening your browser...' })
            : t('cert_auth.escape.sticky_open', { defaultValue: 'Open in your browser to vote' })
        }
      />
    )
  }

  return (
    <Stack gap={1}>
      <Button {...bigButton} size='md' minH={11} variant='outline' onClick={onCopy} data-testid='sticky-copy'>
        <Icon as={copyPhase === 'copied' ? LuCheck : LuCopy} />
        {copyPhase === 'copied'
          ? t('cert_auth.escape.copied', { defaultValue: 'Link copied' })
          : t('cert_auth.escape.sticky_copy', { defaultValue: 'Copy the link to vote in your browser' })}
      </Button>
      {stickyHint && (
        <Tiny color='fg.muted' textAlign='center' aria-hidden>
          {stickyHint}
        </Tiny>
      )}
    </Stack>
  )
}

// ---------- page state ----------

export type EscapeState = EscapeHandoff & { endResume(): void; actions: EscapeActions | null }

const NO_ESCAPE: EscapeState = { browser: { kind: 'supported' }, resuming: false, endResume: () => {}, actions: null }

const EscapeContext = createContext<EscapeState | null>(null)

/** One escape state per page: the panel above the ballot and the sticky action read the same one. */
export const EscapeProvider = ({ children }: { children: ReactNode }) => {
  const { browser, resuming } = useEscapeHandoff()
  const actions = useEscapeActions()
  // Cancel or the auto-start ends the hand-off for this page load, so it never starts twice.
  const [resumeOver, setResumeOver] = useState(false)
  const endResume = useCallback(() => setResumeOver(true), [])
  const value: EscapeState = { browser, resuming: resuming && !resumeOver, endResume, actions }
  return <EscapeContext.Provider value={value}>{children}</EscapeContext.Provider>
}

/** Outside an `EscapeProvider` the browser counts as supported and nothing resumes. */
export const useEscape = () => useContext(EscapeContext) ?? NO_ESCAPE
