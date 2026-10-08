import { Alert, Flex, Link, Skeleton, Stack, Text } from '@chakra-ui/react'
import type { TFunction } from 'i18next'
import { ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router'
import { ProcessPriceLine, useProcessPrice } from '~queries/process-price'
import { Routes } from '~routes'
import { currency, quantity } from '~utils/numbers'
import { selfServiceVoterLimit } from './payment-errors'

// Above this many voters the backend recommends a custom quote (quoteRecommended); it still sells
// the process. Only used to word the recommendation: the backend's flag decides when it shows.
export const quoteRecommendedVoterLimit = 15_000

// The backend describes each line in English; known kinds are translated here instead.
const lineLabel = (t: TFunction, { kind, description }: ProcessPriceLine) => {
  switch (kind) {
    case 'base':
      return t('process.price.line.base', { defaultValue: 'Voting process' })
    case 'emailTwoFA':
      return t('process.price.line.email_two_fa', { defaultValue: 'Email verification code' })
    case 'smsTwoFA':
      return t('process.price.line.sms_two_fa', { defaultValue: 'SMS verification code' })
    case 'signedCertificate':
      return t('process.price.line.signed_certificate', { defaultValue: 'Signed results certificate' })
    case 'customUrl':
      return t('process.price.line.custom_url', { defaultValue: 'Custom URL' })
    case 'branding':
      return t('process.price.line.branding', { defaultValue: 'Branding and white label' })
    default:
      return description
  }
}

// Trans replaces its component's children with the translated text, so the RouterLink must live
// inside a wrapper; passed inline, `asChild` would be left without a child and Chakra would throw.
const QuoteLink = ({ children }: { children?: ReactNode }) => (
  <Link asChild fontWeight='semibold' textDecoration='underline'>
    <RouterLink to={Routes.dashboard.settings.support}>{children}</RouterLink>
  </Link>
)

/**
 * The backend's price breakdown of a draft, VAT excluded. Before the draft is saved with its
 * voters and their authentication the backend cannot price it, so a hint is shown instead.
 */
export const ProcessPriceBreakdown = ({ processId }: { processId?: string | null }) => {
  const { t } = useTranslation()
  const { data: price, isLoading } = useProcessPrice(processId)

  if (isLoading) return <Skeleton height={16} />

  if (!price) {
    return (
      <Text fontSize='sm' color='texts.subtle'>
        <Trans i18nKey='process.price.unavailable'>
          The price shows up here once the draft is saved with its voters and their authentication set up.
        </Trans>
      </Text>
    )
  }

  return (
    <Stack gap={2} fontSize='sm' data-testid='process-price'>
      {price.lines.map((line) => (
        <Flex key={line.kind} justify='space-between' gap={2}>
          <Text>{lineLabel(t, line)}</Text>
          <Text whiteSpace='nowrap'>{currency(line.amountCents)}</Text>
        </Flex>
      ))}
      <Flex justify='space-between' gap={2} borderTop='1px solid' borderColor='table.border' pt={2}>
        <Text fontWeight='bold'>
          <Trans i18nKey='process.price.total'>Total</Trans>
        </Text>
        <Text fontWeight='bold' whiteSpace='nowrap'>
          {currency(price.totalCents)}
        </Text>
      </Flex>
      <Text color='texts.subtle' fontSize='xs'>
        {price.totalCents === 0
          ? t('process.price.free', { defaultValue: 'This voting process is free: it publishes without payment.' })
          : t('process.price.vat_excluded', { defaultValue: 'VAT excluded. It is added at checkout.' })}
      </Text>
    </Stack>
  )
}

/**
 * Points large censuses to a custom quote: recommended above 15,000 voters, and the only way to
 * publish above 50,000, where self-service payment is refused. Renders nothing otherwise.
 */
export const ProcessQuoteAlert = ({ processId }: { processId?: string | null }) => {
  const { data: price } = useProcessPrice(processId)

  if (price?.quoteRequired) {
    return (
      <Alert.Root status='warning' data-testid='process-quote-required'>
        <Alert.Indicator />
        <Alert.Description>
          <Trans
            i18nKey='process.price.quote_required'
            defaults='Voting processes with more than {{limit}} voters can only be published with a custom quote. <contact>Request a quote</contact> to publish this one.'
            values={{ limit: quantity(selfServiceVoterLimit) }}
            components={{ contact: <QuoteLink /> }}
          />
        </Alert.Description>
      </Alert.Root>
    )
  }

  if (price?.quoteRecommended) {
    return (
      <Alert.Root status='info' data-testid='process-quote-recommended'>
        <Alert.Indicator />
        <Alert.Description>
          <Trans
            i18nKey='process.price.quote_recommended'
            defaults='For voting processes with more than {{limit}} voters we recommend a custom quote. <contact>Request a quote</contact>, or publish it at the price shown in the settings.'
            values={{ limit: quantity(quoteRecommendedVoterLimit) }}
            components={{ contact: <QuoteLink /> }}
          />
        </Alert.Description>
      </Alert.Root>
    )
  }

  return null
}
