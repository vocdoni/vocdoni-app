import { act, renderHook } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { PropsWithChildren } from 'react'
import type { Blocker } from 'react-router'
import { Route, Routes, useLocation, useNavigate } from 'react-router'
import { render, screen, TestMemoryRouter, waitFor } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { CensusTypes } from '../Census/CensusType'
import { defaultQuestion, Process, SelectorTypes } from './common'
import { ApiErrorCode, VocdoniApiError } from '@vocdoni/api-client'
import { Routes as AppRoutes } from '~routes'
import ProcessCreate, {
  buildCensusSpec,
  paymentCheckoutStart,
  useConfirmOnNavigate,
  useFormToVotingProcessRequest,
} from './index'

const mockApiClient = vi.hoisted(() => ({
  elections: { create: vi.fn(), update: vi.fn(), get: vi.fn(), publish: vi.fn(), publishAndWait: vi.fn() },
}))

const { mockUseBlocker } = vi.hoisted(() => ({ mockUseBlocker: vi.fn() }))

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useBlocker: () => mockUseBlocker(),
}))

vi.mock('~utils/analytics', () => ({
  AnalyticsEvent: {},
  AnalyticsEvents: { ProcessCreated: 'process_created', ProcessCreationFailed: 'process_creation_failed' },
}))

const mockTrackEvent = vi.hoisted(() => vi.fn())

vi.mock('~components/AnalyticsProvider', () => ({
  useAnalytics: () => ({
    trackEvent: mockTrackEvent,
  }),
}))

const authState = vi.hoisted(() => ({ currentAddress: undefined as string | undefined, bearedFetch: vi.fn() }))
const profileState = vi.hoisted(() => ({ current: undefined as unknown }))

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({
    bearedFetch: authState.bearedFetch,
    currentAddress: authState.currentAddress,
  }),
}))

vi.mock('~queries/account', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~queries/account')>()),
  useProfile: () => ({ data: profileState.current }),
}))

// The wizard's sidebar, questions, editor and voter-auth dialog carry their own rules and state: the
// tests here are about the publish flow around them
vi.mock('./Sidebar', () => ({ CreateSidebar: () => null }))
vi.mock('./MainContent', () => ({ Questions: () => null }))
vi.mock('./LiveStreamingInput', () => ({ LiveStreamingInput: () => null }))
vi.mock('~components/Editor', () => ({ default: () => null }))
vi.mock('./VoterAuthentication/VoterAuthDialogContext', async (importOriginal) => {
  const React = await import('react')
  return {
    ...(await importOriginal<typeof import('./VoterAuthentication/VoterAuthDialogContext')>()),
    VoterAuthDialogProvider: ({ children }: { children: React.ReactNode }) => children,
  }
})

// The view has its own suite; here it only reports what the wizard handed it
vi.mock('~components/Pricing/ProcessCheckout', async (importOriginal) => {
  const React = await import('react')
  return {
    ...(await importOriginal<typeof import('~components/Pricing/ProcessCheckout')>()),
    ProcessCheckout: ({ processId, start, onPublished, onClose }: any) =>
      React.createElement(
        'div',
        null,
        React.createElement('p', null, `view:${processId}:${JSON.stringify(start)}`),
        React.createElement('button', { onClick: () => onPublished(processId) }, 'view-published'),
        React.createElement('button', { onClick: onClose }, 'view-back')
      ),
  }
})

vi.mock('~elements/dashboard/processes/drafts', () => ({
  useDeleteDraft: () => ({}),
}))

vi.mock('~src/providers/ApiClientProvider', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~src/providers/ApiClientProvider')>()),
  useApiClient: () => ({ client: mockApiClient }),
}))

describe('buildCensusSpec', () => {
  const form = (overrides: Partial<Process> = {}): Process =>
    ({ groupId: 'g1', weightedVote: false, anonymousVoting: false, census: null, ...overrides }) as Process

  it('marks the census anonymous when anonymous ballots are chosen', () => {
    expect(buildCensusSpec(form({ anonymousVoting: true })).anonymous).toBe(true)
  })

  it('omits the flag for a private ballot rather than sending false', () => {
    expect(buildCensusSpec(form()).anonymous).toBeUndefined()
  })

  // Saving a group without credentials makes the backend build a voter list in
  // which every voter collides, failing the whole draft save.
  it('leaves the group out until voter authentication is set up', () => {
    expect(buildCensusSpec(form()).groupId).toBeUndefined()
  })

  it('sends the group with the voter authentication once it is set up', () => {
    const spec = buildCensusSpec(
      form({ census: { credentials: ['memberNumber'], use2FA: true, use2FAMethod: 'email' } })
    )

    expect(spec).toMatchObject({ groupId: 'g1', authFields: ['memberNumber'], twoFaFields: ['email'] })
  })
})

describe('useFormToVotingProcessRequest', () => {
  let mockForm: Process

  beforeEach(() => {
    vi.clearAllMocks()
    setReactProvidersMock({
      useOrganization: vi.fn().mockReturnValue({ organization: { address: '0xorgaddr' } }),
    })

    mockForm = {
      title: 'Test Election',
      description: 'Test Description',
      autoStart: true,
      startDate: '',
      startTime: '',
      endDate: '2025-12-31',
      endTime: '23:59',
      questions: [
        {
          ...defaultQuestion,
          title: 'Test Question',
          description: 'Question description',
          options: [{ option: 'Option A' }, { option: 'Option B' }],
        },
      ],
      resultVisibility: 'hidden',
      anonymousVoting: false,
      groupId: 'test-group-id',
      census: null,
      censusType: CensusTypes.CSP,
      streamUri: '',
      weightedVote: false,
    }
  })

  // A minimal stand-in for the real spec builder: these cases are about the
  // request mapper, which takes the spec as an argument. `buildCensusSpec`
  // itself is covered in its own describe below.
  const censusSpec = () => ({ groupId: 'test-group-id', weighted: undefined })

  describe('basic field mapping', () => {
    it('maps title to { default } language map', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current({ ...mockForm, title: 'My Custom Title' }, censusSpec())
      expect(req.title).toEqual({ default: 'My Custom Title' })
    })

    it('maps description to { default } language map', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current({ ...mockForm, description: 'A description' }, censusSpec())
      expect(req.description).toEqual({ default: 'A description' })
    })

    it('omits description when empty', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current({ ...mockForm, description: '' }, censusSpec())
      expect(req.description).toBeUndefined()
    })

    it('uses organization address as orgAddress', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current(mockForm, censusSpec())
      expect(req.orgAddress).toBe('0xorgaddr')
    })

    it('passes the censusSpec through unchanged', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const spec = { groupId: 'g1', authFields: ['memberNumber'] as any }
      const req = result.current(mockForm, spec)
      expect(req.census).toBe(spec)
    })

    it('sets secretUntilTheEnd true when resultVisibility is hidden', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current({ ...mockForm, resultVisibility: 'hidden' }, censusSpec())
      expect(req.questions[0].secretUntilTheEnd).toBe(true)
    })

    it('sets secretUntilTheEnd false when resultVisibility is live', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current({ ...mockForm, resultVisibility: 'live' }, censusSpec())
      expect(req.questions[0].secretUntilTheEnd).toBe(false)
    })
  })

  describe('date mapping', () => {
    it('omits startDate when autoStart is true', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current({ ...mockForm, autoStart: true }, censusSpec())
      expect(req.startDate).toBeUndefined()
    })

    it('parses startDate/startTime as ISO string when autoStart is false', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current(
        { ...mockForm, autoStart: false, startDate: '2025-06-15', startTime: '14:30' },
        censusSpec()
      )
      expect(req.startDate).toBeDefined()
      const d = new Date(req.startDate!)
      expect(d.getFullYear()).toBe(2025)
      expect(d.getMonth()).toBe(5)
      expect(d.getDate()).toBe(15)
      expect(d.getHours()).toBe(14)
      expect(d.getMinutes()).toBe(30)
    })

    it('parses endDate/endTime as ISO string', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current({ ...mockForm, endDate: '2025-06-20', endTime: '18:00' }, censusSpec())
      const d = new Date(req.endDate!)
      expect(d.getFullYear()).toBe(2025)
      expect(d.getMonth()).toBe(5)
      expect(d.getDate()).toBe(20)
      expect(d.getHours()).toBe(18)
    })

    it('falls back to start + 1 day when endDate is missing', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const before = new Date()
      const req = result.current({ ...mockForm, endDate: '', endTime: '' }, censusSpec())
      const end = new Date(req.endDate!)
      expect(end.getTime()).toBeGreaterThan(before.getTime() + 23 * 60 * 60 * 1000)
      expect(end.getTime()).toBeLessThan(before.getTime() + 25 * 60 * 60 * 1000)
    })
  })

  describe('question mapping', () => {
    it('maps questions with { default } titles and choices', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current(mockForm, censusSpec())
      expect(req.questions).toHaveLength(1)
      expect(req.questions[0].title).toEqual({ default: 'Test Question' })
      expect(req.questions[0].description).toEqual({ default: 'Question description' })
      expect(req.questions[0].choices).toHaveLength(2)
      expect(req.questions[0].choices![0]).toEqual({ title: { default: 'Option A' }, value: 0 })
      expect(req.questions[0].choices![1]).toEqual({ title: { default: 'Option B' }, value: 1 })
    })

    it('maps multiple questions', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current(
        {
          ...mockForm,
          questions: [
            { ...defaultQuestion, title: 'Q1', description: 'D1', options: [{ option: 'A' }, { option: 'B' }] },
            { ...defaultQuestion, title: 'Q2', description: 'D2', options: [{ option: 'C' }, { option: 'D' }] },
          ],
        },
        censusSpec()
      )
      expect(req.questions).toHaveLength(2)
      expect(req.questions[0].title).toEqual({ default: 'Q1' })
      expect(req.questions[1].title).toEqual({ default: 'Q2' })
    })
  })

  describe('single-choice question', () => {
    it('sets type to singlechoice', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current(mockForm, censusSpec())
      expect(req.questions[0].type).toBe('singlechoice')
      expect(req.questions[0].typeSetup).toBeUndefined()
    })

    it('does not send a ballotProtocol, letting the backend derive it from type', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current(mockForm, censusSpec())
      expect(req.questions[0].ballotProtocol).toBeUndefined()
    })
  })

  describe('multi-choice question', () => {
    const multiChoice = (overrides: Partial<Process['questions'][number]> = {}) => ({
      ...defaultQuestion,
      title: 'Q',
      options: [{ option: 'A' }, { option: 'B' }],
      type: SelectorTypes.Multiple,
      ...overrides,
    })

    it('sets type to multichoice with typeSetup', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current(
        { ...mockForm, questions: [multiChoice({ maxNumberOfChoices: 2, minNumberOfChoices: 1 })] },
        censusSpec()
      )
      expect(req.questions[0].type).toBe('multichoice')
      expect(req.questions[0].typeSetup).toEqual({ maxChoices: 2, minChoices: 1, uniqueChoices: false })
    })

    it('uses options.length as maxChoices when maxNumberOfChoices is 0', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current(
        {
          ...mockForm,
          questions: [
            multiChoice({
              maxNumberOfChoices: 0,
              minNumberOfChoices: 0,
              options: [{ option: 'A' }, { option: 'B' }, { option: 'C' }, { option: 'D' }],
            }),
          ],
        },
        censusSpec()
      )
      expect(req.questions[0].typeSetup!.maxChoices).toBe(4)
    })

    it('does not send a ballotProtocol, letting the backend derive it from type/typeSetup', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current(
        { ...mockForm, questions: [multiChoice({ maxNumberOfChoices: 2, minNumberOfChoices: 0 })] },
        censusSpec()
      )
      expect(req.questions[0].ballotProtocol).toBeUndefined()
    })

    it('types and limits each question on its own', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current(
        {
          ...mockForm,
          questions: [
            { ...defaultQuestion, title: 'Q1', options: [{ option: 'A' }, { option: 'B' }] },
            multiChoice({ title: 'Q2', maxNumberOfChoices: 2, minNumberOfChoices: 1 }),
          ],
        },
        censusSpec()
      )

      expect(req.questions.map((question) => question.type)).toEqual(['singlechoice', 'multichoice'])
      expect(req.questions[0].typeSetup).toBeUndefined()
      expect(req.questions[1].typeSetup).toEqual({ maxChoices: 2, minChoices: 1, uniqueChoices: false })
    })
  })

  describe('extended info (choice metadata)', () => {
    it('includes choice metadata when extendedInfo is true', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current(
        {
          ...mockForm,
          questions: [
            {
              ...defaultQuestion,
              title: 'Q',
              description: 'D',
              extendedInfo: true,
              options: [{ option: 'A', description: 'Opt desc', image: 'https://img.example/a.png' }],
            },
          ],
        },
        censusSpec()
      )
      expect(req.questions[0].metadata).toBeDefined()
      expect((req.questions[0].metadata as any).choices[0].description).toBe('Opt desc')
      expect((req.questions[0].metadata as any).choices[0].image).toBe('https://img.example/a.png')
    })

    it('omits metadata when extendedInfo is false', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current(mockForm, censusSpec())
      expect(req.questions[0].metadata).toBeUndefined()
    })

    it('only sends metadata for the questions that enabled it', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current(
        {
          ...mockForm,
          questions: [
            { ...defaultQuestion, title: 'Q1', extendedInfo: true, options: [{ option: 'A', description: 'Why' }] },
            { ...defaultQuestion, title: 'Q2', options: [{ option: 'B' }] },
          ],
        },
        censusSpec()
      )

      expect(req.questions[0].metadata).toBeDefined()
      expect(req.questions[1].metadata).toBeUndefined()
    })
  })

  describe('streamUri', () => {
    it('includes streamUri', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current({ ...mockForm, streamUri: 'https://stream.example.com/live' }, censusSpec())
      expect(req.streamUri).toBe('https://stream.example.com/live')
    })

    it('coerces empty streamUri to undefined', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current({ ...mockForm, streamUri: '' }, censusSpec())
      expect(req.streamUri).toBeUndefined()
    })
  })

  it('keeps the anonymous census flag', () => {
    const { result } = renderHook(() => useFormToVotingProcessRequest())
    const req = result.current(mockForm, { ...censusSpec(), anonymous: true })
    expect(req.census?.anonymous).toBe(true)
  })
})

describe('useConfirmOnNavigate', () => {
  // react-router types `reset`/`proceed` as `undefined` outside the `blocked`
  // state. Calling them there threw `TypeError: reset is not a function` on
  // /admin/processes/create in production.
  const unblockedBlocker = (): Blocker => ({
    state: 'unblocked',
    reset: undefined,
    proceed: undefined,
    location: undefined,
  })

  const blockedBlocker = (pathname = '/admin/processes') =>
    ({
      state: 'blocked',
      reset: vi.fn(),
      proceed: vi.fn(),
      location: { pathname, search: '', hash: '', state: null, key: 'test' },
    }) as unknown as Blocker & { reset: ReturnType<typeof vi.fn>; proceed: ReturnType<typeof vi.fn> }

  const wrapper = ({ children }: PropsWithChildren) => (
    <TestMemoryRouter initialEntries={['/admin/processes/create']}>{children}</TestMemoryRouter>
  )

  const renderConfirm = (blocker: Blocker) => {
    mockUseBlocker.mockReturnValue(blocker)
    return renderHook(
      () =>
        useConfirmOnNavigate({
          isDirty: true,
          isSubmitting: false,
          isSubmitSuccessful: false,
          onOpen: vi.fn(),
          onClose: vi.fn(),
        }),
      { wrapper }
    )
  }

  beforeEach(() => {
    mockUseBlocker.mockReset()
  })

  describe('when the blocker is no longer blocked', () => {
    it('cancel() does not throw', () => {
      const { result } = renderConfirm(unblockedBlocker())

      expect(() => act(() => result.current.cancel())).not.toThrow()
    })

    it('proceed() does not throw, including its deferred reset', () => {
      vi.useFakeTimers()
      try {
        const { result } = renderConfirm(unblockedBlocker())

        expect(() => {
          act(() => result.current.proceed())
          act(() => {
            vi.runAllTimers()
          })
        }).not.toThrow()
      } finally {
        vi.useRealTimers()
      }
    })

    // `discardAndLeave` wipes the form and forgets the draft id on the way out.
    // It may only do that when the navigation was really released, so `proceed`
    // has to report the no-op rather than swallow it.
    it('proceed() reports that it released no navigation', () => {
      vi.useFakeTimers()
      try {
        const { result } = renderConfirm(unblockedBlocker())
        let released: boolean | undefined

        act(() => {
          released = result.current.proceed()
        })
        expect(released).toBe(false)

        act(() => {
          vi.runAllTimers()
        })
      } finally {
        vi.useRealTimers()
      }
    })

    it('resetSamePath() still runs its callback', () => {
      const { result } = renderConfirm(unblockedBlocker())
      const onReset = vi.fn()

      expect(() => act(() => result.current.resetSamePath(onReset))).not.toThrow()
      expect(onReset).toHaveBeenCalledTimes(1)
    })
  })

  describe('when the blocker is blocked', () => {
    it('cancel() resets the blocker', () => {
      const blocker = blockedBlocker()
      const { result } = renderConfirm(blocker)

      act(() => result.current.cancel())

      expect(blocker.reset).toHaveBeenCalledTimes(1)
    })

    it('proceed() lets the navigation through and resets afterwards', () => {
      vi.useFakeTimers()
      try {
        const blocker = blockedBlocker()
        const { result } = renderConfirm(blocker)

        let released: boolean | undefined
        act(() => {
          released = result.current.proceed()
        })
        expect(released).toBe(true)
        expect(blocker.proceed).toHaveBeenCalledTimes(1)

        act(() => {
          vi.runAllTimers()
        })
        expect(blocker.reset).toHaveBeenCalledTimes(1)
      } finally {
        vi.useRealTimers()
      }
    })

    it('reports a navigation to the current path as the same path', () => {
      const { result } = renderConfirm(blockedBlocker('/admin/processes/create'))

      expect(result.current.isSamePath).toBe(true)
    })

    it('reports a navigation elsewhere as a different path', () => {
      const { result } = renderConfirm(blockedBlocker('/admin/processes'))

      expect(result.current.isSamePath).toBe(false)
    })
  })

  // "Save and leave" race: an in-flight auto-save completes first, snoozes the blocker
  // and resets the pending navigation, so `proceed` has to re-issue the destination.
  describe('when an auto-save reset the blocker mid-save', () => {
    const renderTrackingLocation = (blocker: Blocker) => {
      const paths: string[] = []
      const navigateRef: { current: null | ((to: string) => void) } = { current: null }

      const Probe = () => {
        const { pathname } = useLocation()
        const navigate = useNavigate()
        paths.push(pathname)
        navigateRef.current = (to) => navigate(to)
        return null
      }

      mockUseBlocker.mockReturnValue(blocker)
      const rendered = renderHook(
        () =>
          useConfirmOnNavigate({
            isDirty: true,
            isSubmitting: false,
            isSubmitSuccessful: false,
            onOpen: vi.fn(),
            onClose: vi.fn(),
          }),
        {
          wrapper: ({ children }: PropsWithChildren) => (
            <TestMemoryRouter initialEntries={['/admin/processes/create']}>
              <Probe />
              {children}
            </TestMemoryRouter>
          ),
        }
      )

      return { paths, navigateRef, ...rendered }
    }

    it('re-issues the cancelled destination, reporting the user as leaving', async () => {
      const { paths, result, rerender } = renderTrackingLocation(blockedBlocker('/admin/processes'))

      // The queued auto-save lands: the snooze un-blocks and the effect resets
      // the pending navigation before the manual save's `proceed()` runs.
      mockUseBlocker.mockReturnValue(unblockedBlocker())
      rerender()

      let left: boolean | undefined
      await act(async () => {
        left = result.current.proceed()
      })

      expect(left).toBe(true)
      expect(paths.at(-1)).toBe('/admin/processes')
    })

    // `handleSaveAndLeave` calls the `proceed` rendered before the reset; the stale blocker throws.
    it('re-issues the destination from a closure captured before the reset', async () => {
      const blocked = blockedBlocker('/admin/processes')
      blocked.proceed.mockImplementation(() => {
        throw new Error('Invalid blocker state transition: unblocked -> proceeding')
      })
      const { paths, result, rerender } = renderTrackingLocation(blocked)
      const proceed = result.current.proceed

      mockUseBlocker.mockReturnValue(unblockedBlocker())
      rerender()

      let left: boolean | undefined
      await act(async () => {
        left = proceed()
      })

      expect(blocked.proceed).not.toHaveBeenCalled()
      expect(left).toBe(true)
      expect(paths.at(-1)).toBe('/admin/processes')
    })

    it('carries the blocked location state through the re-issued navigation', async () => {
      const blocked = blockedBlocker('/admin/processes')
      blocked.location.state = { from: 'create' }
      const states: unknown[] = []
      const StateProbe = () => {
        states.push(useLocation().state)
        return null
      }
      mockUseBlocker.mockReturnValue(blocked)
      const { result, rerender } = renderHook(
        () =>
          useConfirmOnNavigate({
            isDirty: true,
            isSubmitting: false,
            isSubmitSuccessful: false,
            onOpen: vi.fn(),
            onClose: vi.fn(),
          }),
        {
          wrapper: ({ children }: PropsWithChildren) => (
            <TestMemoryRouter initialEntries={['/admin/processes/create']}>
              <StateProbe />
              {children}
            </TestMemoryRouter>
          ),
        }
      )

      mockUseBlocker.mockReturnValue(unblockedBlocker())
      rerender()

      await act(async () => {
        result.current.proceed()
      })

      expect(states.at(-1)).toEqual({ from: 'create' })
    })

    it('does not hijack a user who already moved on mid-save', async () => {
      const { paths, navigateRef, result, rerender } = renderTrackingLocation(blockedBlocker('/admin/processes'))

      mockUseBlocker.mockReturnValue(unblockedBlocker())
      rerender()

      // The save is still in flight, but the user navigates elsewhere themselves.
      await act(async () => {
        navigateRef.current?.('/drafts')
      })

      let left: boolean | undefined
      await act(async () => {
        left = result.current.proceed()
      })

      expect(left).toBe(false)
      expect(paths.at(-1)).toBe('/drafts')
    })

    it('treats a pending navigation to the current path as a no-op', async () => {
      const { paths, result, rerender } = renderTrackingLocation(blockedBlocker('/admin/processes/create'))

      mockUseBlocker.mockReturnValue(unblockedBlocker())
      rerender()

      let left: boolean | undefined
      await act(async () => {
        left = result.current.proceed()
      })

      expect(left).toBe(false)
      expect(paths.at(-1)).toBe('/admin/processes/create')
    })
  })
})

describe('paymentCheckoutStart', () => {
  const refusal = (status: number, code: ApiErrorCode, data?: unknown) =>
    new VocdoniApiError(status, { error: 'refused', code, data }, 'refused', code, data)

  const shortfall = refusal(402, ApiErrorCode.PaymentRequired, {
    lines: [],
    totalCents: 5000,
    balanceCents: 1000,
    shortfallCents: 4000,
  })

  it('opens the top-up checkout for who can top up the wallet, with the shortfall', () => {
    expect(paymentCheckoutStart(shortfall, true)).toEqual({
      kind: 'checkout',
      shortfall: { shortfallCents: 4000, balanceCents: 1000 },
    })
  })

  it('leaves a manager with the toast and its way to the wallet', () => {
    expect(paymentCheckoutStart(shortfall, false)).toBeUndefined()
  })

  it('does not open the checkout for a managed organization, which has none', () => {
    const managed = refusal(402, ApiErrorCode.InsufficientWalletBalance, { requiredCents: 5000, availableCents: 1000 })
    const spendCap = refusal(402, ApiErrorCode.SpendCapReached)

    expect(paymentCheckoutStart(managed, true)).toBeUndefined()
    expect(paymentCheckoutStart(spendCap, true)).toBeUndefined()
  })

  it('does not open the checkout for a price only a custom quote settles', () => {
    expect(paymentCheckoutStart(refusal(422, ApiErrorCode.QuoteRequired), true)).toBeUndefined()
    expect(
      paymentCheckoutStart(
        refusal(402, ApiErrorCode.PaymentRequired, { lines: [], totalCents: 9000000, quoteRequired: true }),
        true
      )
    ).toBeUndefined()
  })

  it('offers the choice between resuming and cancelling an open top-up to who can top up only', () => {
    const conflict = refusal(409, ApiErrorCode.PaymentSessionConflict)

    expect(paymentCheckoutStart(conflict, true)).toEqual({ kind: 'conflict' })
    expect(paymentCheckoutStart(conflict, false)).toBeUndefined()
  })

  it('leaves any other refusal to the toast', () => {
    expect(paymentCheckoutStart(new Error('network down'), true)).toBeUndefined()
  })
})

describe('the wizard around the payment view', () => {
  const draftId = '6650f0c0c0c0c0c0c0c0c0c0'
  const admin = { organizations: [{ role: 'admin', organization: { address: '0xorg' } }] }

  // Shows where the router is, to see the URL a return replaces
  const LocationProbe = () => {
    const { pathname, search } = useLocation()
    return <p>{`at:${pathname}${search}`}</p>
  }

  const renderWizard = (url: string) =>
    render(
      <TestMemoryRouter initialEntries={[url]}>
        <LocationProbe />
        <Routes>
          <Route path={AppRoutes.processes.create} element={<ProcessCreate />} />
          <Route path={AppRoutes.processes.createReturn} element={<ProcessCreate />} />
          <Route path={AppRoutes.dashboard.process} element={<p>process page</p>} />
        </Routes>
      </TestMemoryRouter>
    )

  beforeEach(() => {
    mockUseBlocker.mockReturnValue({ state: 'unblocked', reset: vi.fn(), proceed: vi.fn() })
    authState.currentAddress = '0xorg'
    authState.bearedFetch.mockReset()
    authState.bearedFetch.mockResolvedValue(undefined)
    profileState.current = admin
    // The stored draft reads back as the last body written to it, with no add-ons: a draft read then
    // applies what the test typed, rather than resetting it
    let lastWritten: Record<string, unknown> = {}
    mockApiClient.elections.create.mockReset()
    mockApiClient.elections.create.mockImplementation(async (body: Record<string, unknown>) => {
      lastWritten = body
      return draftId
    })
    mockApiClient.elections.update.mockReset()
    mockApiClient.elections.update.mockImplementation(async (_id: string, body: Record<string, unknown>) => {
      lastWritten = body
    })
    mockApiClient.elections.get.mockReset()
    mockApiClient.elections.get.mockImplementation(async () => ({ ...lastWritten, addOns: {} }))
    mockApiClient.elections.publish.mockReset()
    setReactProvidersMock({
      useOrganization: () => ({ organization: { address: '0xorg' } }),
      useClient: () => ({ client: mockApiClient, connected: true }),
    })
  })

  describe('the return route of a redirect-based payment', () => {
    afterEach(() => sessionStorage.clear())

    it('recovers the draft the payment was opened for, and opens the view in its waiting step', async () => {
      sessionStorage.setItem('process-checkout-pending', JSON.stringify({ draftId }))
      renderWizard('/admin/processes/create/return/cs_test_123')

      expect(await screen.findByText(`view:${draftId}:{"kind":"return"}`)).toBeInTheDocument()
      // The URL moves on to the wizard for that draft, so a reload does not repeat the return
      expect(screen.getByText(`at:/admin/processes/create?draftId=${draftId}`)).toBeInTheDocument()
      expect(sessionStorage.getItem('process-checkout-pending')).toBeNull()
      expect(screen.queryByPlaceholderText('Voting Process Title')).not.toBeInTheDocument()
    })

    it('says it could not tell which process the payment was for, with a way back to the processes, when no draft was stored', async () => {
      renderWizard('/admin/processes/create/return/cs_test_123')

      expect(
        await screen.findByText(
          'We could not tell which voting process this payment was for. If the payment went through, its voting process is published automatically. Check your voting processes to see where it stands.'
        )
      ).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Back to your voting processes' })).toHaveAttribute(
        'href',
        '/admin/processes'
      )
      expect(screen.queryByText(/^view:/)).not.toBeInTheDocument()
      expect(screen.queryByPlaceholderText('Voting Process Title')).not.toBeInTheDocument()
    })

    it('says the same when the stored value does not name a draft', async () => {
      sessionStorage.setItem('process-checkout-pending', JSON.stringify({ draftId: '..' }))
      renderWizard('/admin/processes/create/return/cs_test_123')

      expect(await screen.findByRole('link', { name: 'Back to your voting processes' })).toBeInTheDocument()
      expect(screen.queryByText(/^view:/)).not.toBeInTheDocument()
    })
  })

  it('opens the top-up checkout for an admin whose publish is refused for the wallet shortfall', async () => {
    mockApiClient.elections.publish.mockRejectedValue(
      new VocdoniApiError(402, { error: 'short' }, 'short', ApiErrorCode.PaymentRequired, {
        lines: [],
        totalCents: 5000,
        balanceCents: 1000,
        shortfallCents: 4000,
      })
    )
    renderWizard('/admin/processes/create')

    await userEvent.setup().type(screen.getByPlaceholderText('Voting Process Title'), 'My vote')
    await userEvent.setup().click(screen.getByRole('button', { name: 'Publish' }))

    expect(
      await screen.findByText(
        `view:${draftId}:{"kind":"checkout","shortfall":{"shortfallCents":4000,"balanceCents":1000}}`
      )
    ).toBeInTheDocument()
    expect(mockApiClient.elections.publish).toHaveBeenCalledWith(draftId)
  })

  it('hands a published draft to the post-publish navigation', async () => {
    mockApiClient.elections.publish.mockResolvedValue({ jobId: 'job' })
    renderWizard('/admin/processes/create')

    await userEvent.setup().type(screen.getByPlaceholderText('Voting Process Title'), 'My vote')
    await userEvent.setup().click(screen.getByRole('button', { name: 'Publish' }))

    expect(await screen.findByText(`view:${draftId}:{"kind":"publishing","jobId":"job"}`)).toBeInTheDocument()
    await userEvent.setup().click(screen.getByRole('button', { name: 'view-published' }))

    await waitFor(() => expect(screen.getByText('process page')).toBeInTheDocument())
  })

  it('tracks the creation of a process published directly, with the submitted values', async () => {
    mockTrackEvent.mockClear()
    mockApiClient.elections.publish.mockResolvedValue({ jobId: 'job' })
    renderWizard('/admin/processes/create')

    await userEvent.setup().type(screen.getByPlaceholderText('Voting Process Title'), 'My vote')
    await userEvent.setup().click(screen.getByRole('button', { name: 'Publish' }))
    await userEvent.setup().click(await screen.findByRole('button', { name: 'view-published' }))

    await waitFor(() => expect(screen.getByText('process page')).toBeInTheDocument())
    expect(mockTrackEvent).toHaveBeenCalledWith(
      expect.objectContaining({ props: expect.objectContaining({ question_count: expect.any(Number) }) })
    )
  })

  it('saves edits again after going back from a direct publish that did not finish', async () => {
    mockApiClient.elections.publish.mockResolvedValue({ jobId: 'job' })
    renderWizard('/admin/processes/create')

    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('Voting Process Title'), 'My vote')
    await user.click(screen.getByRole('button', { name: 'Publish' }))
    await user.click(await screen.findByRole('button', { name: 'view-back' }))
    mockApiClient.elections.update.mockClear()

    await user.type(await screen.findByPlaceholderText('Voting Process Title'), ' edited')
    await user.tab()

    await waitFor(() => expect(mockApiClient.elections.update).toHaveBeenCalled())
  })

  it('leaves a manager with the toast, not the view, when the wallet is short', async () => {
    profileState.current = { organizations: [{ role: 'manager', organization: { address: '0xorg' } }] }
    mockApiClient.elections.publish.mockRejectedValue(
      new VocdoniApiError(402, { error: 'short' }, 'short', ApiErrorCode.PaymentRequired, {
        lines: [],
        totalCents: 5000,
        shortfallCents: 4000,
        balanceCents: 1000,
      })
    )
    renderWizard('/admin/processes/create')

    await userEvent.setup().type(screen.getByPlaceholderText('Voting Process Title'), 'My vote')
    await userEvent.setup().click(screen.getByRole('button', { name: 'Publish' }))

    await waitFor(() => expect(mockApiClient.elections.publish).toHaveBeenCalled())
    expect(screen.queryByText(/^view:/)).not.toBeInTheDocument()
  })
})
