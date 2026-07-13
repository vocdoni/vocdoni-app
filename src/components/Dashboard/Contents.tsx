import { Box, BoxProps, Heading as CHeading, Flex, FlexProps, HeadingProps, Text, TextProps } from '@chakra-ui/react'
import { ReactNode, forwardRef } from 'react'

export type DashboardCardHeaderProps = BoxProps & {
  title: ReactNode
  subtitle?: ReactNode
}

export const DashboardBox = (props: BoxProps) => (
  <Box
    borderRadius='md'
    border='1px solid'
    borderColor='border'
    p={4}
    minW={0}
    display='flex'
    flexDirection='column'
    justifyContent='space-between'
    gap={4}
    {...props}
  />
)

export const DashboardCardHeader = ({ title, subtitle, ...props }: DashboardCardHeaderProps) => (
  <Box mb={4} {...props}>
    <Text fontWeight='bold' size='2xl' mb={1}>
      {title}
    </Text>
    {subtitle && (
      <Text color='texts.subtle' size='sm'>
        {subtitle}
      </Text>
    )}
  </Box>
)

export const DashboardContents = (props: FlexProps) => (
  <Flex flexDirection='column' w='full' mx='auto' p={6} {...props} />
)

export const DashboardSection = (props: BoxProps) => (
  <Box _light={{ bg: 'bg.subtle' }} _dark={{ bg: 'whiteAlpha.50' }} p={4} borderRadius='sm' {...props} />
)

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>((props, ref) => (
  <CHeading size='2xl' fontWeight='bold' display='flex' gap={2} alignItems='center' ref={ref} {...props} />
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

export const SectionHeader = forwardRef<HTMLDivElement, FlexProps>((props, ref) => (
  <Flex flex={1} direction='column' ref={ref} {...props} />
))

export const SectionHeading = forwardRef<HTMLHeadingElement, HeadingProps>((props, ref) => (
  <CHeading size='md' ref={ref} {...props} />
))

export const SectionSubHeading = forwardRef<HTMLParagraphElement, TextProps>((props, ref) => (
  <Text color='texts.subtle' fontSize='sm' ref={ref} {...props} />
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
  <Heading as='h4' size='lg' fontWeight='bold' variant='sidebar-title' {...props} />
)
export const SidebarSubtitle = (props: HeadingProps) => (
  <Heading as='h5' size='sm' variant='sidebar-subtitle' {...props} />
)
