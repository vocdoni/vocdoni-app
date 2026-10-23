import { Alert, Button, Flex, Skeleton, Stack, Text } from '@chakra-ui/react'
import type { TFunction } from 'i18next'
import { Trans, useTranslation } from 'react-i18next'
import { SupportLink } from '~components/Layout/SupportLink'
import { isQuoteOnly, isUnpriceableDraft, ProcessPriceLine, useProcessPrice } from '~queries/process-price'
import { currency, quantity } from '~utils/numbers'
import { selfServiceVoterLimit } from './payment-errors'

// Above this many voters the backend recommends a custom quote (quoteRecommended); it still sells
// the process. Only used to word the recommendation: the backend's flag decides when it shows.
export const quoteRecommendedVoterLimit = 15_000

// The backend describes each line in English; known kinds are translated here instead.
export const priceLineLabel = (t: TFunction, { kind, description }: Pick<ProcessPriceLine, 'kind' | 'description'>) => {
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

const quoteLink = <SupportLink fontWeight='semibold' textDecoration='underline' />

/**
 * The backend's price breakdown of a draft, VAT excluded. Before the draft is saved with its
 * voters and their authentication the backend cannot price it, so a hint is shown instead.
 */
export const ProcessPriceBreakdown = ({ processId }: { processId?: string | null }) => {
  const { t } = useTranslation()
  const {
    price,
    query: { isLoading, error, refetch, isFetching },
  } = useProcessPrice(processId)

  if (isLoading) return <Skeleton height={16} />

  // Anything but a draft the backend cannot price yet (a 500, a network failure...) is not fixed by
  // setting up voters, so it is not explained as if it were
  if (error && !isUnpriceableDraft(error)) {
    return (
      <Stack gap={2} align='flex-start'>
        <Text fontSize='sm' color='texts.subtle'>
          <Trans i18nKey='process.price.error'>The price could not be loaded.</Trans>
        </Text>
        <Button size='xs' variant='outline' onClick={() => refetch()} loading={isFetching}>
          <Trans i18nKey='common.retry'>Try again</Trans>
        </Button>
      </Stack>
    )
  }

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
    <Stack gap={2} fontSize='sm'>
      {price.lines.map((line) => (
        <Flex key={line.kind} justify='space-between' gap={2}>
          <Text>{priceLineLabel(t, line)}</Text>
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
  const { price } = useProcessPrice(processId)

  // A paid process has nothing left to quote
  if (price?.paymentStatus === 'paid') return null

  if (isQuoteOnly(price)) {
    return (
      <Alert.Root status='warning'>
        <Alert.Indicator />
        <Alert.Description>
          <Trans
            i18nKey='process.price.quote_required'
            defaults='Voting processes with more than {{limit}} voters can only be published with a custom quote. <contact>Request a quote</contact> to publish this one.'
            values={{ limit: quantity(selfServiceVoterLimit) }}
            components={{ contact: quoteLink }}
          />
        </Alert.Description>
      </Alert.Root>
    )
  }

  if (price?.quoteRecommended) {
    return (
      <Alert.Root status='info'>
        <Alert.Indicator />
        <Alert.Description>
          <Trans
            i18nKey='process.price.quote_recommended'
            defaults='For voting processes with more than {{limit}} voters we recommend a custom quote. <contact>Request a quote</contact>, or publish it at the price shown in the settings.'
            values={{ limit: quantity(quoteRecommendedVoterLimit) }}
            components={{ contact: quoteLink }}
          />
        </Alert.Description>
      </Alert.Root>
    )
  }

  return null
}
