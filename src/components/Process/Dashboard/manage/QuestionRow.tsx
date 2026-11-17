import { Box, Card, chakra, Flex, Grid, Icon, Text, type FlexProps } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { ChevronDownIcon } from '~theme/icons'

export type QuestionRowFrameProps = {
  number: number
  /** Open, paused or held: the accent edge, the number in the accent and, below `lg`, the tinted block. */
  active?: boolean
  children: ReactNode
}

/**
 * One question of the Gestió list: its number, then the row. From `lg` every row is padded 14 22 16 under a rule;
 * below `lg` the closed and waiting rows are the phone board's compact line and the active one a tinted block.
 */
export const QuestionRowFrame = ({ number, active = false, children }: QuestionRowFrameProps) => (
  <Card.Body
    as='li'
    data-current={active ? '' : undefined}
    bg={active ? { base: 'bg.subtle', lg: 'transparent' } : undefined}
    pt={active ? { base: '3.5', md: '4', lg: '3.5' } : { base: '2.5', lg: '3.5' }}
    pb={active ? { base: '4', md: '4.5', lg: '4' } : { base: '2.5', lg: '4' }}
    pe={active ? undefined : { base: '2', md: '3.5', lg: 'card' }}
    borderTopWidth={{ lg: 'hairline' }}
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
  /** "Question 1, Budget. Yes. Show or hide the detail". */
  label: string
}

/**
 * The line of a closed or waiting row. With `toggle` the whole line is a button that shows the detail under it (the
 * board's row); without one it is plain.
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
  const layout = { display: 'flex', alignItems, flex, minH, gap: { base: '2', lg: '3' }, minW: '0' } as const
  if (!toggle) return <Flex {...layout}>{children}</Flex>
  return (
    <chakra.button
      type='button'
      aria-expanded={toggle.expanded}
      aria-controls={toggle.controls}
      aria-label={toggle.label}
      onClick={toggle.onToggle}
      w='full'
      textAlign='start'
      cursor='button'
      borderRadius='sm'
      focusVisibleRing='outside'
      {...layout}
    >
      {children}
    </chakra.button>
  )
}

/** The chevron at the end of a row's line: 15px and muted from `lg`, in a 44px (40px on a tablet) box below it. */
export const RowChevron = ({ expanded, desktopOnly = false }: { expanded: boolean; desktopOnly?: boolean }) => (
  <Box
    as='span'
    display={{ base: desktopOnly ? 'none' : 'inline-flex', lg: 'inline-flex' }}
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
