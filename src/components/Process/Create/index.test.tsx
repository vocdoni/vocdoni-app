import { renderHook } from '@testing-library/react'
import type { CreateVotingProcessRequest } from '@vocdoni/api-types'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { CensusTypes } from '../Census/CensusType'
import { Process, SelectorTypes } from './common'
import { useFormToVotingProcessRequest } from './index'

const mockPermission = vi.fn()

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
    track: vi.fn(),
  }),
}))

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({
    bearedFetch: vi.fn(),
  }),
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
  useApiClient: vi.fn(),
}))

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
      extendedInfo: false,
      questionType: SelectorTypes.Single,
      questions: [
        {
          title: 'Test Question',
          description: 'Question description',
          options: [{ option: 'Option A' }, { option: 'Option B' }],
        },
      ],
      maxNumberOfChoices: null,
      minNumberOfChoices: null,
      resultVisibility: 'hidden',
      voterPrivacy: 'public',
      groupId: 'test-group-id',
      census: null,
      censusType: CensusTypes.CSP,
      streamUri: '',
      addresses: [],
      spreadsheet: null,
      weightedVote: false,
    }
  })

  const buildCensusSpec = (censusType = CensusTypes.CSP) => ({ groupId: 'test-group-id', weighted: undefined })

  describe('basic field mapping', () => {
    it('maps title to { default } language map', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current({ ...mockForm, title: 'My Custom Title' }, buildCensusSpec())
      expect(req.title).toEqual({ default: 'My Custom Title' })
    })

    it('maps description to { default } language map', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current({ ...mockForm, description: 'A description' }, buildCensusSpec())
      expect(req.description).toEqual({ default: 'A description' })
    })

    it('omits description when empty', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current({ ...mockForm, description: '' }, buildCensusSpec())
      expect(req.description).toBeUndefined()
    })

    it('uses organization address as orgAddress', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current(mockForm, buildCensusSpec())
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
      const req = result.current({ ...mockForm, resultVisibility: 'hidden' }, buildCensusSpec())
      expect(req.questions[0].secretUntilTheEnd).toBe(true)
    })

    it('sets secretUntilTheEnd false when resultVisibility is live', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current({ ...mockForm, resultVisibility: 'live' }, buildCensusSpec())
      expect(req.questions[0].secretUntilTheEnd).toBe(false)
    })
  })

  describe('date mapping', () => {
    it('omits startDate when autoStart is true', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current({ ...mockForm, autoStart: true }, buildCensusSpec())
      expect(req.startDate).toBeUndefined()
    })

    it('parses startDate/startTime as ISO string when autoStart is false', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current(
        { ...mockForm, autoStart: false, startDate: '2025-06-15', startTime: '14:30' },
        buildCensusSpec()
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
      const req = result.current(
        { ...mockForm, endDate: '2025-06-20', endTime: '18:00' },
        buildCensusSpec()
      )
      const d = new Date(req.endDate!)
      expect(d.getFullYear()).toBe(2025)
      expect(d.getMonth()).toBe(5)
      expect(d.getDate()).toBe(20)
      expect(d.getHours()).toBe(18)
    })

    it('falls back to start + 1 day when endDate is missing', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const before = new Date()
      const req = result.current({ ...mockForm, endDate: '', endTime: '' }, buildCensusSpec())
      const end = new Date(req.endDate!)
      expect(end.getTime()).toBeGreaterThan(before.getTime() + 23 * 60 * 60 * 1000)
      expect(end.getTime()).toBeLessThan(before.getTime() + 25 * 60 * 60 * 1000)
    })
  })

  describe('question mapping', () => {
    it('maps questions with { default } titles and choices', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current(mockForm, buildCensusSpec())
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
            { title: 'Q1', description: 'D1', options: [{ option: 'A' }, { option: 'B' }] },
            { title: 'Q2', description: 'D2', options: [{ option: 'C' }, { option: 'D' }] },
          ],
        },
        buildCensusSpec()
      )
      expect(req.questions).toHaveLength(2)
      expect(req.questions[0].title).toEqual({ default: 'Q1' })
      expect(req.questions[1].title).toEqual({ default: 'Q2' })
    })
  })

  describe('single-choice ballot protocol', () => {
    it('sets type to singleChoice', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current({ ...mockForm, questionType: SelectorTypes.Single }, buildCensusSpec())
      expect(req.questions[0].type).toBe('singleChoice')
      expect(req.questions[0].typeSetup).toBeUndefined()
    })

    it('sets maxCount 1, maxValue = options.length - 1', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current(mockForm, buildCensusSpec())
      const bp = req.questions[0].ballotProtocol!
      expect(bp.maxCount).toBe(1)
      expect(bp.maxValue).toBe(1) // 2 options → maxValue = 1
    })

    it('sets maxVoteOverwrites 0 for CSP census', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current({ ...mockForm, censusType: CensusTypes.CSP }, buildCensusSpec())
      expect(req.questions[0].ballotProtocol!.maxVoteOverwrites).toBe(0)
    })

    it('sets maxVoteOverwrites 10 for Spreadsheet census', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current({ ...mockForm, censusType: CensusTypes.Spreadsheet }, buildCensusSpec())
      expect(req.questions[0].ballotProtocol!.maxVoteOverwrites).toBe(10)
    })

    it('sets maxVoteOverwrites 10 for Web3 census', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current({ ...mockForm, censusType: CensusTypes.Web3 }, buildCensusSpec())
      expect(req.questions[0].ballotProtocol!.maxVoteOverwrites).toBe(10)
    })
  })

  describe('multi-choice ballot protocol', () => {
    it('sets type to multiChoice with typeSetup', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current(
        { ...mockForm, questionType: SelectorTypes.Multiple, maxNumberOfChoices: 2, minNumberOfChoices: 1 },
        buildCensusSpec()
      )
      expect(req.questions[0].type).toBe('multiChoice')
      expect(req.questions[0].typeSetup).toEqual({ maxChoices: 2, minChoices: 1, uniqueChoices: true })
    })

    it('uses options.length as maxChoices when maxNumberOfChoices is 0', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current(
        {
          ...mockForm,
          questionType: SelectorTypes.Multiple,
          maxNumberOfChoices: 0,
          minNumberOfChoices: 0,
          questions: [{ title: 'Q', description: '', options: [{ option: 'A' }, { option: 'B' }, { option: 'C' }, { option: 'D' }] }],
        },
        buildCensusSpec()
      )
      expect(req.questions[0].typeSetup!.maxChoices).toBe(4)
      expect(req.questions[0].ballotProtocol!.maxCount).toBe(4)
    })

    it('sets maxValue 1 and uniqueValues true for multiChoice', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current(
        { ...mockForm, questionType: SelectorTypes.Multiple, maxNumberOfChoices: 2, minNumberOfChoices: 0 },
        buildCensusSpec()
      )
      const bp = req.questions[0].ballotProtocol!
      expect(bp.maxValue).toBe(1)
      expect(bp.uniqueValues).toBe(true)
    })
  })

  describe('extended info (choice metadata)', () => {
    it('includes choice metadata when extendedInfo is true', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current(
        {
          ...mockForm,
          extendedInfo: true,
          questions: [
            {
              title: 'Q',
              description: 'D',
              options: [{ option: 'A', description: 'Opt desc', image: 'https://img.example/a.png' }],
            },
          ],
        },
        buildCensusSpec()
      )
      expect(req.questions[0].metadata).toBeDefined()
      expect((req.questions[0].metadata as any).choices[0].description).toBe('Opt desc')
      expect((req.questions[0].metadata as any).choices[0].image).toBe('https://img.example/a.png')
    })

    it('omits metadata when extendedInfo is false', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req = result.current({ ...mockForm, extendedInfo: false }, buildCensusSpec())
      expect(req.questions[0].metadata).toBeUndefined()
    })
  })

  describe('streamUri', () => {
    it('includes streamUri when LiveStreaming permission is granted', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      mockPermission.mockReturnValue(true)
      const req = result.current({ ...mockForm, streamUri: 'https://stream.example.com/live' }, buildCensusSpec())
      expect(req.streamUri).toBe('https://stream.example.com/live')
    })

    it('excludes streamUri when LiveStreaming permission is denied', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      mockPermission.mockReturnValue(false)
      const req = result.current({ ...mockForm, streamUri: 'https://stream.example.com/live' }, buildCensusSpec())
      expect(req.streamUri).toBeUndefined()
    })

    it('coerces empty streamUri to undefined even with permission', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      mockPermission.mockReturnValue(true)
      const req = result.current({ ...mockForm, streamUri: '' }, buildCensusSpec())
      expect(req.streamUri).toBeUndefined()
    })
  })

  describe('return type', () => {
    it('returns a plain object matching CreateVotingProcessRequest', () => {
      const { result } = renderHook(() => useFormToVotingProcessRequest())
      const req: CreateVotingProcessRequest = result.current(mockForm, buildCensusSpec())
      expect(req).toHaveProperty('orgAddress')
      expect(req).toHaveProperty('title')
      expect(req).toHaveProperty('questions')
      expect(Array.isArray(req.questions)).toBe(true)
    })
  })
})
