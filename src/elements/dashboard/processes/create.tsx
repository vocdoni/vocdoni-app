import { PricingModalProvider } from '~components/Pricing/PricingModalProvider'
import ProcessCreate from '~components/Process/Create'

const ProcessCreatePage = () => {
  return (
    <PricingModalProvider>
      <ProcessCreate />
    </PricingModalProvider>
  )
}

export default ProcessCreatePage
