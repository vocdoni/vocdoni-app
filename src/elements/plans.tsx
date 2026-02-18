import { Flex } from '@chakra-ui/react'
import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import Clients from '~components/Home/Clients'
import Faqs from '~components/Home/Faqs'
import { ComparisonTable } from '~components/Pricing/ComparisonTable'
import { SubscriptionPlans, usePlans } from '~components/Pricing/Plans'
import { PricingModalProvider } from '~components/Pricing/PricingModalProvider'
import { SubscriptionCheckoutProvider } from '~components/Pricing/SubscriptionCheckoutProvider'

const PlansPublicPage = () => {
  const featuresRef = useRef<HTMLDivElement>(null)
  const { isLoading } = usePlans()
  const location = useLocation()

  // Scroll to the comparison table if the ?compare query param is present
  useEffect(() => {
    if (!isLoading && location.search === '?compare' && featuresRef && featuresRef.current) {
      featuresRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [location.search, isLoading])

  return (
    <SubscriptionCheckoutProvider>
      <PricingModalProvider>
        <Flex flexDirection='column' gap={12} width='full' mx='auto'>
          <SubscriptionPlans />
          <ComparisonTable ref={featuresRef} />
          <Clients mt={14} />
          <Faqs />
        </Flex>
      </PricingModalProvider>
    </SubscriptionCheckoutProvider>
  )
}

export default PlansPublicPage
