import { QueryClientProvider } from '@tanstack/react-query'
import { VocdoniApiError } from '@vocdoni/api-client'
import { act, renderHook, waitFor } from '@testing-library/react'
import { ErrorCode } from '~components/Auth/api'
import { createTestQueryClient } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { CensusTypes } from '../Census/CensusType'
import { defaultProcessValues, Process } from './common'
import { getStoredDraftId, storeDraftId as persistDraftId } from './draft-storage'
import { useFormDraftSaver } from './index'

const create = vi.fn()
const update = vi.fn()
const toast = vi.fn()
const mockTrackAnalyticsEvent = vi.fn()

vi.mock('~components/Toast', () => ({
  useToast: () => toast,
}))

// Partial mock: keep the real AnalyticsEvents taxonomy, intercept only the sink.
vi.mock('~utils/analytics', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~utils/analytics')>()),
  trackAnalyticsEvent: (...args: unknown[]) => mockTrackAnalyticsEvent(...args),
}))

vi.mock('~components/Auth/Subscription', () => ({
  useSubscription: () => ({ permission: () => true }),
}))

vi.mock('~components/AnalyticsProvider', () => ({
  useAnalytics: () => ({ track: vi.fn(), trackEvent: vi.fn(), trackPlausibleEvent: vi.fn() }),
}))

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({ bearedFetch: vi.fn() }),
}))

vi.mock('~elements/dashboard/processes/drafts', () => ({
  useDeleteDraft: () => ({}),
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

const orgAddress = '0xorgaddr'

/**
 * `persist` mirrors what the real `useStoredDraftId` setter does — writing
 * through to localStorage — so tests can exercise the storage-backed paths
 * instead of only asserting on the spy.
 */
const renderSaver = (draftId: string | null = null, { persist = false }: { persist?: boolean } = {}) => {
  const storeDraftId = vi.fn((id: string | null) => {
    if (persist) persistDraftId(orgAddress, id)
  })
  const queryClient = createTestQueryClient()
  const { result } = renderHook(() => useFormDraftSaver(true, () => form, draftId, storeDraftId), {
    wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
  })

  return { result, storeDraftId }
}

describe('useFormDraftSaver', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    setReactProvidersMock({
      useOrganization: vi.fn().mockReturnValue({ organization: { address: orgAddress } }),
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

    const saving = result.current.saveDraft('manual')
    const publishing = result.current.writeDraft(() => ({ published: true }) as never)

    await waitFor(() => expect(update).toHaveBeenCalledTimes(1))
    expect(update).not.toHaveBeenCalledWith('draft-1', { published: true })

    inFlight.resolve()
    // Settling the writes runs saveDraft's tail, which resets the draft-limit state.
    await act(async () => {
      await saving
      await publishing
    })

    expect(update).toHaveBeenCalledTimes(2)
    expect(update).toHaveBeenLastCalledWith('draft-1', { published: true })
  })

  it('skips an auto-save while another write is running', async () => {
    const inFlight = deferred()
    update.mockReturnValueOnce(inFlight.promise)
    const { result } = renderSaver('draft-1')

    const saving = result.current.saveDraft('manual')
    await waitFor(() => expect(update).toHaveBeenCalledTimes(1))

    await expect(result.current.saveDraft('auto')).resolves.toBe('skipped')

    inFlight.resolve()
    await act(async () => {
      await saving
    })
    expect(update).toHaveBeenCalledTimes(1)
  })

  it('creates the draft once when two saves overlap, updating it afterwards', async () => {
    const inFlight = deferred()
    create.mockReturnValueOnce(inFlight.promise.then(() => 'draft-1'))
    const { result, storeDraftId } = renderSaver(null)

    const first = result.current.saveDraft('manual')
    const second = result.current.saveDraft('manual')

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

  it('publishes the draft an in-flight auto-save is creating instead of a second one', async () => {
    const inFlight = deferred()
    create.mockReturnValueOnce(inFlight.promise.then(() => 'draft-1'))
    const { result, storeDraftId } = renderSaver(null)

    // Clicking Publish blurs the focused field first, so the auto-save starts
    // creating the draft...
    const autoSaving = result.current.saveDraft('auto')
    // ...and the click submits before that round-trip resolves, so the render
    // closure still sees no draft id. Deciding create-vs-update from it here
    // would publish a second process and orphan the one being created.
    const publishing = result.current.writeDraft(() => ({ published: true }) as never)

    inFlight.resolve()
    const [, publishedId] = await Promise.all([autoSaving, publishing])

    expect(create).toHaveBeenCalledTimes(1)
    expect(storeDraftId).toHaveBeenCalledWith('draft-1')
    expect(publishedId).toBe('draft-1')
    expect(update).toHaveBeenCalledWith('draft-1', { published: true })
  })

  it('explains a draft locked by its payment once, not on every auto-save', async () => {
    const locked = new VocdoniApiError(
      409,
      { error: 'draft locked', code: ErrorCode.PaymentSessionConflict },
      'draft locked',
      ErrorCode.PaymentSessionConflict
    )
    update.mockRejectedValue(locked)
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { result } = renderSaver('draft-1')

    await expect(result.current.saveDraft('auto')).resolves.toBe('error')
    await expect(result.current.saveDraft('auto')).resolves.toBe('error')
    expect(toast).toHaveBeenCalledTimes(1)
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ type: 'error', isClosable: true }))

    // once a save goes through, a later lock is explained again
    update.mockResolvedValueOnce(undefined)
    await expect(result.current.saveDraft('auto')).resolves.toBe('saved')
    await expect(result.current.saveDraft('auto')).resolves.toBe('error')
    expect(toast).toHaveBeenCalledTimes(2)
  })

  it('keeps any other auto-save failure silent', async () => {
    update.mockRejectedValue(new Error('network down'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { result } = renderSaver('draft-1')

    await expect(result.current.saveDraft('auto')).resolves.toBe('error')
    expect(toast).not.toHaveBeenCalled()
  })

  describe('tracking', () => {
    const tracked = () => mockTrackAnalyticsEvent.mock.calls.map(([event]) => event)

    it('tracks every manual save, whichever way it ends', async () => {
      update
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new VocdoniApiError(500, {}, 'boom'))
      const { result } = renderSaver('draft-1')

      await act(async () => {
        await result.current.saveDraft('manual')
      })
      await act(async () => {
        await result.current.saveDraft('leave')
      })
      await act(async () => {
        await expect(result.current.saveDraft('manual')).rejects.toThrow('boom')
      })

      expect(tracked()).toEqual([
        { name: 'draft_saved', props: { trigger: 'manual' } },
        { name: 'draft_saved', props: { trigger: 'leave' } },
        { name: 'draft_save_failed', props: { trigger: 'manual', status: 500 } },
      ])
    })

    it('tracks auto-saves only when their outcome changes', async () => {
      // Auto-save fires every 30s and on every blur: a steady state is one event
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
      update
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockResolvedValueOnce(undefined)
      const { result } = renderSaver('draft-1')

      for (let i = 0; i < 5; i++) {
        await act(async () => {
          await result.current.saveDraft('auto')
        })
      }

      expect(update).toHaveBeenCalledTimes(5)
      expect(tracked()).toEqual([
        { name: 'draft_saved', props: { trigger: 'auto' } },
        { name: 'draft_save_failed', props: { trigger: 'auto', status: 0 } },
        { name: 'draft_saved', props: { trigger: 'auto' } },
      ])
      consoleError.mockRestore()
    })

    it('reports the draft limit with its error code', async () => {
      create.mockRejectedValueOnce(new VocdoniApiError(403, {}, 'draft limit reached', 40031))
      const { result } = renderSaver(null)

      await act(async () => {
        await expect(result.current.saveDraft('auto')).resolves.toBe('limit-reached')
      })

      expect(tracked()).toEqual([
        { name: 'draft_save_failed', props: { trigger: 'auto', status: 403, error_code: 40031 } },
      ])
    })
  })

  describe('clearPublishedDraftId', () => {
    it('drops the stored id when it points at the published draft', () => {
      persistDraftId(orgAddress, 'draft-1')
      const { result, storeDraftId } = renderSaver('draft-1', { persist: true })

      result.current.clearPublishedDraftId('draft-1')

      expect(storeDraftId).toHaveBeenCalledWith(null)
      expect(getStoredDraftId(orgAddress)).toBeNull()
    })

    it('keeps a stored id pointing at a different draft', () => {
      // Opening a draft from the drafts list (`?draftId=`) publishes it without
      // ever repointing storage, so publishing must not forget the draft the
      // create form would otherwise resume.
      persistDraftId(orgAddress, 'draft-other')
      const { result, storeDraftId } = renderSaver('draft-1', { persist: true })

      result.current.clearPublishedDraftId('draft-1')

      expect(storeDraftId).not.toHaveBeenCalled()
      expect(getStoredDraftId(orgAddress)).toBe('draft-other')
    })

    it('drops the id the write queue stored during this same publish', async () => {
      // The create path stores the new id inside the queued write, after the
      // caller's render closure was captured — so the `draftId` prop is still
      // null here. Deciding against it instead of storage would leave the
      // pointer aimed at a published process, which a later draft delete would
      // then delete.
      const { result, storeDraftId } = renderSaver(null, { persist: true })

      const publishedId = await result.current.writeDraft(() => ({ published: true }) as never)
      expect(getStoredDraftId(orgAddress)).toBe('draft-1')

      result.current.clearPublishedDraftId(publishedId)

      expect(storeDraftId).toHaveBeenLastCalledWith(null)
      expect(getStoredDraftId(orgAddress)).toBeNull()
    })

    it('leaves other organizations untouched', () => {
      persistDraftId('0xotherorg', 'draft-1')
      persistDraftId(orgAddress, 'draft-1')
      const { result } = renderSaver('draft-1', { persist: true })

      result.current.clearPublishedDraftId('draft-1')

      expect(getStoredDraftId(orgAddress)).toBeNull()
      expect(getStoredDraftId('0xotherorg')).toBe('draft-1')
    })
  })
})
