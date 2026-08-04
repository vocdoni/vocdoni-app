import { act, renderHook, waitFor } from '@testing-library/react'
import type { CreateVotingProcessRequest, VotingProcessQuestion, VotingProcessResponse } from '@vocdoni/api-types'
import { mockUseElection } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { useCloneAsDraft } from './use-clone-as-draft'

// Mock dependencies
const mockNavigate = vi.fn()
const mockToast = vi.fn()
const mockMutateAsync = vi.fn()
const mockPermission = vi.fn()
let mockElection: VotingProcessResponse | null = null

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  generatePath: vi.fn((path: string) => path.replace(':page', '1')),
  createSearchParams: vi.fn((params: any) => new URLSearchParams(params)),
}))

vi.mock('~components/Toast', () => ({
  useToast: () => mockToast,
}))

vi.mock('~components/Auth/Subscription', () => ({
  useSubscription: () => ({
    permission: mockPermission,
  }),
}))

vi.mock('../Create', () => ({
  useCreateProcess: () => ({
    mutateAsync: mockMutateAsync,
  }),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      if (!options?.defaultValue) return key
      // Simple template string replacement for {{ count }}
      return options.defaultValue.replace('{{ count }}', options.count)
    },
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}))

type MockChoice = {
  title: string
  description?: string
  image?: string
}

const SINGLE_CHOICE_PROTOCOL = {
  costExponent: 1,
  costFromWeight: false,
  maxVoteOverwrites: 0,
  maxCount: 1,
  maxValue: 1,
  maxTotalCost: 1,
  uniqueValues: false,
}

// Builds a question in the new voting-process shape. Per-choice extended info lives in
// `question.metadata.choices`, exactly as the create flow stores it.
function createMockQuestion(
  choices: MockChoice[],
  overrides: Partial<VotingProcessQuestion> = {}
): VotingProcessQuestion {
  const hasMeta = choices.some((c) => c.description !== undefined || c.image !== undefined)
  return {
    id: 'question-1',
    parentProcessId: 'process-1',
    title: { default: 'Test Question' },
    description: { default: 'Question Description' },
    choices: choices.map((choice, index) => ({ title: { default: choice.title }, value: index })),
    ballotProtocol: SINGLE_CHOICE_PROTOCOL,
    type: 'singlechoice',
    secretUntilTheEnd: false,
    status: 'ENDED',
    metadata: hasMeta
      ? { choices: choices.map((c, index) => ({ value: index, description: c.description, image: c.image })) }
      : undefined,
    ...overrides,
  }
}

// Helper function to create mock voting processes
function createMockElection(
  choices: MockChoice[],
  overrides: Partial<VotingProcessResponse> = {},
  questionOverrides: Partial<VotingProcessQuestion> = {}
): VotingProcessResponse {
  return {
    id: 'process-1',
    orgAddress: '0xorganization',
    title: { default: 'Test Election' },
    description: { default: 'Test Description' },
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-01-31T00:00:00Z',
    published: true,
    census: {},
    questions: [createMockQuestion(choices, questionOverrides)],
    ...overrides,
  }
}

const clonedRequest = (): CreateVotingProcessRequest => mockMutateAsync.mock.calls[0][0]

describe('useCloneAsDraft', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMutateAsync.mockReset()
    mockNavigate.mockReset()
    mockToast.mockReset()
    mockPermission.mockReturnValue(5) // Default draft limit
    mockElection = null
    setReactProvidersMock({
      useElection: () => mockUseElection({ election: mockElection }),
    })
  })

  const cloneWith = async (election: VotingProcessResponse) => {
    mockElection = election
    mockMutateAsync.mockResolvedValue('draft-123')

    const { result } = renderHook(() => useCloneAsDraft())
    await act(async () => {
      await result.current.cloneAsDraft()
    })

    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled())
  }

  describe('the cloned draft request', () => {
    it('copies the process content into a new draft owned by the same organization', async () => {
      await cloneWith(createMockElection([{ title: 'Option 1' }, { title: 'Option 2' }]))

      expect(clonedRequest()).toMatchObject({
        orgAddress: '0xorganization',
        title: { default: 'Test Election' },
        description: { default: 'Test Description' },
        questions: [
          {
            title: { default: 'Test Question' },
            description: { default: 'Question Description' },
            type: 'singlechoice',
            choices: [
              { title: { default: 'Option 1' }, value: 0 },
              { title: { default: 'Option 2' }, value: 1 },
            ],
          },
        ],
      })
    })

    it('schedules the clone afresh instead of copying the source dates', async () => {
      await cloneWith(createMockElection([{ title: 'Option 1' }]))

      expect(clonedRequest().startDate).toBeUndefined()
      expect(clonedRequest().endDate).toBeUndefined()
    })

    it('carries the per-choice extended info through the question metadata', async () => {
      await cloneWith(
        createMockElection([
          { title: 'Option 1', description: 'Why option 1', image: 'https://example.com/1.png' },
          { title: 'Option 2' },
        ])
      )

      expect(clonedRequest().questions[0].metadata).toEqual({
        choices: [
          { value: 0, description: 'Why option 1', image: 'https://example.com/1.png' },
          { value: 1, description: undefined, image: undefined },
        ],
      })
    })

    it('preserves the census configuration and secrecy of the source', async () => {
      await cloneWith(
        createMockElection(
          [{ title: 'Option 1' }],
          { census: { weighted: true, authFields: ['memberNumber'], twoFaFields: ['email'] } },
          { secretUntilTheEnd: true }
        )
      )

      expect(clonedRequest().census).toMatchObject({
        weighted: true,
        authFields: ['memberNumber'],
        twoFaFields: ['email'],
      })
      expect(clonedRequest().questions[0].secretUntilTheEnd).toBe(true)
    })

    it('preserves multi-choice limits', async () => {
      await cloneWith(
        createMockElection([{ title: 'A' }, { title: 'B' }, { title: 'C' }], undefined, {
          type: 'multichoice',
          typeSetup: { maxChoices: 2, minChoices: 1, uniqueChoices: true },
        })
      )

      expect(clonedRequest().questions[0]).toMatchObject({
        type: 'multichoice',
        // uniqueChoices sanitized to false even when the source process carried true.
        typeSetup: { maxChoices: 2, minChoices: 1, uniqueChoices: false },
      })
    })

    it('falls back to the raw ballot protocol for backend-derived questions with no named type', async () => {
      await cloneWith(createMockElection([{ title: 'A' }], undefined, { type: '' }))

      expect(clonedRequest().questions[0].type).toBeUndefined()
      expect(clonedRequest().questions[0].ballotProtocol).toEqual(SINGLE_CHOICE_PROTOCOL)
    })

    it('clones every question of a multi-question process', async () => {
      const election = createMockElection([{ title: 'A' }])
      election.questions = [
        createMockQuestion([{ title: 'A' }], { title: { default: 'First' } }),
        createMockQuestion([{ title: 'B' }], { title: { default: 'Second' } }),
      ]

      await cloneWith(election)

      expect(clonedRequest().questions).toHaveLength(2)
      expect(clonedRequest().questions.map((q) => q.title)).toEqual([{ default: 'First' }, { default: 'Second' }])
    })
  })

  describe('success flow', () => {
    it('shows a success toast and opens the new draft in the wizard', async () => {
      await cloneWith(createMockElection([{ title: 'Option 1' }]))

      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }))
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({ search: expect.stringContaining('draftId=draft-123') }),
        { replace: true }
      )
    })
  })

  describe('error flow', () => {
    it('shows an error toast and stays on the page when the clone fails', async () => {
      mockElection = createMockElection([{ title: 'Option 1' }])
      mockMutateAsync.mockRejectedValue(new Error('limit reached'))

      const { result } = renderHook(() => useCloneAsDraft())
      await act(async () => {
        await result.current.cloneAsDraft()
      })

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }))
      })
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('does nothing when the process has no questions', async () => {
      mockElection = createMockElection([{ title: 'Option 1' }], { questions: [] })

      const { result } = renderHook(() => useCloneAsDraft())
      await act(async () => {
        await result.current.cloneAsDraft()
      })

      expect(mockMutateAsync).not.toHaveBeenCalled()
    })

    it('does nothing when there is no election', async () => {
      mockElection = null

      const { result } = renderHook(() => useCloneAsDraft())
      await act(async () => {
        await result.current.cloneAsDraft()
      })

      expect(mockMutateAsync).not.toHaveBeenCalled()
    })
  })
})
