import Cal, { getCalApi } from '@calcom/embed-react'
import { Button, ButtonProps, CloseButton, Dialog, HStack, Icon, Portal, Text } from '@chakra-ui/react'
import { useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { LuCalendar } from 'react-icons/lu'
import { useAppEnv } from '~src/app-env'
import { useColorMode } from '~theme/color-mode'

type BookerProps = {
  callback?: () => void
}

export const Booker = ({ callback }: BookerProps) => {
  const { colorMode } = useColorMode()
  const { t } = useTranslation()
  const appEnv = useAppEnv()

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

  if (!appEnv.CALCOM_EVENT_SLUG) {
    return (
      <Text>
        {t('booking.unavailable', {
          defaultValue: 'Booking is currently unavailable. Please try again later.',
        })}
      </Text>
    )
  }

  return (
    <Cal
      namespace='30min'
      calLink={appEnv.CALCOM_EVENT_SLUG}
      style={{ width: '100%', height: '100%', overflow: 'scroll' }}
      config={{ layout: 'month_view' }}
    />
  )
}

export type BookerModalButtonProps = ButtonProps &
  BookerProps & {
    leftIcon?: React.ReactNode
    iconSpacing?: ButtonProps['gap']
    trigger?: React.ReactElement
  }

export const BookerModalButton = ({
  callback,
  children,
  leftIcon,
  iconSpacing = 2,
  trigger,
  ...props
}: BookerModalButtonProps) => {
  const content = children ?? <Trans i18nKey='home.support.btn_watch' />
  const icon = leftIcon ?? <Icon as={LuCalendar} boxSize={4} />

  const triggerNode = trigger ?? (
    <Button colorPalette='gray' variant='ghost' size='md' {...props}>
      <HStack gap={iconSpacing}>
        {icon}
        <Text as='span'>{content}</Text>
      </HStack>
    </Button>
  )

  return (
    <Dialog.Root size='xl'>
      <Dialog.Trigger asChild>{triggerNode}</Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Body>
              <Booker callback={callback} />
            </Dialog.Body>
            <Dialog.CloseTrigger asChild>
              <CloseButton size='sm' />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
