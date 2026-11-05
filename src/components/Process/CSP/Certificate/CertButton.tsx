import { Button, Icon, type ButtonProps } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { LuIdCard } from 'react-icons/lu'

type CertButtonProps = ButtonProps & { icon?: typeof LuIdCard }

/** Primary action button for the certificate flow, full-width and wrapping for long labels. */
export const CertButton = ({ children, icon = LuIdCard, ...props }: CertButtonProps) => {
  const { t } = useTranslation()
  return (
    <Button size='lg' w='full' whiteSpace='normal' h='auto' minH={12} py={3} lineHeight='1.3' {...props}>
      <Icon as={icon} boxSize={5} />
      {children ?? t('cert_auth.identify.button', { defaultValue: 'Access with your digital certificate' })}
    </Button>
  )
}
