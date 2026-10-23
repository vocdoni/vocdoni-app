import { QueryClientProvider } from '@tanstack/react-query'
import { VocdoniApiError } from '@vocdoni/api-client'
import type { ReactNode } from 'react'
import { createTestQueryClient, renderHook, TestMemoryRouter } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { QueryKeys } from '~queries/keys'
import { CensusTypes } from '../Census/CensusType'
import { defaultProcessValues, defaultQuestion, Process, SelectorTypes } from './common'
import { storeDraftId } from './draft-storage'
import { processCreateLinkState, ProcessCreateSource } from './source'
import { useProcessCreateAnalytics } from './use-process-create-analytics'

const mockTrackAnalyticsEvent = vi.fn()

// Partial mock: keep the real AnalyticsEvents taxonomy, intercept only the sink.
vi.mock('~utils/analytics', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~utils/analytics')>()),
  trackAnalyticsEvent: (...args: unknown[]) => mockTrackAnalyticsEvent(...args),
}))

const DAY_MS = 24 * 60 * 60 * 1000
const orgAddress = '0xorgaddr'
let currentAddress: string | undefined = orgAddress

/** A Mongo ObjectID minted `days` ago: its first four bytes are the creation second. */
const draftIdAged = (days: number) =>
  Math.floor((Date.now() - days * DAY_MS) / 1000)
    .toString(16)
    .padStart(8, '0') + '0'.repeat(16)

const form: Process = {
  ...defaultProcessValues,
  title: 'Board election',
  autoStart: false,
  groupId: 'group-2',
  censusType: CensusTypes.CSP,
  questions: [
    { ...defaultQuestion, type: SelectorTypes.Single },
    { ...defaultQuestion, type: SelectorTypes.Multiple },
  ],
  census: { credentials: ['name', 'memberNumber'], use2FA: true, use2FAMethod: 'sms' },
}

type Props = Parameters<typeof useProcessCreateAnalytics>[0]

const renderAnalytics = (initialProps: Props, source?: ProcessCreateSource) => {
  const queryClient = createTestQueryClient()
  const entry = { pathname: '/admin/processes/create', state: source ? processCreateLinkState(source) : null }
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <TestMemoryRouter initialEntries={[entry]}>{children}</TestMemoryRouter>
    </QueryClientProvider>
  )
  const rendered = renderHook((props: Props) => useProcessCreateAnalytics(props), { initialProps, wrapper })
  return { ...rendered, queryClient }
}

const eventsNamed = (name: string) =>
  mockTrackAnalyticsEvent.mock.calls.map(([event]) => event).filter((event) => event.name === name)

describe('useProcessCreateAnalytics', () => {
  beforeEach(() => {
    mockTrackAnalyticsEvent.mockClear()
    localStorage.clear()
    currentAddress = orgAddress
    setReactProvidersMock({
      useOrganization: () => ({ organization: currentAddress ? { address: currentAddress } : undefined }),
    })
  })

  it('starts the funnel once the organization is known, with where the form was opened from', () => {
    currentAddress = undefined
    const draftId = draftIdAged(2)
    const { rerender } = renderAnalytics({ draftId, effectiveDraftId: draftId, formDraft: undefined }, 'drafts')

    expect(eventsNamed('process_create_started')).toHaveLength(0)

    currentAddress = orgAddress
    rerender({ draftId, effectiveDraftId: draftId, formDraft: undefined })
    rerender({ draftId, effectiveDraftId: draftId, formDraft: undefined })

    expect(eventsNamed('process_create_started')).toEqual([
      { name: 'process_create_started', props: { source: 'drafts', from_draft: true } },
    ])
  })

  it('reads an unlabeled entry as direct', () => {
    renderAnalytics({ draftId: null, effectiveDraftId: null, formDraft: undefined })

    expect(eventsNamed('process_create_started')).toEqual([
      { name: 'process_create_started', props: { source: 'direct', from_draft: false } },
    ])
  })

  it('tracks resuming the stored draft the form reopened with', () => {
    const storedId = draftIdAged(5)
    storeDraftId(orgAddress, storedId)
    const { rerender } = renderAnalytics({ draftId: null, effectiveDraftId: storedId, formDraft: undefined }, 'menu')

    rerender({ draftId: null, effectiveDraftId: storedId, formDraft: form })
    rerender({ draftId: null, effectiveDraftId: storedId, formDraft: { ...form } })

    expect(eventsNamed('process_create_started')[0].props).toEqual({ source: 'menu', from_draft: true })
    expect(eventsNamed('draft_resumed')).toEqual([{ name: 'draft_resumed', props: { via: 'auto', age_days: 5 } }])
  })

  it('does not count the draft a new form just created as resumed', () => {
    const { rerender } = renderAnalytics({ draftId: null, effectiveDraftId: null, formDraft: undefined })

    // The first auto-save creates a draft, which the form then loads
    const createdId = draftIdAged(0)
    rerender({ draftId: null, effectiveDraftId: createdId, formDraft: form })

    expect(eventsNamed('draft_resumed')).toHaveLength(0)
  })

  it('numbers each attempt and reports the failures behind a published vote', () => {
    const { result, queryClient } = renderAnalytics({ draftId: null, effectiveDraftId: null, formDraft: undefined })
    queryClient.setQueryData(QueryKeys.organization.groups(orgAddress), {
      pages: [
        {
          groups: [
            { id: 'group-1', membersCount: 3 },
            { id: 'group-2', membersCount: 120 },
          ],
        },
      ],
      pageParams: [1],
    })

    result.current.trackValidationFailed(
      { questions: [{ options: [undefined, { option: { type: 'required', message: 'Required' } }] }] } as never,
      false
    )
    result.current.trackPublishFailed(new VocdoniApiError(500, {}, 'boom'))
    result.current.trackCreated(form, {
      startDate: new Date(Date.now() + DAY_MS).toISOString(),
      endDate: new Date(Date.now() + 8 * DAY_MS).toISOString(),
    } as never)

    const [validation, publish] = eventsNamed('process_creation_failed')
    expect(validation.props).toEqual({
      stage: 'validation',
      failed_fields: 'questions',
      sidebar_errors: false,
      first_error_path: 'questions.0.options.1.option',
      attempt: 1,
    })
    expect(publish.props).toEqual({ stage: 'publish', attempt: 2, error_name: 'VocdoniApiError', status: 500 })

    // Legacy name, kept for Plausible/GTM; PostHog receives it as `process_created`
    const [created] = eventsNamed('ProcessCreated')
    expect(created.props).toEqual({
      census_type: CensusTypes.CSP,
      weighted: false,
      anonymous: false,
      question_count: 2,
      from_draft: false,
      auto_start: false,
      question_types: 'mixed',
      voter_auth: 'sms_2fa',
      auth_fields_count: 2,
      duration_days: 7,
      census_size: 120,
      time_to_publish_s: expect.any(Number),
      failed_attempts: 2,
    })
  })

  it('tracks walking away from a draft, but not from an unsaved form', () => {
    const { result, rerender } = renderAnalytics({ draftId: null, effectiveDraftId: null, formDraft: undefined })

    result.current.trackDiscarded('leave')
    expect(eventsNamed('draft_discarded')).toHaveLength(0)

    rerender({ draftId: null, effectiveDraftId: draftIdAged(1), formDraft: undefined })
    result.current.trackDiscarded('reset')
    expect(eventsNamed('draft_discarded')).toEqual([
      { name: 'draft_discarded', props: { method: 'reset', age_days: 1 } },
    ])
  })
})
