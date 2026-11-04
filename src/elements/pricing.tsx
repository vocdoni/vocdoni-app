import { Flex } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { Heading } from '~components/Dashboard/Contents'
import { PricingLinkCard } from '~components/Pricing/PricingLinkCard'

const PricingPublicPage = () => {
  const { t } = useTranslation()

  return (
    <Flex flexDirection='column' alignItems='center' gap={8} width='full' mx='auto' py={12}>
      <Heading size='3xl'>{t('pricing.page_title', { defaultValue: 'Pricing' })}</Heading>
      <PricingLinkCard />
    </Flex>
  )
}

export default PricingPublicPage
