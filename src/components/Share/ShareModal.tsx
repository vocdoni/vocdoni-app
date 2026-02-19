import {
  Button,
  type ButtonProps,
  CloseButton,
  Dialog,
  Flex,
  Icon,
  Input,
  InputGroup,
  Text,
  useClipboard,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { LuShare } from 'react-icons/lu'
import {
  FacebookShare,
  MailShare,
  RedditShare,
  TelegramShare,
  TwitterShare,
  WhatsappShare,
} from '~components/Share/index'
import { useToast } from '~components/Toast'

const ShareModalButton = ({
  caption = '',
  text,
  size = 'sm',
}: {
  caption?: string
  text?: string
  size?: ButtonProps['size']
}) => {
  const { t } = useTranslation()
  const rawUrl = document.location.href.split('#')[0] // Remove the PK after the hash
  const url = encodeURIComponent(rawUrl)

  const toast = useToast()
  const { copy } = useClipboard({ value: rawUrl })
  const iconWidth = 9

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button size={size} aria-label={t('share.icon_title')} variant='plain'>
          <Icon as={LuShare} aria-hidden />
          {text && (
            <Text pl={2} as='span' fontSize={size}>
              {text}
            </Text>
          )}
        </Button>
      </Dialog.Trigger>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.CloseTrigger asChild>
            <CloseButton />
          </Dialog.CloseTrigger>
          <Dialog.Header>
            <Dialog.Title>{t('share.modal_title')}</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <Flex
              flexDirection={'row'}
              alignItems={{ base: 'start', xl: 'center' }}
              flexWrap={'wrap'}
              gap={3}
              justifyContent={'space-between'}
            >
              <TwitterShare h={iconWidth} w={iconWidth} url={url} caption={caption} />
              <FacebookShare h={iconWidth} w={iconWidth} url={url} caption={caption} />
              <TelegramShare h={iconWidth} w={iconWidth} url={url} caption={caption} />
              <RedditShare h={iconWidth} w={iconWidth} url={url} caption={caption} />
              <MailShare h={iconWidth} w={iconWidth} url={url} caption={caption} />
              <WhatsappShare h={iconWidth} w={iconWidth} url={url} caption={caption} />
            </Flex>
          </Dialog.Body>
          <Dialog.Footer>
            <InputGroup>
              <Input
                placeholder={rawUrl}
                readOnly
                truncate
                _placeholder={{
                  fontSize: 'xs',
                }}
              />
            </InputGroup>
            <Dialog.ActionTrigger asChild>
              <Button
                onClick={() => {
                  toast({
                    title: t('copy.copied_title'),
                    type: 'success',
                    duration: 3000,
                  })
                  copy()
                }}
              >
                {t('share.copy')}
              </Button>
            </Dialog.ActionTrigger>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}

export default ShareModalButton
