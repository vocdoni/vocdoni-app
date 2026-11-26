import { Box, Card, chakra, Heading, Text, type BoxProps } from '@chakra-ui/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { VoterScreenKind } from '../voter-flow'

// The pieces every voter screen is built from (boards V4Voter*, M4Voter*; conformance.md 1.0.4 element codes K, Q, H,
// GR, HI, NC). Spacing and type come from tokens and the voter text styles only.

type FrameProps = {
  kind: VoterScreenKind
  /** Screens from `welcome` on show the agenda, answers or vote ids: kept out of session replays (audit F13). */
  privateContent?: boolean
  children: ReactNode
}

/**
 * The main column's content for one screen. `data-screen` is the e2e handle of the screen on display.
 */
export const VoterScreenFrame = ({ kind, privateContent = false, children }: FrameProps) => (
  // data-testid: the e2e suite waits on the screen being shown, and the screens share every structural element.
  <Box
    data-testid='voter-screen'
    data-screen={kind}
    className={privateContent ? 'ph-no-capture' : undefined}
    display='flex'
    flexDirection='column'
  >
    {children}
  </Box>
)

export const ScreenKicker = ({ children, wide = false }: { children: ReactNode; wide?: boolean }) => (
  // `wide`: the kicker repeats the strip's label, so below `lg` it hides (the boards' `.kick.kq`).
  <Text as='p' textStyle='ballot-kicker' color='fg.subtle' display={wide ? { base: 'none', lg: 'block' } : 'block'}>
    {children}
  </Text>
)

type HeadingProps = {
  children: ReactNode
  /** Takes the focus when it mounts after a screen change (spec D4 "Accessibility"). */
  focus?: boolean
  id?: string
} & Pick<BoxProps, 'mt'>

/** The screen's one `h1`, focusable from script only. */
export const ScreenHeading = ({ children, focus = false, id, mt = '2' }: HeadingProps) => {
  const ref = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    if (focus) ref.current?.focus()
  }, [focus])
  return (
    <Heading
      as='h1'
      ref={ref}
      id={id}
      tabIndex={-1}
      textStyle='ballot-title'
      mt={mt}
      _focusVisible={{ outline: 'none' }}
    >
      {children}
    </Heading>
  )
}

export const ScreenHelp = ({ children }: { children: ReactNode }) => (
  <Text as='div' textStyle='ballot-body' color='fg.muted' mt='2.5'>
    {children}
  </Text>
)

export const ScreenLead = ({ children }: { children: ReactNode }) => (
  <Text as='p' textStyle='ballot-lead' mt='3.5'>
    {children}
  </Text>
)

export const ScreenHint = ({ children }: { children: ReactNode }) => (
  <Text as='div' textStyle='ballot-hint' color='fg.muted' mt='3.5'>
    {children}
  </Text>
)

/** A quiet in-text action in the vote's darker tone ("Surt", "Torna'l a enviar", "Mostra els resultats"). */
export const InlineAction = ({
  children,
  onClick,
  disabled,
  testId,
  ariaLabel,
}: {
  children?: ReactNode
  onClick?: () => void
  disabled?: boolean
  testId?: string
  /** Names the action when its text alone does not ("Canvia" for one question of several). */
  ariaLabel?: string
}) => (
  <chakra.button
    type='button'
    onClick={onClick}
    disabled={disabled}
    data-testid={testId}
    aria-label={ariaLabel}
    color='accent.fg'
    fontWeight='medium-plus'
    cursor='button'
    focusVisibleRing='outside'
    _disabled={{ opacity: 'inactive', cursor: 'disabled' }}
  >
    {children}
  </chakra.button>
)

/** One notice on a state screen ("Encara no es pot votar"): the voter card with a title over a quiet note. */
export const NoticeCard = ({ title, children }: { title: ReactNode; children?: ReactNode }) => (
  <Card.Root variant='ballot-notice' mt='6'>
    <Card.Title>{title}</Card.Title>
    {children ? <Card.Description>{children}</Card.Description> : null}
  </Card.Root>
)

/**
 * A sentence that holds a date in the visitor's time zone. The server renders it in its own zone; React keeps server
 * text it is told not to compare, so the node is replaced once React owns the page.
 */
export const LocalText = ({ children }: { children: ReactNode }) => {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])
  return (
    <span key={hydrated ? 'client' : 'server'} suppressHydrationWarning>
      {children}
    </span>
  )
}
