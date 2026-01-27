import { useContext } from 'react'
import { ConfirmContext } from './ConfirmProvider'

export const useConfirm = () => {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error(
      'useConfirm returned `undefined`, maybe you forgot to wrap the component within <ConfirmProvider />?'
    )
  }
  return context
}
