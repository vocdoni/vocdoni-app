import { Box, BoxProps, Card, Heading as CHeading, Flex, FlexProps, HeadingProps } from '@chakra-ui/react'

export const DashboardBox = (props: Card.RootProps) => (
  <Card.Root variant='section' size='sm' justifyContent='space-between' gap='4' {...props} />
)

export const DashboardContents = (props: FlexProps) => <Flex flexDirection='column' w='full' p='6' {...props} />

// A block, not the card's flex column: its content runs inline text and selects together.
export const DashboardSection = (props: Card.RootProps) => (
  <Card.Root variant='sunken' size='sm' display='block' {...props} />
)

export type SidebarProps = BoxProps & {
  show: boolean
}

const sidebarPanelStyle: BoxProps = {
  height: 'full',
  width: { base: 'vw', md: 'dashboard.panel' },
  bg: 'surface.content',
  borderLeft: 'sm',
  borderColor: 'border',
  display: 'flex',
  flexDirection: 'column',
}

export const Sidebar = ({ show, ...props }: SidebarProps) => (
  <Box
    position='absolute'
    right='[0]'
    top='[0]'
    bottom='[0]'
    zIndex='docked'
    // `visibility` flips at once on open and waits out the slide on close: an
    // opening panel must take focus straight away (a blocked publish moves it to
    // the failing setting), and a transitioned one stays hidden for a while.
    transition={
      show
        ? '[transform {durations.moderate} ease, opacity {durations.moderate} ease, visibility {durations.instant}]'
        : '[transform {durations.moderate} ease, opacity {durations.moderate} ease, visibility {durations.instant} linear {durations.moderate}]'
    }
    transform={show ? 'translateX(0)' : 'translateX(100%)'}
    opacity={show ? '[1]' : '[0]'}
    // Closed, `opacity: 0` alone would leave the panel focusable and announced.
    // `visibility` (delayed on close, so it still slides out) fixes that everywhere
    // except react-select, which forces `visibility: visible` back on its own
    // input wrapper — hence `inert` too, which nothing inside can override.
    visibility={show ? 'visible' : 'hidden'}
    inert={!show}
    pointerEvents={show ? 'auto' : 'none'}
  >
    <Box as='aside' {...sidebarPanelStyle} {...props} />
  </Box>
)

export const SidebarContents = (props: BoxProps) => <Box px='4' pb='4' {...props} />

export const SidebarSubtitle = (props: HeadingProps) => (
  <CHeading as='h3' size='sm' display='flex' gap='2' alignItems='center' variant='subsection' {...props} />
)
