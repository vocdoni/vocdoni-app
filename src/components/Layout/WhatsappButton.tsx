import { Button, HStack, Icon, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { WhatsappIcon } from '~theme/icons'
import { useAppEnv } from '~src/app-env'

interface WhatsAppButtonProps {
  noExpand?: boolean
}

export function WhatsAppButton({ noExpand }: WhatsAppButtonProps) {
  const { t } = useTranslation()
  const phoneNumber = (useAppEnv().WHATSAPP_PHONE_NUMBER ?? '').replace(/\D/g, '')
  const whatsappUrl = `https://wa.me/${phoneNumber}`

  return (
    <Button asChild role='group' variant='whatsapp' overflow='hidden'>
      <a href={whatsappUrl} target='_blank' rel='noopener noreferrer'>
        <HStack gap='[0]'>
          <Icon as={WhatsappIcon} boxSize='icon.lg' flexShrink={0} />
          {!noExpand && (
            <Text
              as='span'
              ml='[0]'
              maxW='[0]'
              opacity='[0]'
              whiteSpace='nowrap'
              overflow='hidden'
              transition='[max-width {durations.slow} ease, margin-left {durations.slow} ease, opacity {durations.moderate}]'
              _groupHover={{ maxW: '48', ml: '2', opacity: '[1]' }}
            >
              {t('whatsapp_contact', 'Talk with us!')}
            </Text>
          )}
        </HStack>
      </a>
    </Button>
  )
}
