import { Button, ButtonProps, HStack, Text } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { Link as RouterLink } from 'react-router'
import { useAuth } from '~components/Auth/useAuth'
import { Routes } from '~src/router/routes'

export type ContactLinkProps = {
  children: ReactNode
  leftIcon?: ReactNode
} & Omit<ButtonProps, 'onClick' | 'as'>

const ContactButton = ({ children, leftIcon, ...buttonProps }: ContactLinkProps) => {
  const { isAuthenticated } = useAuth()

  return (
    <Button {...buttonProps} asChild>
      {isAuthenticated ? (
        <RouterLink to={Routes.dashboard.settings.support}>
          {leftIcon ? (
            <HStack gap={2}>
              {leftIcon}
              <Text as='span'>{children}</Text>
            </HStack>
          ) : (
            children
          )}
        </RouterLink>
      ) : (
        <a href='https://vocdoni.io/contact' target='_blank' rel='noopener noreferrer'>
          {leftIcon ? (
            <HStack gap={2}>
              {leftIcon}
              <Text as='span'>{children}</Text>
            </HStack>
          ) : (
            children
          )}
        </a>
      )}
    </Button>
  )
}

export default ContactButton
