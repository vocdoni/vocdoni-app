import { Box, BoxProps, Heading as CHeading, Flex, FlexProps, HeadingProps, Text, TextProps } from '@chakra-ui/react'
import { ReactNode, forwardRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import type { DashboardOutletContext } from '~elements/LayoutDashboard'

export type DashboardCardHeaderProps = BoxProps & {
  title: ReactNode
  subtitle?: ReactNode
}

export const DashboardBox = (props: BoxProps) => (
  <Box
    borderRadius='md'
    border='1px solid'
    _dark={{ borderColor: 'brand.700' }}
    _light={{ borderColor: 'gray.200' }}
    p={4}
    display='flex'
    flexDirection='column'
    flexWrap='wrap'
    justifyContent='space-between'
    gap={4}
    {...props}
  />
)

export const DashboardCardHeader = ({ title, subtitle, ...props }: DashboardCardHeaderProps) => (
  <Box mb={4} {...props}>
    <Text fontWeight='bold' fontSize='2xl' mb={1}>
      {title}
    </Text>
    {subtitle && (
      <Text color='texts.subtle' fontSize='sm'>
        {subtitle}
      </Text>
    )}
  </Box>
)

export const DashboardContents = (props: FlexProps) => {
  const context = useOutletContext<DashboardOutletContext | undefined>()
  const maxW = context?.reduced ? 'dashboard-content.reduced' : 'dashboard-content.default'

  return <Flex flexDirection='column' maxW={maxW} w='full' mx='auto' p={6} {...props} />
}

export const DashboardSection = (props: BoxProps) => (
  <Box _light={{ bg: 'gray.50' }} _dark={{ bg: 'whiteAlpha.50' }} p={4} borderRadius='sm' {...props} />
)

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>((props, ref) => (
  <CHeading
    size='sm'
    fontSize='2xl'
    fontWeight='bold'
    display='flex'
    gap={2}
    alignItems='center'
    ref={ref}
    {...props}
  />
))

export const SubHeading = forwardRef<HTMLParagraphElement, TextProps>((props, ref) => (
  <Text
    mt={2}
    mb={4}
    fontSize='md'
    color='texts.subtle'
    display='flex'
    gap={2}
    alignItems='center'
    ref={ref}
    {...props}
  />
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
    zIndex={10}
    transition='transform 0.2s ease, opacity 0.2s ease'
    transform={show ? 'translateX(0)' : 'translateX(100%)'}
    opacity={show ? 1 : 0}
    pointerEvents={show ? 'auto' : 'none'}
  >
    <Box
      height='100%'
      width={{ base: '100vw', md: 'sidebar' }}
      bg='chakra.body.bg'
      borderLeft='1px solid'
      borderColor='table.border'
      as='aside'
      display='flex'
      flexDirection='column'
      {...props}
    />
  </Box>
)

export const SidebarContents = (props: BoxProps) => <Box px={4} pb={4} {...props} />

export const SidebarTitle = (props: HeadingProps) => (
  <Heading as='h4' fontSize='lg' fontWeight='bold' variant='sidebar-title' {...props} />
)
export const SidebarSubtitle = (props: HeadingProps) => (
  <Heading as='h5' fontSize='sm' variant='sidebar-subtitle' {...props} />
)
