import { Button, CloseButton, Dialog, Heading, Text } from '@chakra-ui/react'
import React from 'react'
import { useTranslation } from 'react-i18next'

interface ModalFormContextValue {
  isSubmitting: boolean
  setIsSubmitting: (isSubmitting: boolean) => void
  formRef: React.RefObject<HTMLFormElement>
  onClose: () => void
}

const ModalFormContext = React.createContext<ModalFormContextValue | undefined>(undefined)

export const useModalForm = () => {
  const context = React.useContext(ModalFormContext)
  if (!context) {
    throw new Error('useModalForm must be used within a ModalForm')
  }
  return context
}

interface ModalFormProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  submitText?: string
  cancelText?: string
}

export const ModalForm = ({ isOpen, onClose, title, subtitle, children, submitText, cancelText }: ModalFormProps) => {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const formRef = React.useRef<HTMLFormElement>(null)

  const contextValue = React.useMemo(
    () => ({
      isSubmitting,
      setIsSubmitting,
      formRef,
      onClose,
    }),
    [isSubmitting, onClose]
  )

  return (
    <ModalFormContext.Provider value={contextValue}>
      <Dialog.Root open={isOpen} onOpenChange={({ open }) => !open && onClose()} placement='center'>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.CloseTrigger asChild>
              <CloseButton />
            </Dialog.CloseTrigger>
            <Dialog.Header>
              <Heading variant='header'>{title}</Heading>
              {subtitle && <Text variant='subheader'>{subtitle}</Text>}
            </Dialog.Header>

            <Dialog.Body>{children}</Dialog.Body>

            <Dialog.Footer>
              <Button variant='ghost' onClick={onClose}>
                {cancelText || t('actions.cancel', { defaultValue: 'Cancel' })}
              </Button>
              <Button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  formRef.current?.requestSubmit()
                }}
                loading={isSubmitting}
              >
                {submitText || t('actions.save', { defaultValue: 'Save' })}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </ModalFormContext.Provider>
  )
}
