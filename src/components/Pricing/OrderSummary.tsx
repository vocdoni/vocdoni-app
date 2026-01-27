import { Box, Flex, Separator, Text, VStack } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { usePlanNameTranslator } from './Plans'

type OrderSummaryProps = {
  checkout: any
}

export const OrderSummary = ({ checkout }: OrderSummaryProps) => {
  const { t } = useTranslation()
  const translatePlanName = usePlanNameTranslator()

  // Extract data from checkout
  const item = checkout.lineItems?.[0]
  const dueNext = checkout.recurring.dueNext
  const trial = checkout.recurring.trial
  const hasTrial = trial && trial.trialPeriodDays > 0
  const discountAmounts = Array.isArray(checkout.discountAmounts) ? checkout.discountAmounts : []
  const translatedItemName = translatePlanName(item?.name, item?.name || item?.description)

  // Get billing period (monthly/yearly)
  const billingInterval = checkout.recurring.interval || 'month'
  const billingPeriod =
    billingInterval === 'month' ? t('month', { defaultValue: 'month' }) : t('year', { defaultValue: 'year' })
  const taxPercent = ((dueNext.taxExclusive.minorUnitsAmount / dueNext.subtotal.minorUnitsAmount) * 100).toPrecision(2)

  return (
    <Box borderWidth={1} borderRadius='md' p={6} bg='card.bg'>
      <VStack align='stretch' gap={4}>
        <Text fontSize='lg' fontWeight='bold'>
          {t('order_summary', { defaultValue: 'Order Summary' })}
        </Text>

        <Separator />

        {/* Plan Name and Price/Trial */}
        <Flex justify='space-between' align='flex-start'>
          <Box>
            <Text fontWeight='medium'>{translatedItemName}</Text>
          </Box>
          <Box textAlign='right'>
            <Text>
              {hasTrial
                ? t('free_trial_days', { defaultValue: '{{count}}-day free trial', count: trial.trialPeriodDays })
                : dueNext.total.amount || item?.subtotal.amount}
            </Text>
          </Box>
        </Flex>

        {/* "Then XX€/period" row - only shown when trial exists */}
        {hasTrial && (
          <Flex justify='flex-end'>
            <Text fontSize='sm' color='texts.subtle'>
              {t('then_price_per_period', {
                defaultValue: 'Then {{price}}/{{period}}',
                price: dueNext.total.amount,
                period: billingPeriod,
              })}
            </Text>
          </Flex>
        )}

        <Separator />

        {/* Subtotal */}
        <Flex justify='space-between'>
          <Text>{t('subtotal', { defaultValue: 'Subtotal' })}</Text>
          <Text>{dueNext.subtotal.amount || item?.subtotal?.amount}</Text>
        </Flex>

        {/* Tax */}
        {(dueNext.taxExclusive?.amount || dueNext.taxInclusive?.amount) && (
          <Flex justify='space-between'>
            <Text>{t('tax', { defaultValue: 'Tax ({{percent}}%)', percent: taxPercent })}</Text>
            <Text>{dueNext.taxExclusive.amount || dueNext.taxInclusive.amount}</Text>
          </Flex>
        )}

        {/* Discount */}
        {discountAmounts &&
          discountAmounts.length > 0 &&
          discountAmounts.map((discount) => {
            if (!discount || !discount.amount || parseFloat(discount.amount) === 0) return null
            return (
              <Flex key={discount.displayName} justify='space-between' color='green.500'>
                <Text>{t('discount', { defaultValue: 'Discount' })}</Text>
                <Text>-{discount.amount}</Text>
              </Flex>
            )
          })}

        <Separator />

        {/* Total */}
        <Flex justify='space-between'>
          <Text fontSize='xl' fontWeight='bold'>
            {t('total_due_today', { defaultValue: 'Total due today' })}
          </Text>
          <Text fontSize='xl' fontWeight='bold'>
            {item?.total?.amount}
          </Text>
        </Flex>

        {/* Total after trial - only shown when trial exists */}
        {hasTrial && (
          <Flex justify='space-between'>
            <Text fontSize='sm' color='texts.subtle'>
              {t('total_after_trial', { defaultValue: 'Total after trial' })}
            </Text>
            <Text fontSize='sm' color='texts.subtle'>
              {dueNext.total.amount}
            </Text>
          </Flex>
        )}
      </VStack>
    </Box>
  )
}
