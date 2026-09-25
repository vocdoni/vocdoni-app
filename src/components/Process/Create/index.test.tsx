import { act, renderHook } from '@testing-library/react'
import type { CreateVotingProcessRequest } from '@vocdoni/api-types'
import type { PropsWithChildren } from 'react'
import type { Blocker } from 'react-router'
import { useLocation, useNavigate } from 'react-router'
import { TestMemoryRouter } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { CensusTypes } from '../Census/CensusType'
import { defaultQuestion, Process, SelectorTypes } from './common'
import { buildCensusSpec, useConfirmOnNavigate, useFormToVotingProcessRequest } from './index'

const mockPermission = vi.fn()

const { mockUseBlocker } = vi.hoisted(() => ({ mockUseBlocker: vi.fn() }))

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useBlocker: () => mockUseBlocker(),
}))

vi.mock('~components/Auth/Subscription', () => ({
  useSubscription: () => ({
    permission: mockPermission,
  }),
}))

vi.mock('~utils/analytics', () => ({
  AnalyticsEvent: {},
}))

vi.mock('~components/AnalyticsProvider', () => ({
  useAnalytics: () => ({
    trackEvent: vi.fn(),
  }),
}))

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({
    bearedFetch: vi.fn(),
  }),
}))

vi.mock('~elements/dashboard/processes/drafts', () => ({
  useDeleteDraft: () => ({}),
}))

vi.mock('~src/providers/ApiClientProvider', () => ({
  useApiClient: vi.fn(),
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
})

describe('useFormToVotingProcessRequest', () => {
  let mockForm: Process

  beforeEach(() => {
    vi.clearAllMocks()
    setReactProvidersMock({
      useOrganization: vi.fn().mockReturnValue({ organization: { address: '0xorgaddr' } }),
    })

    mockPermission.mockReturnValue(true)

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
    it('includes streamUri when LiveStreaming permission is granted', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      mockPermission.mockReturnValue(true)
      const req = result.current({ ...mockForm, streamUri: 'https://stream.example.com/live' }, censusSpec())
      expect(req.streamUri).toBe('https://stream.example.com/live')
    })

    it('excludes streamUri when LiveStreaming permission is denied', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      mockPermission.mockReturnValue(false)
      const req = result.current({ ...mockForm, streamUri: 'https://stream.example.com/live' }, censusSpec())
      expect(req.streamUri).toBeUndefined()
    })

    it('coerces empty streamUri to undefined even with permission', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      mockPermission.mockReturnValue(true)
      const req = result.current({ ...mockForm, streamUri: '' }, censusSpec())
      expect(req.streamUri).toBeUndefined()
    })
  })

  describe('anonymous census gating', () => {
    const anonymousSpec = () => ({ ...censusSpec(), anonymous: true })

    it('keeps the anonymous flag when the plan has the feature', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      mockPermission.mockReturnValue(true)
      const req = result.current(mockForm, anonymousSpec())
      expect(req.census?.anonymous).toBe(true)
    })

    it('strips the anonymous flag when the plan lacks the feature', () => {
      // The backend refuses to publish a blind-CSP census on such a plan, but
      // only inside the publish job; the draft itself would save fine.
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      mockPermission.mockReturnValue(false)
      const req = result.current(mockForm, anonymousSpec())
      expect(req.census?.anonymous).toBeUndefined()
      expect(req.census?.groupId).toBe('test-group-id')
    })
  })

  describe('return type', () => {
    it('returns a plain object matching CreateVotingProcessRequest', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req: CreateVotingProcessRequest = result.current(mockForm, censusSpec())
      expect(req).toHaveProperty('orgAddress')
      expect(req).toHaveProperty('title')
      expect(req).toHaveProperty('questions')
      expect(Array.isArray(req.questions)).toBe(true)
    })
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
