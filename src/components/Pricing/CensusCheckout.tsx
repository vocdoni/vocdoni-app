import { Alert, Button, Flex, Separator, Spinner, Text, VStack } from '@chakra-ui/react'
import {
  BillingAddressElement,
  CheckoutProvider,
  PaymentElement,
  TaxIdElement,
  useCheckout,
} from '@stripe/react-stripe-js/checkout'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { generatePath, Link as RouterLink, useHref, useNavigate } from 'react-router'
import { DashboardBox, DashboardCardHeader } from '~components/Dashboard/Contents'
import {
  censusPaymentIds,
  useCensusCheckout,
  useReadWalletHistory,
  waitForCensusPayment,
} from '~queries/census-checkout'
import { useWallet, useWalletAccess } from '~queries/wallet'
import { Routes } from '~src/router/routes'
import { currency } from '~utils/numbers'
import { censusGrowthPaymentErrorMessage } from './payment-errors'
import { useCheckoutAppearance, useStripePromise } from './stripe'

// The room a purchase buys: its size in voters, and the price the page showed, EUR cents VAT excluded
type Room = { censusSize: number; dueCents?: number; shortfallCents?: number }

// The payment's snapshot of the ledger and of the room, kept across a redirect-based payment (3DS, bank
// redirect). The return URL carries only the session id, so the room is read back from here.
const PENDING_KEY = 'census-checkout-pending'
export type StoredPending = Room & { processId: string; knownIds: string[] }

// sessionStorage can be blocked (private windows), so every access is guarded. Another process's
// snapshot is never returned.
export const readStoredPending = (processId: string): StoredPending | null => {
  try {
    const value = sessionStorage.getItem(PENDING_KEY)
    if (value === null) return null
    const stored = JSON.parse(value) as StoredPending
    return stored.processId === processId ? stored : null
  } catch {
    return null
  }
}

const writeStoredPending = (pending: StoredPending) => {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending))
  } catch {
    // Without storage a redirect return has no snapshot, so it never claims a purchase
  }
}

const clearStoredPending = () => {
  try {
    sessionStorage.removeItem(PENDING_KEY)
  } catch {
    // Nothing to clear when storage is unavailable
  }
}

type Step =
  | { name: 'ready' }
  | { name: 'buying' }
  | { name: 'checkout'; clientSecret: string; amountCents: number; currency: string; censusSize: number }
  // The payment is submitted: the debit for the room is awaited in the ledger
  | { name: 'waiting'; redirected: boolean; knownIds: string[] }
  | { name: 'bought'; amountCents: number; currency?: string }
  // `confirmed`: the payment was accepted here, so the room is only late, not unpaid
  | { name: 'timeout'; confirmed: boolean }

export type CensusCheckoutProps = {
  processId: string
  // The census size to reach, in voters. Undefined when the link does not say it.
  censusSize?: number
  // What reaching it costs and what the wallet lacks, EUR cents VAT excluded. Display only: the
  // backend recomputes both when the room is bought.
  dueCents?: number
  shortfallCents?: number
  // Set on the return from a redirect-based payment, with the ledger snapshot taken before it when one was stored
  returned?: boolean
  knownIds?: string[]
}

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error))

const censusCheckoutErrorMessage = (t: ReturnType<typeof useTranslation>['t'], error: unknown) =>
  censusGrowthPaymentErrorMessage(t, error) ?? errorMessage(error)

// Where a redirect return starts: waiting when the payment was snapshotted, else neutral copy, since
// nothing says whether the room was bought
const stepAfterReturn = (knownIds?: string[]): Step =>
  knownIds ? { name: 'waiting', redirected: true, knownIds } : { name: 'timeout', confirmed: false }

/**
 * Buy room in a process census, so the members that were refused can be added (the census growth
 * refused with 40178). Inline, not a Dialog: a modal focus trap breaks Stripe's 3D Secure lightbox.
 * The room is only there once the backend has debited it, so success is read from the wallet ledger.
 */
export const CensusCheckout = ({
  processId,
  censusSize,
  dueCents,
  shortfallCents,
  returned = false,
  knownIds,
}: CensusCheckoutProps) => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { canTopUp } = useWalletAccess()
  const { data: wallet } = useWallet()
  const queryClient = useQueryClient()
  const buyRoom = useCensusCheckout()
  const readHistory = useReadWalletHistory()
  const stripePromise = useStripePromise()
  // Stripe appends the session id to this path, so the redirect lands on the return route of this page
  const returnURL = new URL(
    useHref(generatePath(Routes.dashboard.census.checkoutReturnBase, { id: processId })),
    window.location.origin
  )
  const [step, setStep] = useState<Step>(() => (returned ? stepAfterReturn(knownIds) : { name: 'ready' }))
  const [error, setError] = useState<string>()

  // The debit changes the balance and the ledger: every wallet page is read again
  const markBought = (amountCents: number, currency?: string) => {
    void queryClient.invalidateQueries({ queryKey: ['organizations', 'wallet'] })
    setStep({ name: 'bought', amountCents, currency })
  }
  // The reader changes with the bearer token: the wait reads it from here, so a refresh does not restart it
  const latest = useRef({ readHistory })
  useEffect(() => {
    latest.current = { readHistory }
  })

  // The snapshot has served its purpose once read on the return. The URL then moves on to the census
  // checkout with its room, so a reload does not repeat the return; the page keeps its state.
  useEffect(() => {
    if (!returned) return
    clearStoredPending()
    if (censusSize === undefined || censusSize < 1) return
    const params = new URLSearchParams({ size: String(censusSize) })
    if (dueCents !== undefined) params.set('due', String(dueCents))
    if (shortfallCents !== undefined) params.set('shortfall', String(shortfallCents))
    navigate(
      { pathname: generatePath(Routes.dashboard.census.checkout, { id: processId }), search: `?${params}` },
      { replace: true }
    )
  }, [returned, censusSize, dueCents, shortfallCents, processId, navigate])

  // Reads the ledger until the debit for the room shows up, or the wait times out
  useEffect(() => {
    if (step.name !== 'waiting') return
    const controller = new AbortController()
    waitForCensusPayment(() => latest.current.readHistory(), processId, step.knownIds, {
      signal: controller.signal,
    })
      .then((outcome) => {
        if (controller.signal.aborted) return
        clearStoredPending()
        if (outcome?.status === 'paid') markBought(Math.abs(outcome.entry.amountCents))
        else setStep({ name: 'timeout', confirmed: !step.redirected })
      })
      .catch((err) => {
        if (controller.signal.aborted) return
        clearStoredPending()
        // The payment may be through: never offer to buy again, only the timeout copy with the error
        setError(errorMessage(err))
        setStep({ name: 'timeout', confirmed: !step.redirected })
      })
    return () => controller.abort()
  }, [step, processId])

  const balanceCents = wallet?.balanceCents
  const currencyCode = wallet?.currency?.toUpperCase()
  const backToMembers = (
    <Button asChild variant='outline'>
      <RouterLink to={Routes.dashboard.memberbase.base}>
        {t('census.checkout.back_to_members', { defaultValue: 'Back to members' })}
      </RouterLink>
    </Button>
  )

  const buy = (size: number) => {
    setError(undefined)
    setStep({ name: 'buying' })
    buyRoom
      .mutateAsync({
        processId,
        censusSize: size,
        locale: i18n.resolvedLanguage,
        returnURL: returnURL.toString(),
      })
      .then((response) => {
        // Without a client secret the wallet covered it: the debit is already made
        if (!response.clientSecret) {
          markBought(response.amountCents, response.currency)
          return
        }
        setStep({
          name: 'checkout',
          clientSecret: response.clientSecret,
          amountCents: response.amountCents,
          currency: response.currency,
          censusSize: size,
        })
      })
      .catch((err) => {
        setError(censusCheckoutErrorMessage(t, err))
        setStep({ name: 'ready' })
      })
  }

  // The payments of this process before the one about to be made, read on the first page of the ledger.
  // Null when the ledger cannot be read: nothing new can then be told apart, so no success is claimed.
  const snapshotPayments = useCallback(
    () =>
      latest.current.readHistory().then(
        (history) => censusPaymentIds(history, processId),
        () => null
      ),
    [processId]
  )

  const renderBody = () => {
    switch (step.name) {
      case 'buying':
        return <Waiting />
      case 'checkout':
        return (
          <CheckoutStep
            processId={processId}
            clientSecret={step.clientSecret}
            amountCents={step.amountCents}
            currencyCode={step.currency}
            room={{ censusSize: step.censusSize, dueCents, shortfallCents }}
            stripePromise={stripePromise}
            snapshotPayments={snapshotPayments}
            onPaid={(snapshot) => {
              if (snapshot === null) setStep({ name: 'timeout', confirmed: true })
              else setStep({ name: 'waiting', redirected: false, knownIds: snapshot })
            }}
          />
        )
      case 'waiting':
        return (
          <Waiting>
            {t('census.checkout.waiting', { defaultValue: 'Payment received. Adding the voter places…' })}
          </Waiting>
        )
      case 'bought':
        return (
          <Outcome status='success' action={backToMembers}>
            {t('census.checkout.bought', {
              defaultValue:
                'Voter places added: {{amount}} was charged from your wallet. Try adding the members again.',
              amount: currency(step.amountCents, step.currency?.toUpperCase()),
            })}
          </Outcome>
        )
      case 'timeout':
        return (
          <VStack align='stretch' gap={4}>
            {error && <Outcome status='error'>{error}</Outcome>}
            <Outcome status='warning' action={backToMembers}>
              {step.confirmed
                ? t('census.checkout.timeout', {
                    defaultValue:
                      'Your payment is confirmed; the places are added as soon as it is processed. Try adding the members again in a moment.',
                  })
                : t('census.checkout.timeout_redirected', {
                    defaultValue:
                      'We are still waiting for the places to be added. Try adding the members again in a moment.',
                  })}
            </Outcome>
          </VStack>
        )
      case 'ready':
        if (censusSize === undefined || censusSize < 1) {
          return (
            <Alert.Root status='error'>
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description>
                  {t('census.checkout.invalid', {
                    defaultValue:
                      'This page needs the number of voters to add places for. Open it from the refused change.',
                  })}
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )
        }
        return (
          <VStack align='stretch' gap={5}>
            <Text>
              {dueCents !== undefined
                ? t('census.checkout.intro', {
                    defaultValue: 'Places for {{size}} voters, at {{due}} more (VAT excluded).',
                    size: censusSize.toLocaleString(i18n.resolvedLanguage),
                    due: currency(dueCents, currencyCode),
                  })
                : t('census.checkout.intro_no_price', {
                    defaultValue: 'Places for {{size}} voters.',
                    size: censusSize.toLocaleString(i18n.resolvedLanguage),
                  })}
            </Text>
            {balanceCents !== undefined && (
              <Text fontSize='sm' color='texts.subtle'>
                {t('census.checkout.balance', {
                  defaultValue: 'Your wallet has {{balance}}.',
                  balance: currency(balanceCents, currencyCode),
                })}
              </Text>
            )}
            {shortfallCents !== undefined && (
              <Text fontSize='sm' color='texts.subtle'>
                {t('census.checkout.shortfall', {
                  defaultValue: 'Your wallet is {{shortfall}} short.',
                  shortfall: currency(shortfallCents, currencyCode),
                })}
              </Text>
            )}
            {error && <Outcome status='error'>{error}</Outcome>}
            {canTopUp ? (
              <Flex justify='flex-end' gap={3} wrap='wrap'>
                <Button onClick={() => buy(censusSize)}>
                  {t('census.checkout.buy', { defaultValue: 'Add voter places' })}
                </Button>
              </Flex>
            ) : (
              <Text fontSize='sm' color='texts.subtle'>
                {t('census.checkout.admin_only', { defaultValue: 'Only admins can add voter places.' })}
              </Text>
            )}
          </VStack>
        )
    }
  }

  return (
    <DashboardBox p={6}>
      <DashboardCardHeader title={t('census.checkout.title', { defaultValue: 'Add voter places' })} />
      {renderBody()}
    </DashboardBox>
  )
}

const Waiting = ({ children }: { children?: ReactNode }) => (
  <Flex direction='column' align='center' gap={4} py={10} textAlign='center' role='status'>
    <Spinner size='lg' />
    {children && <Text>{children}</Text>}
  </Flex>
)

const Outcome = ({
  status,
  action,
  children,
}: {
  status: 'success' | 'warning' | 'error'
  action?: ReactNode
  children: ReactNode
}) => (
  <VStack align='stretch' gap={4}>
    <Alert.Root status={status}>
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Description>{children}</Alert.Description>
      </Alert.Content>
    </Alert.Root>
    {action && <Flex justify='flex-end'>{action}</Flex>}
  </VStack>
)

type CheckoutStepProps = {
  processId: string
  clientSecret: string
  amountCents: number
  currencyCode: string
  room: Room
  stripePromise: ReturnType<typeof useStripePromise>
  snapshotPayments: () => Promise<string[] | null>
  onPaid: (knownIds: string[] | null) => void
}

const CheckoutStep = ({
  processId,
  clientSecret,
  amountCents,
  currencyCode,
  room,
  stripePromise,
  snapshotPayments,
  onPaid,
}: CheckoutStepProps) => {
  const { t } = useTranslation()
  const appearance = useCheckoutAppearance()
  // The session is already open: Stripe only needs to hear its secret, once per mount
  const fetchClientSecret = useCallback(() => Promise.resolve(clientSecret), [clientSecret])

  if (!stripePromise) {
    return (
      <Outcome status='error'>
        {t('payment.stripe_unavailable', {
          defaultValue: 'Payments are temporarily unavailable. Please try again later.',
        })}
      </Outcome>
    )
  }

  return (
    <CheckoutProvider stripe={stripePromise} options={{ fetchClientSecret, elementsOptions: { appearance } }}>
      <CheckoutFormFields
        processId={processId}
        amountCents={amountCents}
        currencyCode={currencyCode}
        room={room}
        snapshotPayments={snapshotPayments}
        onPaid={onPaid}
      />
    </CheckoutProvider>
  )
}

type CheckoutFormFieldsProps = Pick<
  CheckoutStepProps,
  'processId' | 'amountCents' | 'currencyCode' | 'room' | 'snapshotPayments' | 'onPaid'
>

const CheckoutFormFields = ({
  processId,
  amountCents,
  currencyCode,
  room,
  snapshotPayments,
  onPaid,
}: CheckoutFormFieldsProps) => {
  const { t } = useTranslation()
  const checkoutState = useCheckout()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (checkoutState.type === 'loading') {
    return (
      <Flex justify='center' py={8}>
        <Spinner />
      </Flex>
    )
  }

  if (checkoutState.type === 'error') {
    return <Outcome status='error'>{checkoutState.error.message}</Outcome>
  }

  const { checkout } = checkoutState
  // The amount Stripe charges, VAT included, when it says so
  const payAmount = checkout.total?.total.amount ?? currency(amountCents, currencyCode)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setError(null)
    // Taken before the payment: the debit it causes is the one new payment of this process in the ledger
    const knownIds = await snapshotPayments()
    if (knownIds) writeStoredPending({ processId, ...room, knownIds })
    else clearStoredPending()
    try {
      const result = await checkout.confirm({ redirect: 'if_required' })
      if (result.type === 'error') {
        clearStoredPending()
        setError(result.error.message)
        setIsSubmitting(false)
        return
      }
      // No redirect happened, so the return route will not need the snapshot
      clearStoredPending()
      // Stripe accepted the payment; the debit for the room is the backend's to make
      onPaid(knownIds)
    } catch (err) {
      clearStoredPending()
      setError(errorMessage(err))
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <VStack align='stretch' gap={5}>
        {checkout.total && (
          <VStack align='stretch' gap={3} p={5} borderWidth={1} borderRadius='md' bg='card.bg'>
            <Flex justify='space-between' gap={4}>
              <Text>{t('census.checkout.amount_net', { defaultValue: 'Places (VAT excluded)' })}</Text>
              <Text>{currency(amountCents, currencyCode)}</Text>
            </Flex>
            <Flex justify='space-between' gap={4}>
              <Text>{t('wallet.topup.vat', { defaultValue: 'VAT' })}</Text>
              <Text>{checkout.total.taxExclusive.amount}</Text>
            </Flex>
            <Separator />
            <Flex justify='space-between' gap={4}>
              <Text fontWeight='bold'>{t('wallet.topup.total', { defaultValue: 'Total' })}</Text>
              <Text fontWeight='bold'>{checkout.total.total.amount}</Text>
            </Flex>
          </VStack>
        )}

        <BillingAddressElement options={{ display: { name: 'split' } }} />
        <TaxIdElement options={{ visibility: 'auto' }} />
        <PaymentElement />

        {error && <Outcome status='error'>{error}</Outcome>}

        <Button type='submit' w='full' loading={isSubmitting}>
          {t('census.checkout.pay', { defaultValue: 'Pay {{amount}}', amount: payAmount })}
        </Button>
      </VStack>
    </form>
  )
}
