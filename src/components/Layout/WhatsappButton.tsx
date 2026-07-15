import { Button, HStack, Icon, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { MdOutlineWhatsapp } from 'react-icons/md'
import { useAppEnv } from '~src/app-env'

interface WhatsAppButtonProps {
  noExpand?: boolean
}

export function WhatsAppButton({ noExpand }: WhatsAppButtonProps) {
  const { t } = useTranslation()
  const phoneNumber = (useAppEnv().WHATSAPP_PHONE_NUMBER ?? '').replace(/\D/g, '')
  const whatsappUrl = `https://wa.me/${phoneNumber}`

  return (
    <Button
      asChild
      role='group'
      bg='whatsapp.500'
      color='white'
      _hover={{ bg: 'whatsapp.600' }}
      px='4'
      display='inline-flex'
      alignItems='center'
      justifyContent='center'
      overflow='hidden'
      transition='background-color 0.2s ease-in-out'
    >
      <a href={whatsappUrl} target='_blank' rel='noopener noreferrer'>
        <HStack gap={0}>
          <Icon as={MdOutlineWhatsapp} boxSize={6} flexShrink={0} />
          {!noExpand && (
            <Text
              as='span'
              ml={0}
              maxW={0}
              opacity={0}
              whiteSpace='nowrap'
              overflow='hidden'
              transition='max-width 0.3s ease, margin-left 0.3s ease, opacity 0.2s'
              _groupHover={{ maxW: '12rem', ml: 2, opacity: 1 }}
            >
              {t('whatsapp_contact', 'Talk with us!')}
            </Text>
          )}
        </HStack>
      </a>
    </Button>
  )
}
