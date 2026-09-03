import React, { ReactNode, useState } from 'react'
import { useAnalytics } from '~components/AnalyticsProvider'
import { AnalyticsEvents } from '~utils/analytics'
import { PlanUpgradeData, PlanUpgradeModal } from './Modals'
import { SubscriptionPaymentData } from './SubscriptionPayment'
import { PricingModalProviderContext, PricingModalType } from './use-pricing-modal'

type ModalData = PlanUpgradeData | SubscriptionPaymentData | null

export const PricingModalProvider: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [modalType, setModalType] = useState<PricingModalType>(null)
  const [modalData, setModalData] = useState<ModalData>(null)
  const { trackEvent } = useAnalytics()

  const openModal = (type: PricingModalType, data?: ModalData) => {
    trackEvent({
      name: AnalyticsEvents.PaywallViewed,
      props: {
        modal_type: type ?? 'unknown',
        source: (data && 'context' in data && data.context) || 'unknown',
      },
    })
    setModalType(type)
    setModalData(data || null)
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setModalType(null)
    setModalData(null)
  }

  return (
    <PricingModalProviderContext value={{ openModal, closeModal, modalType, modalData }}>
      {children}

      {/* Render modals dynamically based on the modalType */}
      {modalType === 'planUpgrade' && (
        <PlanUpgradeModal
          open={isOpen}
          onOpenChange={({ open }) => {
            if (!open) {
              closeModal()
            }
          }}
          onClose={closeModal}
          {...(modalData as PlanUpgradeData)}
        />
      )}
    </PricingModalProviderContext>
  )
}
