import { Button, ButtonProps, Dialog, HStack, Icon, Portal, Text } from '@chakra-ui/react'
import { CloseButton } from '~components/ui/CloseButton'
import { lazy, Suspense } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { CalendarIcon } from '~theme/icons'
import type { BookerProps } from './BookerEmbed'

// Loaded on first render so the Cal.com embed stays out of the dashboard shell every page preloads.
const Booker = lazy(() => import('./BookerEmbed'))

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
  iconSpacing = '2',
  trigger,
  ...props
}: BookerModalButtonProps) => {
  const { t } = useTranslation()
  const content = children ?? <Trans i18nKey='home.support.btn_watch' />
  const icon = leftIcon ?? <Icon as={CalendarIcon} boxSize='icon.sm' />

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
          {/* No title on screen, so the label names the dialog. */}
          <Dialog.Content aria-label={t('home.support.btn_watch', { defaultValue: 'Schedule a call' })}>
            <Dialog.Body>
              <Suspense fallback={null}>
                <Booker callback={callback} />
              </Suspense>
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
