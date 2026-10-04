import { Box, Toast, Toaster, createToaster } from '@chakra-ui/react'
import { PropsWithChildren, RefObject, createContext, useContext, useLayoutEffect, useMemo } from 'react'

type ToastContextValue = ReturnType<typeof createToaster>

/** How far above the bottom edge toasts sit. Unset, they keep the toaster's default 1rem. */
export const TOAST_BOTTOM_OFFSET_VAR = '--toast-offset-bottom'
// Gap between a lifted toast and what it's lifted over
const LIFT_GAP_PX = 12

/**
 * Lifts the toasts above a bar fixed to the bottom of the screen (the selection bar) while it's
 * mounted, so a toast never covers its actions. The toaster reads the offset from a CSS variable.
 */
export const useLiftToasts = (ref: RefObject<HTMLElement | null>) => {
  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const root = document.documentElement
    const update = () => {
      // The bar's own bottom offset plus its height: transforms (its slide-in) don't change either
      const bottom = parseFloat(getComputedStyle(element).bottom) || 0
      root.style.setProperty(TOAST_BOTTOM_OFFSET_VAR, `${bottom + element.offsetHeight + LIFT_GAP_PX}px`)
    }
    update()
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(update)
    observer?.observe(element)
    window.addEventListener('resize', update)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', update)
      root.style.removeProperty(TOAST_BOTTOM_OFFSET_VAR)
    }
  }, [ref])
}

const ToastContext = createContext<ToastContextValue | null>(null)

export const ToastProvider = ({ children }: PropsWithChildren) => {
  const toaster = useMemo(
    () =>
      createToaster({
        placement: 'bottom',
        offsets: { top: '1rem', left: '1rem', right: '1rem', bottom: `var(${TOAST_BOTTOM_OFFSET_VAR}, 1rem)` },
      }),
    []
  )
  return (
    <ToastContext.Provider value={toaster}>
      {children}
      <Toaster toaster={toaster}>
        {(toast) => (
          // Titles and descriptions can name members or quote what the API refused: kept out of replays
          <Toast.Root w='fit-content' maxW='sm' mx='auto' className='ph-no-capture'>
            <Toast.Indicator />
            <Box flex='1'>
              {toast.title ? <Toast.Title>{toast.title}</Toast.Title> : null}
              {toast.description ? <Toast.Description>{toast.description}</Toast.Description> : null}
            </Box>
            {toast.action ? (
              // The toast runs the action itself on click: passing onClick too would run it twice
              <Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>
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
