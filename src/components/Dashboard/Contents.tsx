import {
  Box,
  BoxProps,
  Card,
  Heading as CHeading,
  Flex,
  FlexProps,
  HeadingProps,
  Text,
  TextProps,
} from '@chakra-ui/react'
import { ReactNode, forwardRef } from 'react'

export type DashboardCardHeaderProps = BoxProps & {
  title: ReactNode
  subtitle?: ReactNode
}

export const DashboardBox = (props: Card.RootProps) => (
  <Card.Root variant='section' size='sm' justifyContent='space-between' gap={4} {...props} />
)

export const DashboardCardHeader = ({ title, subtitle, ...props }: DashboardCardHeaderProps) => (
  <Box mb={4} {...props}>
    <CHeading as='h2' textStyle='section-title' mb={1}>
      {title}
    </CHeading>
    {subtitle && (
      <Text color='fg.muted' textStyle='body-sm'>
        {subtitle}
      </Text>
    )}
  </Box>
)

export const DashboardContents = (props: FlexProps) => <Flex flexDirection='column' w='full' p={6} {...props} />

// A block, not the card's flex column: its content runs inline text and selects together.
export const DashboardSection = (props: Card.RootProps) => (
  <Card.Root variant='sunken' size='sm' display='block' {...props} />
)

// A card's title, with room for a leading icon or a trailing badge.
export const SectionTitle = forwardRef<HTMLHeadingElement, HeadingProps>((props, ref) => (
  <CHeading textStyle='section-title' display='flex' gap={2} alignItems='center' ref={ref} {...props} />
))

export const SectionHeader = forwardRef<HTMLDivElement, FlexProps>((props, ref) => (
  <Flex flex={1} direction='column' ref={ref} {...props} />
))

export const SectionHeading = forwardRef<HTMLHeadingElement, HeadingProps>((props, ref) => (
  <CHeading size='md' ref={ref} {...props} />
))

export const SectionSubHeading = forwardRef<HTMLParagraphElement, TextProps>((props, ref) => (
  <Text color='fg.muted' textStyle='body-sm' ref={ref} {...props} />
))

export type SidebarProps = BoxProps & {
  show: boolean
}

export const Sidebar = ({ show, ...props }: SidebarProps) => (
  <Box
    position='absolute'
    right={0}
    top={0}
    bottom={0}
    zIndex='docked'
    // `visibility` flips at once on open and waits out the slide on close: an
    // opening panel must take focus straight away (a blocked publish moves it to
    // the failing setting), and a transitioned one stays hidden for a while.
    transition={
      show
        ? 'transform {durations.moderate} ease, opacity {durations.moderate} ease, visibility 0s'
        : 'transform {durations.moderate} ease, opacity {durations.moderate} ease, visibility 0s linear {durations.moderate}'
    }
    transform={show ? 'translateX(0)' : 'translateX(100%)'}
    opacity={show ? 1 : 0}
    // Closed, `opacity: 0` alone would leave the panel focusable and announced.
    // `visibility` (delayed on close, so it still slides out) fixes that everywhere
    // except react-select, which forces `visibility: visible` back on its own
    // input wrapper — hence `inert` too, which nothing inside can override.
    visibility={show ? 'visible' : 'hidden'}
    inert={!show}
    pointerEvents={show ? 'auto' : 'none'}
  >
    <Box
      height='100%'
      width={{ base: '100vw', md: 'dashboard.panel' }}
      bg='surface.content'
      borderLeft='1px solid'
      borderColor='border'
      as='aside'
      display='flex'
      flexDirection='column'
      {...props}
    />
  </Box>
)

export const SidebarContents = (props: BoxProps) => <Box px={4} pb={4} {...props} />

export const SidebarTitle = (props: HeadingProps) => (
  <CHeading as='h2' size='lg' display='flex' gap={2} alignItems='center' variant='sidebar-title' {...props} />
)
export const SidebarSubtitle = (props: HeadingProps) => (
  <CHeading as='h3' size='sm' display='flex' gap={2} alignItems='center' variant='sidebar-subtitle' {...props} />
)
