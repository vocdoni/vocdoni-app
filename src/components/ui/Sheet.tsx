import { CloseButton, Drawer, Portal } from '@chakra-ui/react'
import { ReactNode, RefObject } from 'react'
import { useTranslation } from 'react-i18next'

type SheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The accessible name of the sheet too */
  title: ReactNode
  /** Beside the title, before the close button (Save lives here on phones) */
  headerActions?: ReactNode
  footer?: ReactNode
  children?: ReactNode
  /** Where focus goes when it closes, e.g. the row that opened it */
  finalFocusEl?: () => HTMLElement | null
  initialFocusEl?: () => HTMLElement | null
  /** Non-modal sheets leave the page usable behind them */
  modal?: boolean
  closeOnInteractOutside?: boolean
  /** Called on a click or focus outside it; `event.preventDefault()` keeps it open */
  onInteractOutside?: Drawer.RootProps['onInteractOutside']
  /** Width from md up */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  contentRef?: RefObject<HTMLDivElement>
}

/**
 * A side panel from md up, a full-height sheet from the bottom on phones. Responsive through
 * recipe props rather than `useBreakpointValue`, so it renders the same on the server.
 */
export const Sheet = ({
  open,
  onOpenChange,
  title,
  headerActions,
  footer,
  children,
  finalFocusEl,
  initialFocusEl,
  modal = true,
  closeOnInteractOutside,
  onInteractOutside,
  size = 'md',
  contentRef,
}: SheetProps) => {
  const { t } = useTranslation()

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
      placement={{ base: 'bottom', md: 'end' }}
      size={{ base: 'full', md: size }}
      finalFocusEl={finalFocusEl}
      initialFocusEl={initialFocusEl}
      modal={modal}
      closeOnInteractOutside={closeOnInteractOutside ?? modal}
      onInteractOutside={onInteractOutside}
    >
      <Portal>
        {modal && <Drawer.Backdrop />}
        {/* Without a backdrop the positioner still spans the viewport: let clicks through to the page */}
        <Drawer.Positioner pointerEvents={modal ? undefined : 'none'}>
          <Drawer.Content ref={contentRef} pointerEvents='auto' h={{ base: '100dvh', md: 'auto' }}>
            <Drawer.Header gap={2} borderBottomWidth='1px' borderColor='border' pt={4} pb={3} px={{ base: 4, md: 6 }}>
              <Drawer.Title flex='1' minW={0} fontSize='lg' fontWeight='bolder'>
                {title}
              </Drawer.Title>
              {headerActions}
              <Drawer.CloseTrigger asChild position='static'>
                <CloseButton size='sm' aria-label={t('close', { defaultValue: 'Close' })} />
              </Drawer.CloseTrigger>
            </Drawer.Header>
            <Drawer.Body px={{ base: 4, md: 6 }} py={4}>
              {children}
            </Drawer.Body>
            {footer && (
              <Drawer.Footer
                borderTopWidth='1px'
                borderColor='border'
                px={{ base: 4, md: 6 }}
                pt={3}
                pb='calc(12px + env(safe-area-inset-bottom))'
              >
                {footer}
              </Drawer.Footer>
            )}
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  )
}
