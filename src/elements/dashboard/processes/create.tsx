import { PricingModalProvider } from '~components/Pricing/PricingModalProvider'
import ProcessCreate from '~components/Process/Create'
import { TemplateProvider } from '~components/Process/Create/TemplateProvider'

const ProcessCreatePage = () => {
  return (
    <PricingModalProvider>
      <TemplateProvider>
        <ProcessCreate />
      </TemplateProvider>
    </PricingModalProvider>
  )
}

export default ProcessCreatePage
