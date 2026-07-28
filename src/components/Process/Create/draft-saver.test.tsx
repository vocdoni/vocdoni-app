import { QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { createTestQueryClient } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { CensusTypes } from '../Census/CensusType'
import { defaultProcessValues, Process } from './common'
import { useFormDraftSaver } from './index'

const create = vi.fn()
const update = vi.fn()

vi.mock('~components/Auth/Subscription', () => ({
  useSubscription: () => ({ permission: () => true }),
}))

vi.mock('~components/AnalyticsProvider', () => ({
  useAnalytics: () => ({ track: vi.fn(), trackPlausibleEvent: vi.fn() }),
}))

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({ bearedFetch: vi.fn() }),
}))

vi.mock('~src/queries/organization', () => ({
  SetupStepIds: {},
  useOrganizationSetup: () => ({}),
}))

vi.mock('~elements/dashboard/processes/drafts', () => ({
  useDeleteDraft: () => ({}),
}))

vi.mock('./TemplateProvider', () => ({
  useProcessTemplates: () => ({}),
}))

vi.mock('~src/providers/ApiClientProvider', () => ({
  useApiClient: () => ({ client: { elections: { create, update } } }),
}))

/** A promise plus the handle to settle it, so a request can be held in flight. */
const deferred = () => {
  let resolve!: (value?: unknown) => void
  const promise = new Promise((r) => {
    resolve = r as () => void
  })
  return { promise, resolve }
}

const form: Process = {
  ...defaultProcessValues,
  title: 'Draft',
  endDate: '2026-12-31',
  endTime: '23:59',
  censusType: CensusTypes.CSP,
}

const renderSaver = (draftId: string | null = null) => {
  const storeDraftId = vi.fn()
  const queryClient = createTestQueryClient()
  const { result } = renderHook(() => useFormDraftSaver(true, () => form, draftId, storeDraftId), {
    wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
  })

  return { result, storeDraftId }
}

describe('useFormDraftSaver', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setReactProvidersMock({
      useOrganization: vi.fn().mockReturnValue({ organization: { address: '0xorgaddr' } }),
    })
    create.mockResolvedValue('draft-1')
    update.mockResolvedValue(undefined)
  })

  it('holds a queued write until the one in flight finishes', async () => {
    // Saving replaces the stored question set, so two writes at once can
    // interleave server-side and duplicate a question.
    const inFlight = deferred()
    update.mockReturnValueOnce(inFlight.promise)
    const { result } = renderSaver('draft-1')

    const saving = result.current.saveDraft(false)
    const publishing = result.current.enqueueWrite(() => update('draft-1', { published: true }))

    await waitFor(() => expect(update).toHaveBeenCalledTimes(1))
    expect(update).not.toHaveBeenCalledWith('draft-1', { published: true })

    inFlight.resolve()
    await saving
    await publishing

    expect(update).toHaveBeenCalledTimes(2)
    expect(update).toHaveBeenLastCalledWith('draft-1', { published: true })
  })

  it('skips an auto-save while another write is running', async () => {
    const inFlight = deferred()
    update.mockReturnValueOnce(inFlight.promise)
    const { result } = renderSaver('draft-1')

    const saving = result.current.saveDraft(false)
    await waitFor(() => expect(update).toHaveBeenCalledTimes(1))

    await expect(result.current.saveDraft(true)).resolves.toBe('skipped')

    inFlight.resolve()
    await saving
    expect(update).toHaveBeenCalledTimes(1)
  })

  it('creates the draft once when two saves overlap, updating it afterwards', async () => {
    const inFlight = deferred()
    create.mockReturnValueOnce(inFlight.promise.then(() => 'draft-1'))
    const { result, storeDraftId } = renderSaver(null)

    const first = result.current.saveDraft(false)
    const second = result.current.saveDraft(false)

    inFlight.resolve()
    await first
    await second

    expect(create).toHaveBeenCalledTimes(1)
    expect(storeDraftId).toHaveBeenCalledWith('draft-1')
    // The second save targets the draft the first one created instead of
    // creating a second draft behind its back.
    expect(update).toHaveBeenCalledTimes(1)
    expect(update).toHaveBeenCalledWith('draft-1', expect.anything())
  })
})
