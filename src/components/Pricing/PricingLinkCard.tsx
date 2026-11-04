import { Card, Link, Text, type CardRootProps } from '@chakra-ui/react'
import { Trans } from 'react-i18next'

const PRICING_URL = 'https://vocdoni.io/pricing'

export const PricingLinkCard = (props: CardRootProps) => (
  <Card.Root maxW='lg' w='full' {...props}>
    <Card.Body textAlign='center'>
      <Text>
        <Trans
          i18nKey='pricing.page_description'
          components={{ pricingLink: <Link href={PRICING_URL} target='_blank' rel='noopener noreferrer' /> }}
          defaults='Our pricing is available at <pricingLink>vocdoni.io/pricing</pricingLink>.'
        />
      </Text>
    </Card.Body>
  </Card.Root>
)
