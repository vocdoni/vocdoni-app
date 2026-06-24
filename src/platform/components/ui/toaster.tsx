import { Box, Spinner, Toast, Toaster as ChakraToaster, createToaster, Portal } from '@chakra-ui/react'

export const toaster = createToaster({
  placement: 'bottom-end',
  pauseOnPageIdle: true,
})

export const Toaster = () => (
  <Portal>
    <ChakraToaster toaster={toaster} insetInline={{ mdDown: '4' }}>
      {(toast) => (
        <Toast.Root width={{ md: 'sm' }}>
          {toast.type === 'loading' ? <Spinner size='sm' color='blue.solid' /> : <Toast.Indicator />}
          <Box flex='1' maxWidth='100%'>
            {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
            {toast.description && <Toast.Description>{toast.description}</Toast.Description>}
          </Box>
          {toast.closable && <Toast.CloseTrigger />}
        </Toast.Root>
      )}
    </ChakraToaster>
  </Portal>
)
