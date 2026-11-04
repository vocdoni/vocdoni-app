import { Card, Link, Text, type CardRootProps } from '@chakra-ui/react'
import { Trans, useTranslation } from 'react-i18next'
import { Routes } from '~src/router/routes'

// Locales vocdoni.io publishes a pricing page for, besides the English one at the root
const VOCDONI_PRICING_LOCALES = ['ca', 'de', 'el', 'es', 'eu', 'fr', 'it', 'pt', 'pt-br']

/**
 * Public pricing page on vocdoni.io, in the locale of the given language code.
 * Falls back to the English page for any locale vocdoni.io does not translate.
 */
export const pricingUrl = (lang: string) => {
  const locale = lang.toLowerCase()
  return VOCDONI_PRICING_LOCALES.includes(locale) ? `${Routes.vocdoni}/${locale}/pricing` : `${Routes.vocdoni}/pricing`
}

export const PricingLinkCard = (props: CardRootProps) => {
  const { i18n } = useTranslation()

  return (
    <Card.Root maxW='lg' w='full' {...props}>
      <Card.Body textAlign='center'>
        <Text>
          <Trans
            i18nKey='pricing.page_description'
            components={{
              pricingLink: <Link href={pricingUrl(i18n.language)} target='_blank' rel='noopener noreferrer' />,
            }}
            defaults='Our pricing is available at <pricingLink>vocdoni.io/pricing</pricingLink>.'
          />
        </Text>
      </Card.Body>
    </Card.Root>
  )
}
