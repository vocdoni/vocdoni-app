import { useState, type ReactNode } from 'react'

export const useConfirm = () => {
  const [prompt, setPrompt] = useState<ReactNode | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [proceed, setProceed] = useState<null | ((value: unknown) => void)>(null)
  const [cancel, setCancel] = useState<null | VoidFunction>(null)

  const confirm = (content: ReactNode) =>
    new Promise<boolean>((resolve) => {
      setPrompt(content)
      setIsOpen(true)
      setProceed(() => (value) => {
        setIsOpen(false)
        setPrompt(null)
        resolve(Boolean(value))
      })
      setCancel(() => () => {
        setIsOpen(false)
        setPrompt(null)
        resolve(false)
      })
    })

  return { confirm, prompt, isOpen, proceed, cancel }
}
