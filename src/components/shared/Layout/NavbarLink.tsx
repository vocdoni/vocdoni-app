import { Button, HStack, Text } from '@chakra-ui/react'
import { ReactElement, ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'

export type NavbarLink = {
  name: ReactNode
  to: string
  icon: ReactElement
  private?: boolean
}

const NavbarLink = ({ name, to, icon }: NavbarLink) => {
  const location = useLocation()
  const isActive = to === location.pathname

  return (
    <Button
      asChild
      justifyContent='start'
      w='full'
      data-active={isActive ? '' : undefined}
      aria-current={isActive ? 'page' : undefined}
    >
      <Link to={to}>
        <HStack gap={2}>
          {icon}
          <Text as='span'>{name}</Text>
        </HStack>
      </Link>
    </Button>
  )
}

export default NavbarLink
