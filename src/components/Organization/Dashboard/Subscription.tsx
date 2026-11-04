import { Flex } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { DashboardBox, SectionHeader, SectionHeading } from '~components/Dashboard/Contents'
import { PricingLinkCard } from '~components/Pricing/PricingLinkCard'

const SubscriptionPage = () => {
  const { t } = useTranslation()

  return (
    <DashboardBox p={6}>
      <SectionHeader>
        <SectionHeading>{t('pricing.page_title', { defaultValue: 'Pricing' })}</SectionHeading>
      </SectionHeader>
      <Flex justifyContent='center'>
        <PricingLinkCard />
      </Flex>
    </DashboardBox>
  )
}

export default SubscriptionPage
