import { Box, Flex, Separator, Text, VStack } from '@chakra-ui/react'
import type { StripeCheckoutSession } from '@stripe/stripe-js'
import { Trans, useTranslation } from 'react-i18next'
import type { ProcessPriceLine } from '~queries/process-price'
import { priceLineLabel } from './ProcessPrice'

type ProcessOrderSummaryProps = {
  checkout: Pick<StripeCheckoutSession, 'lineItems' | 'total' | 'tax'>
  // The draft's price lines, to translate the checkout's: the session only carries the
  // backend's English description of each line, which is also the price line's description
  priceLines?: ProcessPriceLine[]
}

/**
 * The one-time purchase of a voting process: its priced lines, VAT as Stripe calculates it from
 * the billing address, and the total charged. Amounts come formatted from Stripe.
 */
export const ProcessOrderSummary = ({ checkout, priceLines = [] }: ProcessOrderSummaryProps) => {
  const { t } = useTranslation()
  const { lineItems, total, tax } = checkout
  // Until the billing address is entered, Stripe has no VAT to show
  const taxReady = tax.status === 'ready'

  return (
    <Box borderWidth={1} borderRadius='md' p={6} bg='card.bg'>
      <VStack align='stretch' gap={4}>
        <Box>
          <Text fontSize='lg' fontWeight='bold'>
            <Trans i18nKey='process.checkout.summary.title'>Order summary</Trans>
          </Text>
          <Text fontSize='sm' color='texts.subtle'>
            <Trans i18nKey='process.checkout.summary.one_time'>One-time payment for this voting process</Trans>
          </Text>
        </Box>

        <Separator />

        {lineItems.map((item) => {
          const line = priceLines.find(({ description }) => description === item.name)
          return (
            <Flex key={item.id} justify='space-between' gap={2}>
              <Text>{line ? priceLineLabel(t, line) : item.name}</Text>
              <Text whiteSpace='nowrap'>{item.subtotal.amount}</Text>
            </Flex>
          )
        })}

        <Separator />

        <Flex justify='space-between' gap={2}>
          <Text>
            <Trans i18nKey='process.checkout.summary.subtotal'>Subtotal</Trans>
          </Text>
          <Text whiteSpace='nowrap'>{total.subtotal.amount}</Text>
        </Flex>
        <Flex justify='space-between' gap={2}>
          <Text>
            <Trans i18nKey='process.checkout.summary.vat'>VAT</Trans>
          </Text>
          <Text whiteSpace='nowrap' color={taxReady ? undefined : 'texts.subtle'}>
            {taxReady
              ? total.taxExclusive.amount
              : t('process.checkout.summary.vat_pending', { defaultValue: 'Calculated from your billing address' })}
          </Text>
        </Flex>

        <Separator />

        <Flex justify='space-between' gap={2}>
          <Text fontWeight='bold'>
            <Trans i18nKey='process.checkout.summary.total'>Total due today</Trans>
          </Text>
          <Text fontWeight='bold' whiteSpace='nowrap'>
            {total.total.amount}
          </Text>
        </Flex>
      </VStack>
    </Box>
  )
}
