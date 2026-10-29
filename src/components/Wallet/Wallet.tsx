import {
  Alert,
  Button,
  ButtonGroup,
  Center,
  CloseButton,
  Code,
  Dialog,
  Flex,
  IconButton,
  Link,
  Portal,
  Spinner,
  Stack,
  Table,
  Text,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu'
import { generatePath, Link as RouterLink, useSearchParams } from 'react-router'
import { DashboardBox, DashboardCardHeader, DashboardContents } from '~components/Dashboard/Contents'
import { useToast } from '~components/Toast'
import { isManagedOrgWalletError, useWallet, WalletEntry } from '~queries/wallet'
import { Routes } from '~src/router/routes'
import { currency } from '~utils/numbers'
import { WalletTopUp } from './TopUp'

const LIMIT = 10
const POLL_INTERVAL_MS = 3000
const POLL_TIMEOUT_MS = 2 * 60 * 1000
const RECENT_TOPUP_MS = 15 * 60 * 1000
const TOPUP_BASELINE_KEY = 'wallet-topup-baseline'

const shortId = (value: string) => (value.length > 14 ? `${value.slice(0, 8)}…${value.slice(-4)}` : value)

// sessionStorage can be blocked (private windows), so every access is guarded.
const readStoredBaseline = (): number | null => {
  try {
    const value = sessionStorage.getItem(TOPUP_BASELINE_KEY)
    return value !== null && Number.isFinite(Number(value)) ? Number(value) : null
  } catch {
    return null
  }
}

const writeStoredBaseline = (balanceCents: number) => {
  try {
    sessionStorage.setItem(TOPUP_BASELINE_KEY, String(balanceCents))
  } catch {
    // Without storage the return falls back to the history check
  }
}

const clearStoredBaseline = () => {
  try {
    sessionStorage.removeItem(TOPUP_BASELINE_KEY)
  } catch {
    // Nothing to clear when storage is unavailable
  }
}

// A payment waiting for its credit. `baseline` null: the first balance loads first, and the history decides.
// `amountCents` null: the amount is unknown (redirect return), so any balance change counts.
type Awaiting = { baseline: number | null; amountCents: number | null }

const isCredited = (balanceCents: number, { baseline, amountCents }: Awaiting & { baseline: number }) =>
  amountCents === null ? balanceCents !== baseline : balanceCents >= baseline + amountCents

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
              <Code title={entry.processId}>{shortId(entry.processId)}</Code>
            </RouterLink>
          </Link>
        ) : (
          <Code title={entry.processId}>{shortId(entry.processId)}</Code>
        ))}
      {entry.processOrgAddress && (
        <Code fontSize='xs' color='texts.subtle' title={entry.processOrgAddress}>
          {shortId(entry.processOrgAddress)}
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
  const [page, setPage] = useState(1)
  const [topUpOpen, setTopUpOpen] = useState(false)
  const [topUpStartBalance, setTopUpStartBalance] = useState<number | null>(null)
  const [pageLoadedAt] = useState(() => Date.now())
  // Coming back from a redirect-based payment (3DS, bank redirect) starts the same wait as a dialog top-up.
  const [returnedFromCheckout] = useState(() => searchParams.get('topup') === 'return')
  const [awaiting, setAwaiting] = useState<Awaiting | null>(() =>
    returnedFromCheckout ? { baseline: readStoredBaseline(), amountCents: null } : null
  )
  const [polling, setPolling] = useState(returnedFromCheckout)
  // Bumped on every payment so a second one restarts the timeout.
  const [pollRound, setPollRound] = useState(0)

  const wallet = useWallet({ page, limit: LIMIT, refetchInterval: polling ? POLL_INTERVAL_MS : undefined })
  const balanceCents = wallet.data?.balanceCents
  const currencyCode = wallet.data?.currency?.toUpperCase()
  const pagination = wallet.data?.pagination
  const history = wallet.data?.history ?? []

  useEffect(() => {
    if (returnedFromCheckout) clearStoredBaseline()
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

  // Polling stops after the timeout; the message then switches to the neutral one until the balance changes.
  useEffect(() => {
    if (!polling) return
    const timer = setTimeout(() => setPolling(false), POLL_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [polling, pollRound])

  useEffect(() => {
    if (!awaiting || balanceCents === undefined) return

    if (awaiting.baseline === null) {
      // A redirect whose baseline was not stored: a top-up made just before this page loaded is already in the history.
      const creditedBeforeLoad =
        awaiting.amountCents === null &&
        history.some(
          (entry) => entry.kind === 'topup' && Math.abs(pageLoadedAt - Date.parse(entry.createdAt)) <= RECENT_TOPUP_MS
        )
      if (!creditedBeforeLoad) {
        setAwaiting({ ...awaiting, baseline: balanceCents })
        return
      }
    } else if (!isCredited(balanceCents, { ...awaiting, baseline: awaiting.baseline })) {
      return
    }

    setAwaiting(null)
    setPolling(false)
    toast({ type: 'success', title: t('wallet.topup.success_toast', { defaultValue: 'Your wallet was topped up' }) })
  }, [awaiting, balanceCents, history, pageLoadedAt, toast, t])

  const openTopUp = () => {
    if (balanceCents !== undefined) writeStoredBaseline(balanceCents)
    setTopUpStartBalance(balanceCents ?? null)
    setTopUpOpen(true)
  }

  const handleTopUpDone = (amountCents: number) => {
    setTopUpOpen(false)
    setAwaiting({ baseline: topUpStartBalance, amountCents })
    setPolling(true)
    setPollRound((round) => round + 1)
  }

  const kindLabels: Record<WalletEntry['kind'], string> = {
    topup: t('wallet.kind.topup', { defaultValue: 'Top-up' }),
    payment: t('wallet.kind.payment', { defaultValue: 'Payment' }),
    creditBack: t('wallet.kind.creditBack', { defaultValue: 'Credit back' }),
    refund: t('wallet.kind.refund', { defaultValue: 'Stripe refund' }),
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
            <Button onClick={openTopUp}>{t('wallet.topup.open', { defaultValue: 'Top up' })}</Button>
          </Flex>
          <Text fontSize='sm' color='texts.subtle'>
            {t('wallet.balance_note', {
              defaultValue: 'Prepaid credit, VAT excluded. Publishing a paid voting process is charged from it.',
            })}
          </Text>
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
            <Flex justify='space-between' align='center' gap={4} wrap='wrap'>
              <Text fontSize='sm' color='texts.subtle'>
                {t('wallet.pagination', {
                  defaultValue: 'Page {{page}} of {{total}} · {{items}} total',
                  page: pagination.currentPage,
                  total: pagination.lastPage,
                  items: pagination.totalItems,
                })}
              </Text>
              <ButtonGroup size='sm' variant='outline' attached>
                <IconButton
                  aria-label={t('pagination.previous', { defaultValue: 'Previous page' })}
                  disabled={pagination.previousPage === null}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <LuChevronLeft />
                </IconButton>
                <IconButton
                  aria-label={t('pagination.next', { defaultValue: 'Next page' })}
                  disabled={pagination.nextPage === null}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <LuChevronRight />
                </IconButton>
              </ButtonGroup>
            </Flex>
          )}
        </Flex>
      </Flex>
    )
  }

  return (
    <DashboardContents>
      {awaiting && (
        <Alert.Root status='info' mb={6}>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>
              {polling
                ? t('wallet.processing', {
                    defaultValue: 'Payment received. Your balance updates as soon as it is confirmed.',
                  })
                : t('wallet.processing_timeout', {
                    defaultValue:
                      'This is taking longer than expected. Your balance updates once the payment is confirmed; check back later.',
                  })}
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      {renderBody()}

      <Dialog.Root
        open={topUpOpen}
        onOpenChange={({ open }) => setTopUpOpen(open)}
        placement='center'
        size='lg'
        lazyMount
        unmountOnExit
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.CloseTrigger asChild>
                <CloseButton />
              </Dialog.CloseTrigger>
              <Dialog.Header>
                <Dialog.Title>{t('wallet.topup.title', { defaultValue: 'Top up your wallet' })}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <WalletTopUp onDone={handleTopUpDone} onCancel={() => setTopUpOpen(false)} />
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </DashboardContents>
  )
}

export default WalletPanel
