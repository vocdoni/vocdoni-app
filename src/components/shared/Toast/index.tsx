import { Box, Toast, Toaster, createToaster } from '@chakra-ui/react'
import { PropsWithChildren, createContext, useContext, useMemo } from 'react'

type ToastContextValue = ReturnType<typeof createToaster>

const ToastContext = createContext<ToastContextValue | null>(null)

export const ToastProvider = ({ children }: PropsWithChildren) => {
  const toaster = useMemo(() => createToaster({ placement: 'bottom' }), [])
  return (
    <ToastContext.Provider value={toaster}>
      {children}
      <Toaster toaster={toaster}>
        {(toast) => (
          <Toast.Root w='fit-content' maxW='sm' mx='auto'>
            <Toast.Indicator />
            <Box flex='1'>
              {toast.title ? <Toast.Title>{toast.title}</Toast.Title> : null}
              {toast.description ? <Toast.Description>{toast.description}</Toast.Description> : null}
            </Box>
            {toast.action ? (
              <Toast.ActionTrigger onClick={toast.action.onClick}>{toast.action.label}</Toast.ActionTrigger>
            ) : null}
            {toast.closable ? <Toast.CloseTrigger /> : null}
          </Toast.Root>
        )}
      </Toaster>
    </ToastContext.Provider>
  )
}

type ToastOptions = Parameters<ToastContextValue['create']>[0]
type ToastOptionsInput = ToastOptions & {
  status?: ToastOptions['type']
  isClosable?: boolean
  duration?: ToastOptions['duration'] | null
}

type ToastFn = ((options: ToastOptionsInput) => ReturnType<ToastContextValue['create']>) & {
  close: (id?: string) => void
  closeAll: () => void
  update: (id: string, options: Partial<ToastOptions>) => void
  isActive: (id?: string) => boolean
}

export const useToast = (): ToastFn => {
  const toaster = useContext(ToastContext)
  if (!toaster) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  const toast = ((options: ToastOptionsInput) => {
    const { status, isClosable, duration, ...rest } = options
    return toaster.create({
      ...rest,
      type: rest.type ?? status,
      closable: rest.closable ?? isClosable,
      duration: duration === null ? Infinity : duration,
    })
  }) as ToastFn
  toast.close = (id?: string) => toaster.dismiss(id)
  toast.closeAll = () => toaster.dismiss()
  toast.update = (id: string, options: Partial<ToastOptions>) => toaster.update(id, options)
  toast.isActive = (id?: string) => Boolean(id && toaster.getVisibleToasts().some((toastItem) => toastItem.id === id))
  return toast
}
