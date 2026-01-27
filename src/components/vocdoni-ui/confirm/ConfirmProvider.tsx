import { createContext, useState, type ReactNode } from 'react'
import { ConfirmModal } from './ConfirmModal'

type ConfirmState = {
  prompt: ReactNode | null
  isOpen: boolean
  proceed: null | ((value?: unknown) => void)
  cancel: null | VoidFunction
}

type ConfirmContextValue = ConfirmState & {
  confirm: (prompt: ReactNode) => Promise<boolean>
}

const useConfirmProvider = (): ConfirmContextValue => {
  const [state, setState] = useState<ConfirmState>({
    prompt: null,
    isOpen: false,
    proceed: null,
    cancel: null,
  })

  const confirm = (prompt: ReactNode) =>
    new Promise<boolean>((resolve, reject) => {
      setState({
        prompt,
        isOpen: true,
        proceed: resolve,
        cancel: reject,
      })
    }).then(
      () => {
        setState((prev) => ({ ...prev, isOpen: false }))
        return true
      },
      () => {
        setState((prev) => ({ ...prev, isOpen: false }))
        return false
      }
    )

  return { ...state, confirm }
}

export const ConfirmContext = createContext<ConfirmContextValue | undefined>(undefined)

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const value = useConfirmProvider()
  return (
    <ConfirmContext.Provider value={value}>
      <ConfirmModal />
      {children}
    </ConfirmContext.Provider>
  )
}
