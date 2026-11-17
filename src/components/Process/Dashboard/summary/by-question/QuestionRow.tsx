import {
  Box,
  Card,
  chakra,
  Flex,
  Grid,
  Icon,
  Text,
  VisuallyHidden,
  type FlexProps,
  type TextProps,
} from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDownIcon } from '~theme/icons'

export type QuestionRowFrameProps = {
  number: number
  /** Open, paused or held: the accent edge, the number in the accent and, below `lg`, the tinted block. */
  active?: boolean
  /** Held by a whole-vote pause: below `lg` the block takes the warning tint (M4VoteOne). */
  held?: boolean
  children: ReactNode
}

/**
 * One question of Gestió's list: its number, then the row, each under a rule. From `lg` every row is padded 14 22 16;
 * below `lg` the closed and waiting rows are the phone board's compact line and the active one a tinted block.
 */
export const QuestionRowFrame = ({ number, active = false, held = false, children }: QuestionRowFrameProps) => (
  <Card.Body
    as='li'
    data-current={active ? '' : undefined}
    bg={active ? { base: held ? 'status.warning.bg' : 'bg.subtle', lg: 'transparent' } : undefined}
    pt={active ? { base: '3.5', md: '4', lg: '3.5' } : { base: '2.5', lg: '3.5' }}
    pb={active ? { base: '4', md: '4.5', lg: '4' } : { base: '2.5', lg: '4' }}
    pe={active ? undefined : { base: '2', md: '3.5', lg: 'card' }}
    borderTopWidth='hairline'
    borderColor='border'
  >
    <Grid templateColumns='[{sizes.6} minmax(0, 1fr)]' columnGap={{ base: '2', lg: '0' }} alignItems='start'>
      <Text
        textStyle='question-number'
        // The accent marks the row being worked on from `lg`; the touch boards keep every number quiet.
        color={active ? { base: 'fg.subtle', lg: 'accent.fg' } : 'fg.subtle'}
        fontWeight={active ? { base: 'normal', lg: 'medium' } : 'normal'}
      >
        {number}
      </Text>
      {children}
    </Grid>
  </Card.Body>
)

export type RowToggle = {
  expanded: boolean
  onToggle: () => void
  /** The id of the detail it shows. */
  controls: string
  /** The question's number, read before the line ("Question 1"). */
  number: number
}

/**
 * The line of a closed or waiting row. With `toggle` the whole line is a button that shows the detail under it (the
 * board's row), inside the question's `h3` (the accordion pattern); without one it is plain and `RowTitleLine` makes
 * the title the `h3`. Either way every question of the list is a heading, as the active one is.
 */
export const RowHead = ({
  toggle,
  alignItems = 'center',
  flex,
  minH,
  children,
}: {
  toggle?: RowToggle
  alignItems?: FlexProps['alignItems']
  flex?: FlexProps['flex']
  minH?: FlexProps['minH']
  children: ReactNode
}) => {
  const { t } = useTranslation()
  const layout = { display: 'flex', alignItems, minH, gap: { base: '2', lg: '3' }, minW: '0' } as const
  if (!toggle)
    return (
      <Flex {...layout} flex={flex}>
        {children}
      </Flex>
    )
  // Named by what it shows, so the name holds the visible text (WCAG 2.5.3), with the number before it and what it
  // does after it for a screen reader.
  return (
    <chakra.h3 display='flex' flex={flex} minW='0'>
      <chakra.button
        type='button'
        aria-expanded={toggle.expanded}
        aria-controls={toggle.controls}
        onClick={toggle.onToggle}
        flex='1'
        textAlign='start'
        cursor='button'
        borderRadius='sm'
        focusVisibleRing='outside'
        {...layout}
      >
        <VisuallyHidden>
          {t('votes.manage.toggle_number', { defaultValue: 'Question {{number}}:', number: toggle.number })}{' '}
        </VisuallyHidden>
        {children}
        <VisuallyHidden> {t('votes.manage.toggle_hint', { defaultValue: 'Show or hide the detail' })}</VisuallyHidden>
      </chakra.button>
    </chakra.h3>
  )
}

/**
 * The title of a closed or waiting row and what follows it (its turnout, its state): on one line from `lg`, the title
 * cut with an ellipsis; below `lg` the title on a line of its own and the rest under it. Spans: the line can be the
 * row's toggle button, which takes phrasing content only. Outside a toggle, `heading` makes the title the row's `h3`.
 */
export const RowTitleLine = ({
  title,
  color,
  align = 'baseline',
  heading = false,
  children,
}: {
  title: ReactNode
  color?: TextProps['color']
  /** How the title and what follows line up on one line (from `lg`). */
  align?: FlexProps['alignItems']
  /** The line is not inside a toggle: the title is the question's heading. */
  heading?: boolean
  children: ReactNode
}) => (
  <Flex
    as={heading ? 'div' : 'span'}
    flex='1'
    minW='0'
    wrap={{ base: 'wrap', lg: 'nowrap' }}
    align={align}
    columnGap={{ base: '2', lg: '3' }}
    rowGap='note'
  >
    <Text
      as={heading ? 'h3' : 'span'}
      display='block'
      textStyle='question-line'
      color={color}
      flexBasis={{ base: 'full', lg: 'auto' }}
      flex={{ lg: '1' }}
      minW='0'
      whiteSpace={{ lg: 'nowrap' }}
      overflow={{ lg: 'hidden' }}
      textOverflow={{ lg: 'ellipsis' }}
    >
      {title}
    </Text>
    {children}
  </Flex>
)

/** The chevron at the end of a row's line: 15px and muted from `lg`, in a 44px (40px on a tablet) box below it. */
export const RowChevron = ({ expanded }: { expanded: boolean }) => (
  <Box
    as='span'
    display='inline-flex'
    alignItems='center'
    justifyContent='center'
    flexShrink={0}
    alignSelf='center'
    boxSize={{ base: 'control.touch', md: 'control.tablet', lg: 'icon.chevron' }}
    color={{ base: 'fg.muted', lg: 'fg.subtle' }}
  >
    <Icon
      as={ChevronDownIcon}
      boxSize={{ base: 'icon.sm', lg: 'icon.chevron' }}
      transform={expanded ? 'rotate(180deg)' : undefined}
    />
  </Box>
)
