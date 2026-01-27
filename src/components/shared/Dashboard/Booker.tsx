import Cal, { getCalApi } from '@calcom/embed-react'
import { Button, ButtonProps, Code, HStack, Icon, Text, useDisclosure } from '@chakra-ui/react'
import { useColorMode } from '~theme/color-mode'
import { useEffect } from 'react'
import { Trans } from 'react-i18next'
import { LuCalendar } from 'react-icons/lu'
import { SetupStepIds, useOrganizationSetup } from '~queries/organization'
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay } from '~shared/Modal/Modal'

type BookerProps = {
  callback?: () => void
}

export const Booker = ({ callback }: BookerProps) => {
  const { colorMode } = useColorMode()

  useEffect(() => {
    ;(async function () {
      const cal = await getCalApi({ namespace: '30min' })
      cal('ui', { hideEventTypeDetails: false, layout: 'month_view', theme: colorMode })
      cal('on', {
        action: 'bookingSuccessfulV2',
        callback,
      })
    })()
  }, [])

  if (!import.meta.env.CALCOM_EVENT_SLUG) {
    return (
      <Text>
        Hey developer, you forgot to define <Code>CALCOM_EVENT_SLUG</Code> env var 🥲
      </Text>
    )
  }

  return (
    <Cal
      namespace='30min'
      calLink={import.meta.env.CALCOM_EVENT_SLUG}
      style={{ width: '100%', height: '100%', overflow: 'scroll' }}
      config={{ layout: 'month_view' }}
    />
  )
}

export type BookerModalButtonProps = ButtonProps &
  BookerProps & {
    leftIcon?: React.ReactNode
    iconSpacing?: ButtonProps['gap']
  }

export const BookerModalButton = ({
  callback,
  children,
  leftIcon,
  iconSpacing = 2,
  ...props
}: BookerModalButtonProps) => {
  const { open: isOpen, onOpen, onClose } = useDisclosure()
  const content = children ?? <Trans i18nKey='home.support.btn_watch' />
  const icon = leftIcon ?? <Icon as={LuCalendar} boxSize={4} />

  return (
    <>
      <Button colorScheme='gray' variant='outline' whiteSpace='wrap' size='md' onClick={onOpen} {...props}>
        <HStack gap={iconSpacing}>
          {icon}
          <Text as='span'>{content}</Text>
        </HStack>
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} size='full'>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody>
            <Booker callback={callback} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export const DashboardBookerModalButton = (props: BookerModalButtonProps) => {
  const { setStepDone } = useOrganizationSetup()

  return (
    <BookerModalButton
      callback={() => {
        setStepDone(SetupStepIds.expertCallBooking)
      }}
      {...props}
    />
  )
}
