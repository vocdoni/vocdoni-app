import { Button, Heading, Text } from '@chakra-ui/react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '~shared/Modal/Modal'

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
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton fontSize={10} />
          <ModalHeader>
            <Heading variant='header'>{title}</Heading>
            {subtitle && <Text variant='subheader'>{subtitle}</Text>}
          </ModalHeader>

          <ModalBody>{children}</ModalBody>

          <ModalFooter gap={2}>
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
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ModalFormContext.Provider>
  )
}
