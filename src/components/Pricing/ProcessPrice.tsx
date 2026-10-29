import { Alert, Button, Flex, Link, Skeleton, Stack, Text } from '@chakra-ui/react'
import type { ProcessPriceResponse, QuoteLine } from '@vocdoni/api-types'
import type { TFunction } from 'i18next'
import { Trans, useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router'
import { SupportLink } from '~components/Layout/SupportLink'
import { isQuoteOnly, isUnpriceableDraft, useProcessPrice } from '~queries/process-price'
import { useWallet } from '~queries/wallet'
import { Routes } from '~src/router/routes'
import { currency, quantity } from '~utils/numbers'
import { selfServiceVoterLimit } from './payment-errors'

// Above this many voters the backend recommends a custom quote (quoteRecommended); it still sells
// the process. Only used to word the recommendation: the backend's flag decides when it shows.
export const quoteRecommendedVoterLimit = 15_000

// The backend describes each line in English; known kinds are translated here instead.
const lineLabel = (t: TFunction, { kind, description }: QuoteLine) => {
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
    case 'minimumCharge':
      return t('process.price.line.minimum_charge', { defaultValue: 'Minimum charge' })
    default:
      return description
  }
}

const quoteLink = <SupportLink fontWeight='semibold' textDecoration='underline' />

// The note under the total: why the price is what it is, and what paying it means
const priceNote = (t: TFunction, price: ProcessPriceResponse) => {
  if (isQuoteOnly(price)) {
    return t('process.price.quote_only', { defaultValue: 'The price of this voting process is set by a custom quote.' })
  }
  switch (price.paymentStatus) {
    case 'paid':
      return t('process.price.paid', { defaultValue: 'Paid: publishing this voting process costs nothing more.' })
    case 'pending':
      return t('process.price.pending', { defaultValue: 'A wallet top-up checkout is open for this draft.' })
  }
  if (price.totalCents === 0) {
    return t('process.price.free', { defaultValue: 'This voting process is free: it publishes without payment.' })
  }
  return t('process.price.vat_excluded', {
    defaultValue: 'Prices exclude VAT, which is added when you top up your wallet.',
  })
}

// Whether the organization's wallet covers the price, and if not, how much to top up. Renders
// nothing while the balance loads or when it cannot be read: a managed organization's 403 means
// its integrator pays, and a backend without wallets has none to show.
const WalletCoverage = ({ totalCents }: { totalCents: number }) => {
  const { t } = useTranslation()
  const { data: wallet } = useWallet()

  if (!wallet) return null

  const { balanceCents } = wallet
  const currencyCode = wallet.currency?.toUpperCase()

  if (balanceCents >= totalCents) {
    return (
      <Text color='texts.subtle' fontSize='xs'>
        {t('process.price.wallet_covers', {
          defaultValue: 'Your wallet balance ({{balance}}) covers this total: publishing pays it from your wallet.',
          balance: currency(balanceCents, currencyCode),
        })}
      </Text>
    )
  }

  return (
    <Text color='texts.subtle' fontSize='xs'>
      {t('process.price.wallet_short', {
        defaultValue: 'Your wallet has {{balance}}, {{shortfall}} short of this total.',
        balance: currency(balanceCents, currencyCode),
        shortfall: currency(totalCents - balanceCents, currencyCode),
      })}{' '}
      <Link asChild fontWeight='semibold' textDecoration='underline'>
        <RouterLink to={Routes.dashboard.settings.billing}>
          {t('process.price.wallet_top_up', { defaultValue: 'Top up wallet' })}
        </RouterLink>
      </Link>
    </Text>
  )
}

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

  // A quote-only price has no lines, and its zero total is not a price to show
  const quoteOnly = isQuoteOnly(price)
  // Nothing is left for the wallet to pay once the draft is paid, or while a top-up checkout is open
  const walletPays =
    !quoteOnly && price.totalCents > 0 && price.paymentStatus !== 'paid' && price.paymentStatus !== 'pending'

  return (
    <Stack gap={2} fontSize='sm'>
      {price.lines.map((line) => (
        <Flex key={line.kind} justify='space-between' gap={2}>
          <Text>{lineLabel(t, line)}</Text>
          <Text whiteSpace='nowrap'>{currency(line.amountCents)}</Text>
        </Flex>
      ))}
      {!quoteOnly && (
        <Flex justify='space-between' gap={2} borderTop='1px solid' borderColor='table.border' pt={2}>
          <Text fontWeight='bold'>
            <Trans i18nKey='process.price.total'>Total</Trans>
          </Text>
          <Text fontWeight='bold' whiteSpace='nowrap'>
            {currency(price.totalCents)}
          </Text>
        </Flex>
      )}
      <Text color='texts.subtle' fontSize='xs'>
        {priceNote(t, price)}
      </Text>
      {walletPays && <WalletCoverage totalCents={price.totalCents} />}
    </Stack>
  )
}

/**
 * Points large censuses to a custom quote: recommended above 15,000 voters, and the only way to
 * publish above 50,000, where self-service payment is refused. Renders nothing otherwise.
 */
export const ProcessQuoteAlert = ({ processId }: { processId?: string | null }) => {
  const { price } = useProcessPrice(processId)

  // A quote-only process stays blocked after payment: the backend refuses it whatever was paid
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

  // A paid process has nothing left to recommend a quote for
  if (price?.quoteRecommended && price.paymentStatus !== 'paid') {
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
