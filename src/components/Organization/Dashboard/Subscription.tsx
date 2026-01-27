import {
  AlertRoot as Alert,
  AlertDescription,
  Button,
  Flex,
  Heading,
  Link,
  ProgressRange,
  ProgressRoot,
  ProgressTrack,
  Text,
} from '@chakra-ui/react'
import { isBefore, isValid, parseISO } from 'date-fns'
import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Link as ReactRouterLink } from 'react-router-dom'
import { useSubscription } from '~components/Auth/Subscription'
import { ComparisonTable } from '~components/Pricing/ComparisonTable'
import { SubscriptionPlans } from '~components/Pricing/Plans'
import { SubscriptionCheckoutProvider } from '~components/Pricing/SubscriptionCheckoutProvider'
import { SubscriptionPayment } from '~components/Pricing/SubscriptionPayment'
import { useSubscriptionCheckout } from '~components/Pricing/use-subscription-checkout'
import { usePortalSession } from '~queries/stripe'
import { Routes } from '~routes'
import { DashboardBox } from '~shared/Dashboard/Contents'

const SubscriptionPageContent = () => {
  const { t } = useTranslation()
  const { subscription, loading, error } = useSubscription()
  const { mutateAsync, isPending } = usePortalSession()
  const [showComparisonTable, setShowComparisonTable] = useState(false)
  const { view, checkout, showPlans } = useSubscriptionCheckout()

  const handleChangeClick = () =>
    mutateAsync()
      .then((res) => {
        window.open(res.portalURL, '_blank')
      })
      .catch((e) => console.error('Error fetching portal URL', e))

  const toggleComparisonTable = () => setShowComparisonTable((prev) => !prev)

  if (loading) {
    return (
      <ProgressRoot value={null}>
        <ProgressTrack>
          <ProgressRange />
        </ProgressTrack>
      </ProgressRoot>
    )
  }
  if (error) {
    return (
      <Alert status='error'>
        <AlertDescription>{error.message.toString()}</AlertDescription>
      </Alert>
    )
  }

  const lastPaymentDate = parseISO(subscription?.subscriptionDetails.lastPaymentDate)
  const isFree =
    subscription?.plan.yearlyPrice === 0 &&
    (!isValid(lastPaymentDate) || isBefore(lastPaymentDate, new Date('1971-01-01')))

  return (
    <DashboardBox p={6}>
      <Flex direction={{ base: 'column', md: 'row' }}>
        <Flex flex={1} direction='column'>
          <Heading size='md'>{t('subscription_plan.title', { defaultValue: 'Subscription Plan' })}</Heading>
          <Text mb={6} color='texts.subtle' fontSize='sm'>
            <Trans i18nKey='subscription_plan.subtitle'>
              With our subscriptions, you get more than a plan. You gain access to the most innovative governance
              platform. Thanks to this model, we can offer the best price in the market: whether you need 1, 5, or 20
              votes per year, you'll always benefit from the most competitive costs and unmatched guarantees. The
              platform is fully self-service, yet our team is always available to provide assistance or tailor solutions
              to your specific needs.
            </Trans>
          </Text>
        </Flex>
        {!isFree && view === 'plans' && (
          <Button onClick={() => handleChangeClick()} loading={isPending}>
            {t('billing_details', { defaultValue: 'Billing Details' })}
          </Button>
        )}
      </Flex>
      {view === 'plans' ? (
        <>
          <SubscriptionPlans />
          <Flex justifyContent='center'>
            <Button variant='outline' onClick={toggleComparisonTable} mb={6}>
              {showComparisonTable
                ? t('subscription_plan.hide_comparison_table', { defaultValue: 'Show less features' })
                : t('subscription_plan.show_comparison_table', { defaultValue: 'View all features' })}
            </Button>
          </Flex>
          {showComparisonTable && <ComparisonTable />}
        </>
      ) : (
        <SubscriptionPayment lookupKey={checkout?.planId} billingPeriod={checkout?.billingPeriod} onClose={showPlans} />
      )}
      <Flex justifyContent='center' alignItems='center' flexDirection='column'>
        <Text fontSize='sm' color='texts.subtle' textAlign='center'>
          <Trans i18nKey='subscription_plan.gdpr_compliance'>All plans include GDPR compliance.</Trans>
        </Text>
        <Flex gap={1}>
          <Trans i18nKey='subscription_plan.need_help'>
            <Text fontSize='sm' color='texts.subtle' textAlign='center'>
              Need help choosing?
            </Text>
            <Link fontWeight='extrabold' fontSize='sm' asChild>
              <ReactRouterLink to={Routes.dashboard.settings.support}>Contact our sales team</ReactRouterLink>
            </Link>
          </Trans>
        </Flex>
      </Flex>
    </DashboardBox>
  )
}

const SubscriptionPage = () => (
  <SubscriptionCheckoutProvider>
    <SubscriptionPageContent />
  </SubscriptionCheckoutProvider>
)

export default SubscriptionPage
