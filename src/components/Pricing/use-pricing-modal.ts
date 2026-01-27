import { createContext, useContext } from 'react'
import { PlanUpgradeData } from './Modals'
import type { SubscriptionPaymentData } from './SubscriptionPayment'

// Define types for the context
export type PricingModalType = 'planUpgrade' | null

export type PricingModalContextState = {
  openModal: (type: PricingModalType, modalData?: PlanUpgradeData | SubscriptionPaymentData | null) => void
  closeModal: () => void
  modalType: PricingModalType
  modalData: any
}

const PricingModalContext = createContext<PricingModalContextState | undefined>(undefined)

const usePricingModal = () => {
  const context = useContext(PricingModalContext)
  if (!context) {
    throw new Error('usePricingModal must be used within a PricingModalProvider')
  }
  return context
}

const PricingModalProviderContext = PricingModalContext.Provider

export { PricingModalProviderContext, usePricingModal }
