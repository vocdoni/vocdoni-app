import { useDisclosure } from '@chakra-ui/react'
import React, { ReactNode, useState } from 'react'
import { PlanUpgradeData, PlanUpgradeModal } from './Modals'
import { SubscriptionPaymentData } from './SubscriptionPayment'
import { PricingModalProviderContext, PricingModalType } from './use-pricing-modal'

type ModalData = PlanUpgradeData | SubscriptionPaymentData | null

export const PricingModalProvider: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const { open: isOpen, onOpen, onClose } = useDisclosure()
  const [modalType, setModalType] = useState<PricingModalType>(null)
  const [modalData, setModalData] = useState<ModalData>(null)

  const openModal = (type: PricingModalType, data?: ModalData) => {
    setModalType(type)
    setModalData(data || null)
    onOpen()
  }

  const closeModal = () => {
    setModalType(null)
    setModalData(null)
    onClose()
  }

  return (
    <PricingModalProviderContext value={{ openModal, closeModal, modalType, modalData }}>
      {children}

      {/* Render modals dynamically based on the modalType */}
      {modalType === 'planUpgrade' && isOpen && (
        <PlanUpgradeModal isOpen onClose={closeModal} {...(modalData as PlanUpgradeData)} />
      )}
    </PricingModalProviderContext>
  )
}
