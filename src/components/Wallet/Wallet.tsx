import { Alert, Button, Center, Code, Flex, Link, Spinner, Stack, Table, Text } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { generatePath, Link as RouterLink, useSearchParams } from 'react-router'
import { DashboardBox, DashboardCardHeader } from '~components/Dashboard/Contents'
import { PrevNextPagination } from '~components/Pagination/PrevNextPagination'
import { useToast } from '~components/Toast'
import { isManagedOrgWalletError, useWallet, useWalletAccess, WalletEntry } from '~queries/wallet'
import { Routes } from '~src/router/routes'
import { shortAddress } from '~utils/address'
import { currency } from '~utils/numbers'
import { WalletTopUp } from './TopUp'

const LIMIT = 10
const POLL_INTERVAL_MS = 3000
const POLL_TIMEOUT_MS = 2 * 60 * 1000
const TOPUP_PENDING_KEY = 'wallet-topup-pending'

// What a top-up is matched against in the ledger: the ids of the topup entries that existed before the
// payment (null when that snapshot is unknown) and the requested net amount (null when unknown).
type TopUpSnapshot = { knownTopupIds: string[] | null; amountCents: number | null }
// Snapshot written to sessionStorage when a payment is submitted, so a bank redirect can find it again.
type StoredTopUp = { knownTopupIds: string[]; amountCents: number | null }
// A payment waiting for its ledger entry. `redirected` is set when the user came back from a bank redirect.
type TopUpWait = TopUpSnapshot & { redirected: boolean }

const NO_SNAPSHOT: TopUpSnapshot = { knownTopupIds: null, amountCents: null }

const topUpIds = (history: WalletEntry[] = []) =>
  history.filter((entry) => entry.kind === 'topup').map((entry) => entry.id)

// A top-up is ours when the ledger has a topup entry that was not there before the payment and carries the
// requested amount. An older top-up or a concurrent debit cannot match, and without a snapshot nothing does.
const isCredited = (history: WalletEntry[], { knownTopupIds, amountCents }: TopUpSnapshot) =>
  knownTopupIds !== null &&
  history.some(
    (entry) =>
      entry.kind === 'topup' &&
      !knownTopupIds.includes(entry.id) &&
      (amountCents === null || entry.amountCents === amountCents)
  )

// sessionStorage can be blocked (private windows), so every access is guarded.
const readStoredTopUp = (): StoredTopUp | null => {
  try {
    const value = sessionStorage.getItem(TOPUP_PENDING_KEY)
    if (value === null) return null
    const stored = JSON.parse(value) as StoredTopUp
    return Array.isArray(stored.knownTopupIds) ? stored : null
  } catch {
    return null
  }
}

const writeStoredTopUp = (topUp: StoredTopUp) => {
  try {
    sessionStorage.setItem(TOPUP_PENDING_KEY, JSON.stringify(topUp))
  } catch {
    // Without storage a redirect return has no snapshot, so it never claims a top-up
  }
}

const clearStoredTopUp = () => {
  try {
    sessionStorage.removeItem(TOPUP_PENDING_KEY)
  } catch {
    // Nothing to clear when storage is unavailable
  }
}

type WalletPanelProps = {
  processLinks?: boolean
}

const EntryDetail = ({ entry, processLinks }: { entry: WalletEntry } & WalletPanelProps) => {
  if (!entry.processId && !entry.processOrgAddress) return <Text color='texts.subtle'>-</Text>

  return (
    <Stack gap={0.5}>
      {entry.processId &&
        (processLinks ? (
          <Link asChild fontSize='sm'>
            <RouterLink to={generatePath(Routes.dashboard.process, { id: entry.processId })}>
              <Code title={entry.processId}>{shortAddress(entry.processId)}</Code>
            </RouterLink>
          </Link>
        ) : (
          <Code title={entry.processId}>{shortAddress(entry.processId)}</Code>
        ))}
      {entry.processOrgAddress && (
        <Code fontSize='xs' color='texts.subtle' title={entry.processOrgAddress}>
          {shortAddress(entry.processOrgAddress)}
        </Code>
      )}
    </Stack>
  )
}

/**
 * Wallet balance, top-up and ledger of the selected organization. Used by the admin settings and the
 * integrator configuration; `processLinks` is set only where process pages exist.
 */
const WalletPanel = ({ processLinks = false }: WalletPanelProps) => {
  const { t, i18n } = useTranslation()
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const { canTopUp } = useWalletAccess()
  const [page, setPage] = useState(1)
  const [view, setView] = useState<'overview' | 'topup'>('overview')
  // Snapshot of the payment being submitted, read back by the inline path; the redirect path reads storage.
  const pendingTopUp = useRef<StoredTopUp | null>(null)
  // Coming back from a redirect-based payment (3DS, bank redirect) starts the same wait as an inline top-up.
  const [returnedFromCheckout] = useState(() => searchParams.get('topup') === 'return')
  const [wait, setWait] = useState<TopUpWait | null>(() =>
    returnedFromCheckout ? { ...(readStoredTopUp() ?? NO_SNAPSHOT), redirected: true } : null
  )
  const [polling, setPolling] = useState(returnedFromCheckout)
  // Bumped on every payment so a second one restarts the timeout.
  const [pollRound, setPollRound] = useState(0)

  const pollInterval = polling ? POLL_INTERVAL_MS : undefined
  const wallet = useWallet({ page, limit: LIMIT, refetchInterval: pollInterval })
  // The credit is looked for on the first page whatever page is on screen.
  const firstPage = useWallet({ page: 1, limit: LIMIT, refetchInterval: pollInterval })
  const balanceCents = wallet.data?.balanceCents
  const currencyCode = wallet.data?.currency?.toUpperCase()
  const pagination = wallet.data?.pagination
  const history = wallet.data?.history ?? []

  useEffect(() => {
    if (returnedFromCheckout) clearStoredTopUp()
    if (!searchParams.has('topup') && !searchParams.has('session_id')) return
    setSearchParams(
      (params) => {
        params.delete('topup')
        params.delete('session_id')
        return params
      },
      { replace: true }
    )
  }, [returnedFromCheckout, searchParams, setSearchParams])

  // Polling stops after the timeout; the message then switches to the timed-out one.
  useEffect(() => {
    if (!polling) return
    const timer = setTimeout(() => setPolling(false), POLL_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [polling, pollRound])

  // Only while polling: a timed-out wait never toasts, even if a later refetch shows the entry.
  useEffect(() => {
    if (!wait || !polling || !firstPage.data) return
    if (!isCredited(firstPage.data.history, wait)) return

    setWait(null)
    setPolling(false)
    toast({ type: 'success', title: t('wallet.topup.success_toast', { defaultValue: 'Your wallet was topped up' }) })
  }, [wait, polling, firstPage.data, toast, t])

  // Runs when the payment is submitted, before Stripe may redirect the page away.
  const handleTopUpStart = (amountCents: number) => {
    const snapshot: StoredTopUp = { knownTopupIds: topUpIds(firstPage.data?.history), amountCents }
    pendingTopUp.current = snapshot
    writeStoredTopUp(snapshot)
  }

  const handleTopUpDone = (amountCents: number) => {
    setView('overview')
    setWait({ knownTopupIds: pendingTopUp.current?.knownTopupIds ?? null, amountCents, redirected: false })
    setPolling(true)
    setPollRound((round) => round + 1)
  }

  const kindLabels: Record<WalletEntry['kind'], string> = {
    topup: t('wallet.kind.topup', { defaultValue: 'Top-up' }),
    payment: t('wallet.kind.payment', { defaultValue: 'Payment' }),
    creditBack: t('wallet.kind.creditBack', { defaultValue: 'Credit back' }),
    refund: t('wallet.kind.refund', { defaultValue: 'Stripe refund' }),
  }

  const waitMessage = () => {
    if (wait?.redirected) {
      return polling
        ? t('wallet.checking', {
            defaultValue: 'Checking your payment. Your balance updates as soon as Stripe confirms it.',
          })
        : t('wallet.checking_timeout', {
            defaultValue:
              'We could not confirm a top-up yet. If you paid, it will appear here shortly; if the payment did not go through, you can top up again.',
          })
    }

    return polling
      ? t('wallet.processing', { defaultValue: 'Payment received. Your balance updates as soon as it is confirmed.' })
      : t('wallet.processing_timeout', {
          defaultValue:
            'This is taking longer than expected. Your balance updates once the payment is confirmed; check back later.',
        })
  }

  const renderBody = () => {
    if (wallet.isLoading) {
      return (
        <Center py={16}>
          <Spinner />
        </Center>
      )
    }

    if (wallet.error && !wallet.data) {
      if (isManagedOrgWalletError(wallet.error)) {
        return (
          <Alert.Root status='info'>
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>
                {t('wallet.managed', {
                  defaultValue: "This organization's voting processes are paid by the integrator that manages it.",
                })}
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>
        )
      }

      return (
        <Alert.Root status='error'>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>{t('wallet.load_error', { defaultValue: 'Unable to load the wallet' })}</Alert.Title>
            <Alert.Description>{(wallet.error as Error).message}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )
    }

    if (balanceCents === undefined) return null

    return (
      <Flex direction='column' gap={6}>
        <DashboardBox>
          <Flex justify='space-between' align='flex-start' gap={4} wrap='wrap'>
            <Stack gap={1}>
              <Text fontSize='sm' color='texts.subtle' fontWeight='medium'>
                {t('wallet.balance', { defaultValue: 'Balance' })}
              </Text>
              <Text fontSize='3xl' fontWeight='bold' lineHeight='1'>
                {currency(balanceCents, currencyCode)}
              </Text>
            </Stack>
            {canTopUp && (
              <Button onClick={() => setView('topup')}>{t('wallet.topup.open', { defaultValue: 'Top up' })}</Button>
            )}
          </Flex>
          <Text fontSize='sm' color='texts.subtle'>
            {t('wallet.balance_note', {
              defaultValue: 'Prepaid credit, VAT excluded. Publishing a paid voting process is charged from it.',
            })}
          </Text>
          {!canTopUp && (
            <Text fontSize='sm' color='texts.subtle'>
              {t('wallet.topup.admin_only', { defaultValue: 'Only admins can top up the wallet.' })}
            </Text>
          )}
          {balanceCents < 0 && (
            <Alert.Root status='warning'>
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description>
                  {t('wallet.negative_balance', {
                    defaultValue: 'Your balance is negative after a refund. Top up to pay for new voting processes.',
                  })}
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}
        </DashboardBox>

        <Flex direction='column' gap={4}>
          <DashboardCardHeader title={t('wallet.history.title', { defaultValue: 'Movements' })} />
          {history.length === 0 ? (
            <Text color='texts.subtle'>{t('wallet.history.empty', { defaultValue: 'No movements yet.' })}</Text>
          ) : (
            <Table.ScrollArea borderWidth='1px' borderRadius='md'>
              <Table.Root variant='outline' interactive>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>{t('wallet.history.date', { defaultValue: 'Date' })}</Table.ColumnHeader>
                    <Table.ColumnHeader>{t('wallet.history.kind', { defaultValue: 'Type' })}</Table.ColumnHeader>
                    <Table.ColumnHeader>{t('wallet.history.detail', { defaultValue: 'Detail' })}</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign='end'>
                      {t('wallet.history.amount', { defaultValue: 'Amount' })}
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {history.map((entry) => {
                    const sign = entry.amountCents > 0 ? '+' : entry.amountCents < 0 ? '−' : ''
                    const color = entry.amountCents > 0 ? 'fg.success' : entry.amountCents < 0 ? 'fg.error' : undefined
                    return (
                      <Table.Row key={entry.id}>
                        <Table.Cell whiteSpace='nowrap'>
                          {new Date(entry.createdAt).toLocaleString(i18n.resolvedLanguage, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </Table.Cell>
                        <Table.Cell>{kindLabels[entry.kind] ?? entry.kind}</Table.Cell>
                        <Table.Cell>
                          <EntryDetail entry={entry} processLinks={processLinks} />
                        </Table.Cell>
                        <Table.Cell textAlign='end' whiteSpace='nowrap' color={color} fontWeight='medium'>
                          {sign}
                          {currency(Math.abs(entry.amountCents), currencyCode)}
                        </Table.Cell>
                      </Table.Row>
                    )
                  })}
                </Table.Body>
              </Table.Root>
            </Table.ScrollArea>
          )}

          {pagination && pagination.lastPage > 1 && (
            <PrevNextPagination
              text={t('wallet.pagination', {
                defaultValue: 'Page {{page}} of {{total}} · {{items}} total',
                page: pagination.currentPage,
                total: pagination.lastPage,
                items: pagination.totalItems,
              })}
              hasPrevious={pagination.previousPage !== null}
              hasNext={pagination.nextPage !== null}
              disabled={wallet.isPlaceholderData}
              onPrevious={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(p + 1, pagination.lastPage))}
            />
          )}
        </Flex>
      </Flex>
    )
  }

  return (
    <>
      {wait && view === 'overview' && (
        <Alert.Root status='info' mb={6}>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>{waitMessage()}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      {view === 'topup' ? (
        <DashboardBox p={6}>
          <DashboardCardHeader title={t('wallet.topup.title', { defaultValue: 'Top up your wallet' })} />
          <WalletTopUp onStart={handleTopUpStart} onDone={handleTopUpDone} onCancel={() => setView('overview')} />
        </DashboardBox>
      ) : (
        renderBody()
      )}
    </>
  )
}

export default WalletPanel
