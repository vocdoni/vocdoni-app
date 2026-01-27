import { Button, Flex, Icon, Input, InputGroup, Text, useClipboard, useDisclosure } from '@chakra-ui/react'
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
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '~shared/Modal/Modal'
import { useToast } from '~shared/Toast'

const ShareModalButton = ({ caption = '', text, size = 'sm' }: { caption?: string; text?: string; size?: string }) => {
  const { t } = useTranslation()
  const { open: isOpen, onOpen, onClose } = useDisclosure()
  const rawUrl = document.location.href.split('#')[0] // Remove the PK after the hash
  const url = encodeURIComponent(rawUrl)

  const toast = useToast()
  const { copy } = useClipboard({ value: rawUrl })
  const iconWidth = 9

  return (
    <>
      <Button onClick={onOpen} fontSize={size} aria-label={t('share.icon_title')}>
        <Icon as={LuShare} aria-hidden />
        {text && (
          <Text pl={2} as='span' fontSize={size}>
            {text}
          </Text>
        )}
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('share.modal_title')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody mt={8}>
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
          </ModalBody>
          <ModalFooter mt={8}>
            <Flex direction={'column'} gap={4} w={'full'}>
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
              <Button
                onClick={() => {
                  toast({
                    title: t('copy.copied_title'),
                    duration: 3000,
                  })
                  copy()
                }}
              >
                {t('share.copy')}
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default ShareModalButton
