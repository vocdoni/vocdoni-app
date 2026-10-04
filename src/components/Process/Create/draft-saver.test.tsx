import { QueryClientProvider } from '@tanstack/react-query'
import { VocdoniApiError } from '@vocdoni/api-client'
import { act, renderHook, waitFor } from '@testing-library/react'
import { createTestQueryClient } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { CensusTypes } from '../Census/CensusType'
import { defaultProcessValues, Process } from './common'
import { getStoredDraftId, storeDraftId as persistDraftId } from './draft-storage'
import { StaleDraftError } from './census/voteGroup'
import { useFormDraftSaver } from './index'
import { draftVersionKey } from './queries'

const create = vi.fn()
const update = vi.fn()
const get = vi.fn()

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
  useApiClient: () => ({ client: { elections: { create, update, get } } }),
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
const renderSaver = (
  draftId: string | null = null,
  {
    persist = false,
    values = form,
    loadedVersion,
  }: { persist?: boolean; values?: Process; loadedVersion?: string } = {}
) => {
  const storeDraftId = vi.fn((id: string | null) => {
    if (persist) persistDraftId(orgAddress, id)
  })
  const onSaved = vi.fn()
  const queryClient = createTestQueryClient()
  // What `useDraft` keeps when the editor loads the draft
  if (draftId && loadedVersion) queryClient.setQueryData(draftVersionKey(draftId), loadedVersion)
  const { result } = renderHook(
    () => useFormDraftSaver(true, () => values, draftId, storeDraftId, undefined, onSaved),
    {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    }
  )

  return { result, storeDraftId, onSaved }
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

    const saving = result.current.saveDraft(false)
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

  it('holds autosave off while paused, and saves again once every pause is over', async () => {
    const { result } = renderSaver('draft-1')

    const resumeFirst = result.current.pause()
    const resumeSecond = result.current.pause()
    await expect(result.current.saveDraft(true)).resolves.toBe('skipped')
    await expect(result.current.saveDraft(false)).resolves.toBe('skipped')

    resumeFirst()
    resumeFirst() // a second call does nothing
    await expect(result.current.saveDraft(true)).resolves.toBe('skipped')

    resumeSecond()
    await act(async () => {
      await expect(result.current.saveDraft(true)).resolves.toBe('saved')
    })
    expect(update).toHaveBeenCalledTimes(1)
  })

  it('saves right now while paused, and flush waits for the writes already queued', async () => {
    const inFlight = deferred()
    update.mockReturnValueOnce(inFlight.promise)
    const { result, onSaved } = renderSaver('draft-1')
    const resume = result.current.pause()

    let saved: string | undefined
    const saving = result.current.saveNow().then((id) => {
      saved = id
    })
    let flushed = false
    const flushing = result.current.flush().then(() => {
      flushed = true
    })
    await waitFor(() => expect(update).toHaveBeenCalledTimes(1))
    expect(flushed).toBe(false)

    inFlight.resolve()
    await act(async () => {
      await saving
      await flushing
    })
    expect(saved).toBe('draft-1')
    expect(flushed).toBe(true)
    expect(onSaved).toHaveBeenCalledWith(form)
    resume()
  })

  it('skips an auto-save while another write is running', async () => {
    const inFlight = deferred()
    update.mockReturnValueOnce(inFlight.promise)
    const { result } = renderSaver('draft-1')

    const saving = result.current.saveDraft(false)
    await waitFor(() => expect(update).toHaveBeenCalledTimes(1))

    await expect(result.current.saveDraft(true)).resolves.toBe('skipped')

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

  it('publishes the draft an in-flight auto-save is creating instead of a second one', async () => {
    const inFlight = deferred()
    create.mockReturnValueOnce(inFlight.promise.then(() => 'draft-1'))
    const { result, storeDraftId } = renderSaver(null)

    // Clicking Publish blurs the focused field first, so the auto-save starts
    // creating the draft...
    const autoSaving = result.current.saveDraft(true)
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

  it('does not create a draft for a vote without a title yet', async () => {
    const { result, storeDraftId } = renderSaver(null, { values: { ...form, title: '  ' } })

    let outcome: string | undefined
    await act(async () => {
      outcome = await result.current.saveDraft(false)
    })

    expect(outcome).toBe('untitled')
    expect(create).not.toHaveBeenCalled()
    expect(storeDraftId).not.toHaveBeenCalled()
  })

  it('keeps saving an existing draft even after its title is cleared', async () => {
    const { result } = renderSaver('draft-1', { values: { ...form, title: '' } })

    await act(async () => {
      await result.current.saveDraft(false)
    })

    expect(update).toHaveBeenCalledTimes(1)
  })

  it('saves with the draft’s latest updatedAt when asked to, and says when it changed elsewhere', async () => {
    get.mockResolvedValue({ updatedAt: '2026-10-02T10:00:00Z' })
    const { result } = renderSaver('draft-1')

    await expect(result.current.saveNowWithLatest()).resolves.toBe('draft-1')
    expect(update).toHaveBeenCalledWith('draft-1', expect.objectContaining({ updatedAt: '2026-10-02T10:00:00Z' }))

    update.mockRejectedValueOnce(new VocdoniApiError(409, {}, 'stale', 40171))
    await expect(result.current.saveNowWithLatest()).rejects.toBeInstanceOf(StaleDraftError)
  })

  it('sends the version the editor saw, not the draft as it is now, so a write from elsewhere is caught', async () => {
    // Another tab saved since this one loaded the draft at v-load
    get.mockResolvedValue({ updatedAt: 'v-other' })
    const { result } = renderSaver('draft-1', { loadedVersion: 'v-load' })

    await result.current.saveNowWithLatest()
    expect(update).toHaveBeenLastCalledWith('draft-1', expect.objectContaining({ updatedAt: 'v-load' }))

    // After a write of its own, it compares against what that write left
    get.mockResolvedValue({ updatedAt: 'v-mine' })
    await act(async () => {
      await result.current.saveDraft(false)
    })
    await result.current.saveNowWithLatest()
    expect(update).toHaveBeenLastCalledWith('draft-1', expect.objectContaining({ updatedAt: 'v-mine' }))
  })

  it('reports what a save sent and when it landed', async () => {
    const { result, storeDraftId, onSaved } = renderSaver()
    expect(result.current.lastSavedAt).toBeNull()

    await act(async () => {
      await result.current.saveDraft(false)
    })

    expect(storeDraftId).toHaveBeenCalledWith('draft-1')
    expect(onSaved).toHaveBeenCalledWith(form)
    expect(result.current.lastSavedAt).toBeInstanceOf(Date)
    expect(result.current.saveFailed).toBe(false)
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
